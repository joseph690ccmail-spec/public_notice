import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { getClientIp } from "@/lib/security/client-ip";
import { getSecurityEnv, requireEnv } from "@/lib/security/env";
import { UUID_V4_REGEX } from "@/lib/security/constants";

export interface ClientBinding {
  ipHash: string;
  fingerprintHash: string | null;
  createdAt: string;
}

export interface DraftBindingCheck {
  valid: boolean;
  flagged: boolean;
  reason?: string;
}

function bindingSecret(): string {
  const env = getSecurityEnv();
  if (env.SESSION_BINDING_SECRET) return env.SESSION_BINDING_SECRET;
  if (env.NODE_ENV === "production") {
    throw new Error("SESSION_BINDING_SECRET is required in production");
  }
  return "dev-only-session-binding-secret";
}

export function hashValue(value: string): string {
  return createHash("sha256")
    .update(`${bindingSecret()}:${value}`)
    .digest("hex");
}

export function generateDraftId(): string {
  return randomUUID();
}

export function isValidDraftId(draftId: string): boolean {
  return UUID_V4_REGEX.test(draftId);
}

export function getRequestFingerprint(request: NextRequest | Request): string | null {
  const fingerprint = request.headers.get("x-draft-fingerprint");
  if (!fingerprint) return null;
  const trimmed = fingerprint.trim();
  if (trimmed.length < 8 || trimmed.length > 128) return null;
  return trimmed;
}

export function createClientBinding(request: NextRequest | Request): ClientBinding {
  const ip = getClientIp(request);
  const fingerprint = getRequestFingerprint(request);

  return {
    ipHash: hashValue(ip),
    fingerprintHash: fingerprint ? hashValue(fingerprint) : null,
    createdAt: new Date().toISOString(),
  };
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Compares stored draft binding with the current request.
 * Flags (but does not block) when IP changes but fingerprint matches — useful for mobile handoff.
 */
export function verifyDraftBinding(
  stored: ClientBinding,
  request: NextRequest | Request,
  options?: { strictIpMatch?: boolean }
): DraftBindingCheck {
  const current = createClientBinding(request);
  const ipMatches = safeEqualHex(stored.ipHash, current.ipHash);

  const storedFp = stored.fingerprintHash;
  const currentFp = current.fingerprintHash;
  const fingerprintMatches =
    storedFp && currentFp ? safeEqualHex(storedFp, currentFp) : false;

  if (ipMatches) return { valid: true, flagged: false };
  if (fingerprintMatches) {
    return {
      valid: true,
      flagged: true,
      reason: "ip_changed_fingerprint_matched",
    };
  }

  if (options?.strictIpMatch) {
    return { valid: false, flagged: true, reason: "ip_mismatch" };
  }

  return { valid: false, flagged: true, reason: "session_binding_mismatch" };
}

export function assertProductionBindingSecret(): void {
  if (getSecurityEnv().NODE_ENV === "production") {
    requireEnv("SESSION_BINDING_SECRET");
  }
}