import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { getClientIp } from "@/lib/security/client-ip";
import {
  RATE_LIMITS,
  type RateLimitConfig,
  type RateLimitTier,
} from "@/lib/security/constants";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
}

interface BucketEntry {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, BucketEntry>();

function bucketKey(tier: RateLimitTier, identifier: string, pathname: string): string {
  return `${tier}:${identifier}:${pathname}`;
}

function pruneExpired(now: number): void {
  if (buckets.size < 10_000) return;
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > 120_000) buckets.delete(key);
  }
}

export function checkRateLimit(
  tier: RateLimitTier,
  identifier: string,
  pathname: string,
  override?: Partial<RateLimitConfig>
): RateLimitResult {
  const config = { ...RATE_LIMITS[tier], ...override };
  const now = Date.now();
  pruneExpired(now);

  const key = bucketKey(tier, identifier, pathname);
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= config.windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: now + config.windowMs,
    };
  }

  if (existing.count >= config.limit) {
    const resetAt = existing.windowStart + config.windowMs;
    return {
      allowed: false,
      limit: config.limit,
      remaining: 0,
      resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    allowed: true,
    limit: config.limit,
    remaining: config.limit - existing.count,
    resetAt: existing.windowStart + config.windowMs,
  };
}

export function rateLimitFromRequest(
  request: NextRequest,
  tier: RateLimitTier,
  override?: Partial<RateLimitConfig>
): RateLimitResult {
  const ip = getClientIp(request);
  const fingerprint = request.headers.get("x-draft-fingerprint");
  const identifier = fingerprint
    ? createHash("sha256").update(`${ip}:${fingerprint}`).digest("hex").slice(0, 16)
    : ip;

  return checkRateLimit(tier, identifier, request.nextUrl.pathname, override);
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.resetAt / 1000)),
    ...(result.retryAfterSeconds
      ? { "Retry-After": String(result.retryAfterSeconds) }
      : {}),
  };
}