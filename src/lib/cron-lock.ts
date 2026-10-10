import { redis } from "@/lib/redis";

const RELEASE_IF_OWNER = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
end
return 0
`;

export type CronLock = { acquired: boolean; release: () => Promise<void> };

export async function acquireCronLock(name: string, ttlSeconds: number): Promise<CronLock> {
  const key = `cron_lock:${name}`;
  const token = `${Date.now()}:${Math.random().toString(36).slice(2)}`;

  let ok: string | null = null;
  try {
    ok = await redis.set(key, token, "EX", ttlSeconds, "NX");
  } catch (err) {
    console.warn(`[cron-lock] could not acquire ${name}, proceeding without lock:`, err instanceof Error ? err.message : err);
    return { acquired: true, release: async () => {} };
  }

  if (ok !== "OK") {
    return { acquired: false, release: async () => {} };
  }

  return {
    acquired: true,
    release: async () => {
      try {
        await redis.eval(RELEASE_IF_OWNER, 1, key, token);
      } catch (err) {
        console.warn(`[cron-lock] failed to release ${name}:`, err instanceof Error ? err.message : err);
      }
    },
  };
}