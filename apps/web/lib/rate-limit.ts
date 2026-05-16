import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
}

let _limiter: Ratelimit | null = null;
let _initialized = false;

function getLimiter(): Ratelimit | null {
  if (_initialized) return _limiter;
  _initialized = true;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    // No-op fallback when Upstash isn't configured (dev / preview without rate-limit vars).
    return null;
  }
  const redis = new Redis({ url, token });
  _limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    prefix: "talk-to-my-portfolio",
  });
  return _limiter;
}

export async function rateLimit(key: string): Promise<RateLimitResult> {
  const limiter = getLimiter();
  if (!limiter) return { allowed: true };
  const r = await limiter.limit(key);
  return { allowed: r.success, retryAfter: r.reset };
}
