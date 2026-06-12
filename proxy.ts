import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { API_V1_PREFIX } from "@/lib/security/constants";
import { corsPreflightResponse, resolveCors } from "@/lib/security/cors";
import {
  getHelmetHeaders,
  setHelmetHeadersOnNextResponse,
} from "@/lib/security/helmet-headers";

/**
 * First-line defense for /api/v1 — Helmet headers + CORS preflight.
 * Tiered rate limiting runs in route handlers (lib/api/handler.ts).
 */
export function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith(API_V1_PREFIX)) {
    return NextResponse.next();
  }

  const apiHelmet = getHelmetHeaders("api");

  const preflight = corsPreflightResponse(request);
  if (preflight) {
    const response = new NextResponse(preflight.body, {
      status: preflight.status,
      headers: preflight.headers,
    });
    setHelmetHeadersOnNextResponse(response, "api");
    return response;
  }

  const { allowed, origin } = resolveCors(request);
  if (!allowed) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Origin not allowed." } },
      { status: 403, headers: apiHelmet }
    );
  }

  const response = NextResponse.next();
  setHelmetHeadersOnNextResponse(response, "api");
  if (origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
  }
  return response;
}

export const config = {
  matcher: "/api/v1/:path*",
};