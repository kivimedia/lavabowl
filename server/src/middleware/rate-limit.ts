/**
 * Simple in-memory rate limiter for the Hono API.
 * For production, use Redis-based rate limiting (e.g., upstash/ratelimit).
 */

import type { Context, Next } from "hono";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  keyPrefix?: string; // Prefix for the rate limit key
}

/**
 * Create a rate limiting middleware.
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyPrefix = "rl" } = options;

  return async (c: Context, next: Next) => {
    // Use IP address or user ID as the key
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "unknown";

    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    let entry = store.get(key);

    if (!entry || entry.resetTime < now) {
      entry = { count: 0, resetTime: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    // Set rate limit headers
    c.header("X-RateLimit-Limit", max.toString());
    c.header(
      "X-RateLimit-Remaining",
      Math.max(0, max - entry.count).toString()
    );
    c.header(
      "X-RateLimit-Reset",
      Math.ceil(entry.resetTime / 1000).toString()
    );

    if (entry.count > max) {
      return c.json(
        { error: "Too many requests, please try again later" },
        429
      );
    }

    await next();
  };
}

/**
 * Pre-configured rate limits for different endpoints.
 */

// General API: 100 requests per minute
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyPrefix: "general",
});

// Auth endpoints: 10 per minute (prevent brute force)
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyPrefix: "auth",
});

// Fix submission: 5 per minute (prevent spam)
export const fixSubmitRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyPrefix: "fix-submit",
});

// Webhook: 50 per minute
export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  keyPrefix: "webhook",
});
