import Redis from "ioredis";

// Global singleton pattern for Next.js hot-reloading in development.
// Connects to self-hosted Redis on VPS (REDIS_URL or 127.0.0.1:6379)

const globalForRedis = globalThis as unknown as {
  redisInstance?: Redis;
};

function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error("REDIS_URL environment variable is required");
  }

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
    retryStrategy(times) {
      return Math.min(times * 50, 2000);
    },
  });

  client.on("error", (err) => {
    console.error("[Redis Client Error]", err?.message || err);
  });

  return client;
}

export const redis = globalForRedis.redisInstance ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redisInstance = redis;
}
