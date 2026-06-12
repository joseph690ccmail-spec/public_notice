import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import type { AdminRole } from "@prisma/client";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE_SECONDS } from "@/lib/admin/constants";

export interface AdminSessionPayload {
  adminId: string;
  email: string;
  role: AdminRole;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production.");
  }
  return "dev-only-admin-session-secret";
}

function signPayload(payloadB64: string): string {
  return createHmac("sha256", getSessionSecret()).update(payloadB64).digest("base64url");
}

export function createAdminSessionToken(payload: Omit<AdminSessionPayload, "exp">): string {
  const exp = Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000;
  const body: AdminSessionPayload = { ...payload, exp };
  const payloadB64 = Buffer.from(JSON.stringify(body)).toString("base64url");
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): AdminSessionPayload | null {
  if (!token) return null;

  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = signPayload(payloadB64);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as AdminSessionPayload;

    if (!payload.adminId || !payload.email || !payload.role || !payload.exp) {
      return null;
    }

    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAdminSessionFromRequest(request: NextRequest): AdminSessionPayload | null {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

function serializeSessionCookie(value: string, maxAge: number): string {
  const parts = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function setAdminSessionCookie(response: Response, token: string): void {
  response.headers.append(
    "Set-Cookie",
    serializeSessionCookie(token, ADMIN_SESSION_MAX_AGE_SECONDS)
  );
}

export function clearAdminSessionCookie(response: Response): void {
  response.headers.append("Set-Cookie", serializeSessionCookie("", 0));
}