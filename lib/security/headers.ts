import { applyHelmetHeaders } from "@/lib/security/helmet-headers";

export function applySecurityHeaders(response: Response): Response {
  return applyHelmetHeaders(response, "api");
}

export function jsonWithSecurityHeaders(
  body: unknown,
  init?: ResponseInit
): Response {
  const response = Response.json(body, init);
  return applySecurityHeaders(response);
}