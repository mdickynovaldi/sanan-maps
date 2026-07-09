import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = redisUrl && redisToken
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

// Fallback in-memory hanya efektif untuk dev/single-process. Di serverless
// (Vercel dsb.) tiap instance punya Map sendiri sehingga rate limit tidak
// benar-benar berlaku — peringatkan sekali saat produksi tanpa Redis.
if (!redis && process.env.NODE_ENV === "production") {
  console.warn(
    "[rate-limit] Upstash Redis tidak dikonfigurasi (UPSTASH_REDIS_REST_URL/TOKEN). " +
      "Rate limiting hanya memakai fallback in-memory yang TIDAK aman di serverless.",
  );
}

const inMemory = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  key: string,
  identifier: string,
  limit = 10,
  windowSeconds = 60,
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const id = `${key}:${identifier}`;

  if (redis) {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
      prefix: `sanan:${key}`,
    });

    const res = await ratelimit.limit(identifier);
    return {
      success: res.success,
      remaining: res.remaining,
      reset: res.reset,
    };
  }

  // Fallback for local/dev without Upstash
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const item = inMemory.get(id);

  if (!item || now > item.resetAt) {
    inMemory.set(id, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }

  if (item.count >= limit) {
    return { success: false, remaining: 0, reset: item.resetAt };
  }

  item.count += 1;
  inMemory.set(id, item);
  return { success: true, remaining: limit - item.count, reset: item.resetAt };
}
