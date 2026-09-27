import { NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { inArray, isNotNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { isAuthorizedCron } from '@/lib/cron-auth'
import { ROLE_BADGE_MAP, BADGE_ROLE_MAP } from '@/lib/badge-roles'
import { isPremiumActive } from '@/lib/premium'
import { BADGES, EARLY_CUTOFF_UID } from '@/app/dashboard/customize/badges/badges-data'
import { SITE_CONFIG } from '@/lib/config'
import { syncAllRecruiterInvites } from '@/lib/recruiter'

export const maxDuration = 300;

const MAPPED_BADGE_IDS = [...new Set(Object.values(ROLE_BADGE_MAP)), 'early'];

function isComingSoon(badgeId: string): boolean {
  const badge = (BADGES as readonly { id: string }[]).find((b) => b.id === badgeId) as
    | { pill?: string }
    | undefined;
  return !!badge && 'pill' in badge;
}

async function fetchAllMemberRoles(
  guildId: string,
  botToken: string
): Promise<Map<string, string[]>> {
  const rolesByUser = new Map<string, string[]>();
  let after: string | null = null;

  while (true) {
    const url = new URL(`https://discord.com/api/v10/guilds/${guildId}/members`);
    url.searchParams.set('limit', '1000');
    if (after) url.searchParams.set('after', after);

    const res = await fetch(url, {
      headers: { Authorization: `Bot ${botToken}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`Discord API error (${res.status})`);

    const members = (await res.json()) as Array<{ user?: { id?: string }; roles?: unknown }>;
    if (!Array.isArray(members) || members.length === 0) break;

    for (const m of members) {
      const id = m?.user?.id;
      if (typeof id === 'string') {
        rolesByUser.set(
          id,
          Array.isArray(m.roles) ? (m.roles as unknown[]).map(String) : []
        );
      }
    }

    if (members.length < 1000) break;
    after = members[members.length - 1]?.user?.id ?? null;
    if (!after) break;
  }

  return rolesByUser;
}

async function purgeProfiles(usernames: string[]) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  if (!token || !zoneId || usernames.length === 0) return;

  const files = [...new Set(usernames)].map(
    (u) => `${SITE_CONFIG.url}/${encodeURIComponent(u)}`
  );
  for (let i = 0; i < files.length; i += 30) {
    try {
      await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: files.slice(i, i + 30) }),
        signal: AbortSignal.timeout(8000),
      });
    } catch (err) {
      console.error('[cron/sync-badges] cloudflare purge error:', err);
    }
  }
}

export async function GET(request: Request) {
  return handleSync(request);
}

export async function POST(request: Request) {
  return handleSync(request);
}

async function handleSync(request: Request) {
  if (!isAuthorizedCron(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!botToken || !guildId) {
    return NextResponse.json({ error: 'Discord sync is not configured' }, { status: 500 });
  }

  try {
    const memberRoles = await fetchAllMemberRoles(guildId, botToken);

    const users = await db
      .select({ id: schema.users.id, username: schema.users.username, discordId: schema.users.discordId, isPremium: schema.users.isPremium, premiumExpiresAt: schema.users.premiumExpiresAt })
      .from(schema.users)
      .where(isNotNull(schema.users.discordId));
    const premiumByUserId = new Map(
      users.map((u) => [u.id, isPremiumActive({ isPremium: u.isPremium, premiumExpiresAt: u.premiumExpiresAt })])
    );
    const userByDiscordId = new Map(
      users
        .filter((u): u is typeof u & { discordId: string } => !!u.discordId)
        .map((u) => [u.discordId, u])
    );
    const discordIdByUserId = new Map(
      users
        .filter((u): u is typeof u & { discordId: string } => !!u.discordId)
        .map((u) => [u.id, u.discordId])
    );

    const rows = await db
      .select({
        id: schema.userBadges.id,
        userId: schema.userBadges.userId,
        badgeId: schema.userBadges.badgeId,
      })
      .from(schema.userBadges)
      .where(inArray(schema.userBadges.badgeId, MAPPED_BADGE_IDS));

    const existingKeys = new Set(rows.map((r) => `${r.userId}:${r.badgeId}`));
    const usernameById = new Map(users.map((u) => [u.id, u.username] as const));

    const toDeleteIds: number[] = [];
    const toInsert: { userId: number; badgeId: string }[] = [];
    const changedUsernames = new Set<string>();

    const premiumRoleRemovals: Array<{ discordId: string; roleId: string }> = [];
    for (const row of rows) {
      if (row.badgeId === 'early') {
        if (row.userId > EARLY_CUTOFF_UID) {
          toDeleteIds.push(row.id);
          const name = usernameById.get(row.userId);
          if (name) changedUsernames.add(name);
        }
        continue;
      }
      const roleId = BADGE_ROLE_MAP[row.badgeId];
      if (!roleId) continue;
      if (row.badgeId === 'premium' && !premiumByUserId.get(row.userId)) {
        toDeleteIds.push(row.id);
        const name = usernameById.get(row.userId);
        if (name) changedUsernames.add(name);
        const discordId = discordIdByUserId.get(row.userId);
        if (discordId) premiumRoleRemovals.push({ discordId, roleId });
        continue;
      }
      const discordId = discordIdByUserId.get(row.userId);
      const roles = discordId ? memberRoles.get(discordId) : undefined;
      if (!roles || !roles.includes(roleId)) {
        toDeleteIds.push(row.id);
        const name = usernameById.get(row.userId);
        if (name) changedUsernames.add(name);
      }
    }

    for (const [discordId, roles] of memberRoles) {
      const user = userByDiscordId.get(discordId);
      if (!user) continue;
      const premiumActive = premiumByUserId.get(user.id) ?? false;
      for (const roleId of roles) {
        const badgeId = ROLE_BADGE_MAP[roleId];
        if (!badgeId || isComingSoon(badgeId)) continue;
        if (badgeId === 'premium' && !premiumActive) continue;
        const key = `${user.id}:${badgeId}`;
        if (!existingKeys.has(key)) {
          existingKeys.add(key);
          toInsert.push({ userId: user.id, badgeId });
          changedUsernames.add(user.username);
        }
      }
      if (user.id <= EARLY_CUTOFF_UID && !existingKeys.has(`${user.id}:early`)) {
        existingKeys.add(`${user.id}:early`);
        toInsert.push({ userId: user.id, badgeId: 'early' });
        changedUsernames.add(user.username);
      }
    }

    if (toDeleteIds.length > 0) {
      const CHUNK = 500;
      for (let i = 0; i < toDeleteIds.length; i += CHUNK) {
        await db.delete(schema.userBadges).where(inArray(schema.userBadges.id, toDeleteIds.slice(i, i + CHUNK)));
      }
    }
    if (toInsert.length > 0) {
      const CHUNK = 500;
      for (let i = 0; i < toInsert.length; i += CHUNK) {
        await db.insert(schema.userBadges).values(
          toInsert.slice(i, i + CHUNK).map((r) => ({
            userId: r.userId,
            badgeId: r.badgeId,
            equipped: false,
            equippedAt: null,
          }))
        );
      }
    }

    for (const name of changedUsernames) {
      revalidatePath(`/${name}`);
    }
    await purgeProfiles([...changedUsernames]);

    if (premiumRoleRemovals.length > 0) {
      await Promise.allSettled(
        premiumRoleRemovals.map(({ discordId, roleId }) =>
          fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bot ${botToken}` },
            signal: AbortSignal.timeout(8000),
          })
        )
      );
    }

    let recruiter: { checked: number; granted: number } | { error: string } = { checked: 0, granted: 0 };
    try {
      recruiter = await syncAllRecruiterInvites();
    } catch (error) {
      recruiter = { error: error instanceof Error ? error.message : "recruiter sync failed" };
    }

    return NextResponse.json({
      success: true,
      membersChecked: memberRoles.size,
      added: toInsert.length,
      removed: toDeleteIds.length,
      recruiter,
    });
  } catch (error) {
    console.error('[cron/sync-badges] failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
