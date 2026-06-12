import type { NextRequest } from "next/server";
import { getCorsAllowedOrigins } from "@/lib/security/env";

export interface CorsResult {
  allowed: boolean;
  origin: string | null;
}

export function resolveCors(request: NextRequest | Request): CorsResult {
  const origin = request.headers.get("origin");
  if (!origin) {
    return { allowed: true, origin: null };
  }

  const allowedOrigins = getCorsAllowedOrigins();
  const allowed =
    allowedOrigins.includes(origin) ||
    (process.env.NODE_ENV === "development" && origin.startsWith("http://localhost"));

  return { allowed, origin };
}

export function corsPreflightResponse(request: NextRequest | Request): Response | null {
  if (request.method !== "OPTIONS") return null;

  const { allowed, origin } = resolveCors(request);
  if (!allowed || !origin) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Draft-Fingerprint, X-Paystack-Signature",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}

export function applyCorsHeaders(response: Response, origin: string | null): Response {
  if (!origin) return response;

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Vary", "Origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}