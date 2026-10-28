import { and, eq, inArray, or } from "drizzle-orm";
import { db, schema } from "@/lib/db";

const IMAGE_HOST_BASE = "https://host.iuno.lol/";

export function isOwnHost(host: string): boolean {
  return (
    host === "iuno.lol" ||
    host.endsWith(".iuno.lol") ||
    host === "localhost" ||
    host.startsWith("[") ||
    /^[\d.]+$/.test(host)
  );
}

export async function getDomainByHost(host: string) {
  const [row] = await db
    .select({ id: schema.userDomains.id, type: schema.userDomains.type })
    .from(schema.userDomains)
    .where(and(eq(schema.userDomains.hostname, host), eq(schema.userDomains.status, "active")))
    .limit(1);
  return row ?? null;
}

export async function usesProfileDomain(handle: string, domainId: number): Promise<boolean> {
  const aliasOwner = db
    .select({ userId: schema.userAliases.userId })
    .from(schema.userAliases)
    .where(eq(schema.userAliases.alias, handle));
  const [row] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(
      and(
        eq(schema.users.profileDomainId, domainId),
        or(eq(schema.users.username, handle), inArray(schema.users.id, aliasOwner)),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function usesImageDomain(publicName: string, domainId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: schema.imageHostFiles.id })
    .from(schema.imageHostFiles)
    .innerJoin(schema.users, eq(schema.users.id, schema.imageHostFiles.userId))
    .where(and(eq(schema.imageHostFiles.url, `${IMAGE_HOST_BASE}${publicName}`), eq(schema.users.imageDomainId, domainId)))
    .limit(1);
  return Boolean(row);
}

export { IMAGE_HOST_BASE as DEFAULT_IMAGE_HOST };
