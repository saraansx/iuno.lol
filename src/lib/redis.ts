import Redis from "ioredis";

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
