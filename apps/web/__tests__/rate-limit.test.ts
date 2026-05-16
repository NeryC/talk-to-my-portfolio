import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rateLimit } from "../lib/rate-limit";

describe("rateLimit", () => {
  const savedUrl = process.env.UPSTASH_REDIS_REST_URL;
  const savedToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterEach(() => {
    if (savedUrl) process.env.UPSTASH_REDIS_REST_URL = savedUrl;
    if (savedToken) process.env.UPSTASH_REDIS_REST_TOKEN = savedToken;
  });

  it("allows all requests when Upstash is not configured", async () => {
    const result = await rateLimit("test-key");
    expect(result.allowed).toBe(true);
    expect(result.retryAfter).toBeUndefined();
  });
});
