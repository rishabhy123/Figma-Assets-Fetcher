import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 1,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn("⚠️ Redis connection failed after 3 retries. Falling back to in-memory storage.");
      return null; // Stop retrying
    }
    return Math.min(times * 100, 2000);
  }
});

let isRedisConnected = false;
const memoryCache = new Map();

redis.on("connect", () => {
  isRedisConnected = true;
  console.log("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  isRedisConnected = false;
  console.error("❌ Redis connection error:", err.message);
});

export const getCache = async (key) => {
  try {
    if (isRedisConnected) {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    }
    return memoryCache.get(key) || null;
  } catch (err) {
    console.error("Cache get error:", err);
    return memoryCache.get(key) || null;
  }
};

export const setCache = async (key, value, ttl = parseInt(process.env.CACHE_TTL) || 86400) => {
  try {
    if (isRedisConnected) {
      await redis.setex(key, ttl, JSON.stringify(value));
    }
    // Always update memory cache as a backup
    memoryCache.set(key, value);
    // Simple TTL for memory cache
    setTimeout(() => memoryCache.delete(key), ttl * 1000);
  } catch (err) {
    console.error("Cache set error:", err);
    memoryCache.set(key, value);
  }
};

export const incrementCounter = async (key) => {
  try {
    if (isRedisConnected) {
      return await redis.incr(key);
    }
    const current = memoryCache.get(key) || 0;
    const newVal = current + 1;
    memoryCache.set(key, newVal);
    return newVal;
  } catch (err) {
    console.error("Counter increment error:", err);
    const current = memoryCache.get(key) || 0;
    const newVal = current + 1;
    memoryCache.set(key, newVal);
    return newVal;
  }
};

export const getCounter = async (key) => {
  try {
    if (isRedisConnected) {
      const count = await redis.get(key);
      return count ? parseInt(count) : 0;
    }
    return memoryCache.get(key) || 0;
  } catch (err) {
    console.error("Counter get error:", err);
    return memoryCache.get(key) || 0;
  }
};

export const resetCounter = async (key) => {
  try {
    if (isRedisConnected) {
      await redis.del(key);
    }
    memoryCache.delete(key);
  } catch (err) {
    console.error("Counter reset error:", err);
    memoryCache.delete(key);
  }
};

export default redis;
