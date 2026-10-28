import "server-only";
import { and, asc, eq, inArray, or } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { IMAGE_HOST_BASE } from "@/lib/cdn";

export const DOMAIN_TARGET = "domains.iuno.lol";
export const HOSTNAME_RE = /^(?=.{4,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export type DomainType = "profile" | "image_host";
export type DomainRow = {
  id: number;
  hostname: string;
  type: DomainType;
  visibility: "private" | "public";
  status: "pending" | "active";
  dcvTarget: string | null;
};
export type AvailableDomain = { id: number; hostname: string; type: DomainType; owner: string; own: boolean };
export type DomainState = {
  username: string;
  tokens: number;
  domains: DomainRow[];
  available: AvailableDomain[];
  profileDomainId: number | null;
  imageDomainId: number | null;
};

async function cf<T>(path: string, init?: RequestInit, gone?: T): Promise<T | null> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  if (!token || !zoneId) {
    console.error("[domains] CLOUDFLARE_API_TOKEN or CLOUDFLARE_ZONE_ID missing");
    return null;
  }
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/custom_hostnames${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 404 && gone !== undefined) return gone;
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.success) {
      console.error("[domains] cloudflare error:", init?.method ?? "GET", path, res.status, JSON.stringify(body?.errors ?? body).slice(0, 300));
      return null;
    }
    return body.result as T;
  } catch (err) {
    console.error("[domains] cloudflare request failed:", init?.method ?? "GET", path, err);
    return null;
  }
}

type CfHostname = {
  id: string;
  status: string;
  ssl?: { status?: string };
};

export const cfCreateHostname = (hostname: string) =>
  cf<CfHostname>("", { method: "POST", body: JSON.stringify({ hostname, ssl: { method: "txt", type: "dv" } }) });
export const cfGetHostname = (id: string) => cf<CfHostname>(`/${encodeURIComponent(id)}`);
export const cfDeleteHostname = (id: string) => cf<unknown>(`/${encodeURIComponent(id)}`, { method: "DELETE" }, {});

export async function imageShareBase(userId: number): Promise<string> {
  const [row] = await db
    .select({ hostname: schema.userDomains.hostname })
    .from(schema.users)
    .innerJoin(
      schema.userDomains,
      and(eq(schema.userDomains.id, schema.users.imageDomainId), eq(schema.userDomains.status, "active")),
    )
    .where(eq(schema.users.id, userId))
    .limit(1);
  return row ? `https://${row.hostname}/` : IMAGE_HOST_BASE;
}

export function toShareUrl(url: string, base: string): string {
  return url.startsWith(IMAGE_HOST_BASE) ? base + url.slice(IMAGE_HOST_BASE.length) : url;
}

export async function deleteUserDomains(userId: number): Promise<void> {
  const rows = await db.select({ cfId: schema.userDomains.cfId }).from(schema.userDomains).where(eq(schema.userDomains.userId, userId));
  await Promise.all(rows.map((r) => (r.cfId ? cfDeleteHostname(r.cfId) : null)));
  const ids = db.select({ id: schema.userDomains.id }).from(schema.userDomains).where(eq(schema.userDomains.userId, userId));
  await db.update(schema.users).set({ profileDomainId: null }).where(inArray(schema.users.profileDomainId, ids));
  await db.update(schema.users).set({ imageDomainId: null }).where(inArray(schema.users.imageDomainId, ids));
}

export async function domainState(userId: number): Promise<DomainState> {
  const d = schema.userDomains;
  const [[user], own, available] = await Promise.all([
    db
      .select({
        username: schema.users.username,
        tokens: schema.users.domainTokens,
        profileDomainId: schema.users.profileDomainId,
        imageDomainId: schema.users.imageDomainId,
      })
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1),
    db
      .select({ id: d.id, hostname: d.hostname, type: d.type, visibility: d.visibility, status: d.status })
      .from(d)
      .where(eq(d.userId, userId))
      .orderBy(asc(d.createdAt), asc(d.id)),
    db
      .select({ id: d.id, hostname: d.hostname, type: d.type, owner: schema.users.username, ownerId: d.userId })
      .from(d)
      .innerJoin(schema.users, eq(schema.users.id, d.userId))
      .where(and(eq(d.status, "active"), or(eq(d.visibility, "public"), eq(d.userId, userId))))
      .orderBy(asc(d.hostname)),
  ]);
  const dcv = process.env.CLOUDFLARE_DCV_ID;
  return {
    username: user?.username ?? "",
    tokens: user?.tokens ?? 0,
    profileDomainId: user?.profileDomainId ?? null,
    imageDomainId: user?.imageDomainId ?? null,
    domains: own.map((r) => ({ ...r, dcvTarget: dcv ? `${r.hostname}.${dcv}.dcv.cloudflare.com` : null })),
    available: available.map(({ ownerId, ...r }) => ({ ...r, own: ownerId === userId })),
  };
}
