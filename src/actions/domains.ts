"use server";

import { and, eq, lt, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth/session";
import { accountActionRateLimit } from "@/lib/rate-limit";
import { UserFacingError } from "@/lib/errors";
import { revalidateProfile } from "@/app/[username]/profile-data";
import { purgeCloudflareProfileCache } from "@/lib/cloudflare";
import { isOwnHost } from "@/lib/features/domain-host";
import {
  HOSTNAME_RE,
  cfCreateHostname,
  cfDeleteHostname,
  cfGetHostname,
  domainState,
  type DomainState,
  type DomainType,
} from "@/lib/features/domains";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const PENDING_HOURS = 24;

async function requireUser() {
  const userId = await getSessionUserId();
  if (!userId) throw new UserFacingError("Please sign in again.");
  const rate = await accountActionRateLimit(userId);
  if (!rate.ok) throw new UserFacingError("You're doing that too fast. Please wait a bit.");
  return userId;
}

function fail(err: unknown): { ok: false; error: string } {
  if (err instanceof UserFacingError) return { ok: false, error: err.message };
  const code = (err as { code?: string; cause?: { code?: string } })?.code ?? (err as { cause?: { code?: string } })?.cause?.code;
  if (code === "ER_DUP_ENTRY") {
    return { ok: false, error: `That domain is already added on iuno.lol. If it's yours and nobody verifies it, you can add it after ${PENDING_HOURS} hours.` };
  }
  console.error("[domains] action failed:", err);
  return { ok: false, error: "Something went wrong. Please try again." };
}

async function ownDomain(userId: number, id: number) {
  const [row] = await db
    .select()
    .from(schema.userDomains)
    .where(and(eq(schema.userDomains.id, Number(id)), eq(schema.userDomains.userId, userId)))
    .limit(1);
  if (!row) throw new UserFacingError("Domain not found.");
  return row;
}

async function releaseStalePending(hostname: string) {
  const cutoff = new Date(Date.now() - PENDING_HOURS * 60 * 60 * 1000);
  const d = schema.userDomains;
  const [stale] = await db
    .select({ id: d.id, userId: d.userId, cfId: d.cfId })
    .from(d)
    .where(and(eq(d.hostname, hostname), eq(d.status, "pending"), lt(d.createdAt, cutoff)))
    .limit(1);
  if (!stale) return;
  if (stale.cfId && !(await cfDeleteHostname(stale.cfId))) {
    throw new UserFacingError("Couldn't set up this domain right now. Please try again.");
  }
  await db.delete(d).where(and(eq(d.id, stale.id), eq(d.status, "pending")));
  console.log(`[domains] freed ${hostname}: pending for over ${PENDING_HOURS} hours (user ${stale.userId})`);
}

async function refreshUser(userId: number) {
  const [u] = await db.select({ username: schema.users.username }).from(schema.users).where(eq(schema.users.id, userId)).limit(1);
  if (u?.username) {
    revalidateProfile(u.username);
    await purgeCloudflareProfileCache(u.username);
  }
}

export async function addDomain(raw: string, type: DomainType, visibility: "private" | "public"): Promise<Result<DomainState>> {
  try {
    const userId = await requireUser();
    const hostname = String(raw ?? "").trim().toLowerCase().replace(/\.$/, "");
    if (!HOSTNAME_RE.test(hostname)) throw new UserFacingError("Enter a valid domain, like bio.yourname.com.");
    if (isOwnHost(hostname)) throw new UserFacingError("You can't add an iuno.lol domain.");
    if (type !== "profile" && type !== "image_host") throw new UserFacingError("Pick a domain type.");
    if (visibility !== "private" && visibility !== "public") throw new UserFacingError("Pick a visibility.");
    await releaseStalePending(hostname);

    const id = await db.transaction(async (tx) => {
      const [user] = await tx
        .select({ tokens: schema.users.domainTokens })
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .for("update");
      const [{ used }] = await tx
        .select({ used: sql<number>`COUNT(*)` })
        .from(schema.userDomains)
        .where(eq(schema.userDomains.userId, userId));
      if (Number(used) >= (user?.tokens ?? 0)) throw new UserFacingError("No free domain slot. Buy a Custom Domain first.");
      const [res] = await tx.insert(schema.userDomains).values({ userId, hostname, type, visibility });
      return res.insertId;
    });

    const created = await cfCreateHostname(hostname);
    if (!created) {
      await db.delete(schema.userDomains).where(eq(schema.userDomains.id, id));
      throw new UserFacingError("Couldn't set up this domain right now. Please try again.");
    }
    await db.update(schema.userDomains).set({ cfId: created.id }).where(eq(schema.userDomains.id, id));
    console.log(`[domains] user ${userId} added ${hostname} (${type}, ${visibility})`);
    return { ok: true, data: await domainState(userId) };
  } catch (err) {
    return fail(err);
  }
}

export async function verifyDomain(id: number): Promise<Result<DomainState & { active: boolean }>> {
  try {
    const userId = await requireUser();
    const row = await ownDomain(userId, id);
    let active = row.status === "active";
    if (!active) {
      const cfRow = row.cfId ? await cfGetHostname(row.cfId) : null;
      active = cfRow?.status === "active" && cfRow.ssl?.status === "active";
      console.log(`[domains] verify ${row.hostname}: hostname=${cfRow?.status ?? "missing"} ssl=${cfRow?.ssl?.status ?? "missing"}`);
      if (active) await db.update(schema.userDomains).set({ status: "active" }).where(eq(schema.userDomains.id, row.id));
    }
    return { ok: true, data: { ...(await domainState(userId)), active } };
  } catch (err) {
    return fail(err);
  }
}

export async function removeDomain(id: number): Promise<Result<DomainState>> {
  try {
    const userId = await requireUser();
    const row = await ownDomain(userId, id);
    if (row.cfId && !(await cfDeleteHostname(row.cfId))) {
      throw new UserFacingError("Couldn't remove this domain right now. Please try again.");
    }
    const users = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(or(eq(schema.users.profileDomainId, row.id), eq(schema.users.imageDomainId, row.id)));
    await db.transaction(async (tx) => {
      await tx.update(schema.users).set({ profileDomainId: null }).where(eq(schema.users.profileDomainId, row.id));
      await tx.update(schema.users).set({ imageDomainId: null }).where(eq(schema.users.imageDomainId, row.id));
      await tx.delete(schema.userDomains).where(eq(schema.userDomains.id, row.id));
    });
    await Promise.all(users.map((u) => refreshUser(u.id)));
    console.log(`[domains] user ${userId} removed ${row.hostname}; ${users.length} user(s) moved back to defaults`);
    return { ok: true, data: await domainState(userId) };
  } catch (err) {
    return fail(err);
  }
}

export async function setDomainUse(type: DomainType, id: number | null): Promise<Result<DomainState>> {
  try {
    const userId = await requireUser();
    if (id !== null) {
      const [row] = await db
        .select({ id: schema.userDomains.id })
        .from(schema.userDomains)
        .where(
          and(
            eq(schema.userDomains.id, Number(id)),
            eq(schema.userDomains.type, type),
            eq(schema.userDomains.status, "active"),
            or(eq(schema.userDomains.visibility, "public"), eq(schema.userDomains.userId, userId)),
          ),
        )
        .limit(1);
      if (!row) throw new UserFacingError("That domain isn't available.");
    }
    await db
      .update(schema.users)
      .set(type === "profile" ? { profileDomainId: id } : { imageDomainId: id })
      .where(eq(schema.users.id, userId));
    if (type === "profile") await refreshUser(userId);
    return { ok: true, data: await domainState(userId) };
  } catch (err) {
    return fail(err);
  }
}
