import type { HelmetHeaderVariant } from "@/lib/security/helmet";

/**
 * Edge-safe Helmet header maps (derived from lib/security/helmet.ts options).
 * Proxy and route handlers import from here — not from the helmet package directly.
 */
export const HELMET_PAGE_HEADERS: Record<string, string> = {
  "Content-Security-Policy":
    "default-src 'self';script-src 'self' 'unsafe-inline' 'unsafe-eval';style-src 'self' 'unsafe-inline';img-src 'self' data: blob: https:;font-src 'self' data:;connect-src 'self';frame-ancestors 'none';base-uri 'self';form-action 'self';object-src 'none';script-src-attr 'none';upgrade-insecure-requests",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-site",
  "Origin-Agent-Cluster": "?1",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-DNS-Prefetch-Control": "off",
  "X-Download-Options": "noopen",
  "X-Frame-Options": "DENY",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-XSS-Protection": "0",
};

export const HELMET_API_HEADERS: Record<string, string> = {
  "Content-Security-Policy":
    "default-src 'none';frame-ancestors 'none';base-uri 'self';font-src 'self' https: data:;form-action 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-site",
  "Origin-Agent-Cluster": "?1",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-DNS-Prefetch-Control": "off",
  "X-Download-Options": "noopen",
  "X-Frame-Options": "DENY",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-XSS-Protection": "0",
};

export function getHelmetHeaders(variant: HelmetHeaderVariant): Record<string, string> {
  return variant === "api" ? HELMET_API_HEADERS : HELMET_PAGE_HEADERS;
}

export function applyHelmetHeaders(
  response: Response,
  variant: HelmetHeaderVariant = "api"
): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(getHelmetHeaders(variant))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** For NextResponse in proxy.ts */
export function setHelmetHeadersOnNextResponse(
  response: import("next/server").NextResponse,
  variant: HelmetHeaderVariant = "api"
): void {
  for (const [key, value] of Object.entries(getHelmetHeaders(variant))) {
    response.headers.set(key, value);
  }
}

/** Flat list for next.config.ts `headers()`. */
export function helmetHeadersForNextConfig(
  variant: HelmetHeaderVariant = "page"
): Array<{ key: string; value: string }> {
  return Object.entries(getHelmetHeaders(variant)).map(([key, value]) => ({
    key,
    value,
  }));
}