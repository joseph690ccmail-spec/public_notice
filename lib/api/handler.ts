import type { NextRequest } from "next/server";
import type { ZodType } from "zod";
import { ApiError, toErrorResponse } from "@/lib/api/errors";
import { applyCorsHeaders, corsPreflightResponse, resolveCors } from "@/lib/security/cors";
import type { RateLimitTier } from "@/lib/security/constants";
import { applySecurityHeaders, jsonWithSecurityHeaders } from "@/lib/security/headers";
import { rateLimitFromRequest, rateLimitHeaders } from "@/lib/security/rate-limit";
import { parseStrictBody } from "@/lib/security/validation";
import { UploadValidationError } from "@/lib/security/upload/validate";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface SecureHandlerContext<TBody = unknown> {
  request: NextRequest;
  body: TBody;
  params?: Record<string, string>;
}

export interface SecureHandlerOptions<TBodySchema extends ZodType | undefined = undefined> {
  methods: HttpMethod[];
  rateLimit?: RateLimitTier | false;
  validateBody?: TBodySchema;
  allowAnonymousOrigin?: boolean;
}

type InferBody<T extends ZodType | undefined> = T extends ZodType ? import("zod").infer<T> : undefined;

export function createSecureHandler<
  TBodySchema extends ZodType | undefined = undefined,
>(
  options: SecureHandlerOptions<TBodySchema>,
  handler: (
    ctx: SecureHandlerContext<InferBody<TBodySchema>>
  ) => Promise<Response> | Response
) {
  return async function secureRoute(
    request: NextRequest,
    segmentContext?: { params?: Promise<Record<string, string>> }
  ): Promise<Response> {
    const preflight = corsPreflightResponse(request);
    if (preflight) return applySecurityHeaders(preflight);

    const { allowed, origin } = resolveCors(request);
    if (!allowed) {
      return jsonWithSecurityHeaders(
        { error: { code: "FORBIDDEN", message: "Origin not allowed." } },
        { status: 403 }
      );
    }

    if (!options.methods.includes(request.method as HttpMethod)) {
      return jsonWithSecurityHeaders(
        { error: { code: "BAD_REQUEST", message: "Method not allowed." } },
        { status: 405, headers: { Allow: options.methods.join(", ") } }
      );
    }

    if (options.rateLimit !== false) {
      const tier = options.rateLimit ?? "global";
      const result = rateLimitFromRequest(request, tier);
      if (!result.allowed) {
        const response = jsonWithSecurityHeaders(
          {
            error: {
              code: "RATE_LIMITED",
              message: "Too many requests. Please try again later.",
            },
          },
          { status: 429, headers: rateLimitHeaders(result) }
        );
        return applyCorsHeaders(applySecurityHeaders(response), origin);
      }
    }

    let body: InferBody<TBodySchema> = undefined as InferBody<TBodySchema>;
    if (options.validateBody && request.method !== "GET" && request.method !== "DELETE") {
      let raw: unknown;
      try {
        raw = await request.json();
      } catch {
        return jsonWithSecurityHeaders(
          { error: { code: "BAD_REQUEST", message: "Request body must be valid JSON." } },
          { status: 400 }
        );
      }

      const parsed = parseStrictBody(options.validateBody, raw);
      if (!parsed.success) {
        return jsonWithSecurityHeaders(
          {
            error: {
              code: "BAD_REQUEST",
              message: "Validation failed.",
              details: parsed.errors,
            },
          },
          { status: 400 }
        );
      }
      body = parsed.data as InferBody<TBodySchema>;
    }

    const params = segmentContext?.params ? await segmentContext.params : undefined;

    try {
      const response = await handler({ request, body, params });
      const withCors = applyCorsHeaders(response, origin);
      return applySecurityHeaders(withCors);
    } catch (error) {
      if (error instanceof UploadValidationError) {
        const apiError = new ApiError(error.code, error.message);
        const { status, body: payload } = toErrorResponse(apiError);
        return applyCorsHeaders(
          applySecurityHeaders(jsonWithSecurityHeaders(payload, { status })),
          origin
        );
      }

      if (error instanceof Error && error.name === "IdempotencyConflict") {
        const { status, body: payload } = toErrorResponse(
          new ApiError("CONFLICT", error.message)
        );
        return applyCorsHeaders(
          applySecurityHeaders(jsonWithSecurityHeaders(payload, { status })),
          origin
        );
      }

      const { status, body: payload } = toErrorResponse(error);
      return applyCorsHeaders(
        applySecurityHeaders(jsonWithSecurityHeaders(payload, { status })),
        origin
      );
    }
  };
}

/** Maps pathname to the strictest applicable rate-limit tier. */
export function resolveRateLimitTier(pathname: string): RateLimitTier {
  if (pathname.endsWith("/save-link")) return "saveLink";
  if (pathname.endsWith("/search")) return "search";
  if (pathname === "/api/v1/notices" || pathname.startsWith("/api/v1/notices?")) {
    return "noticesList";
  }
  if (pathname.startsWith("/api/v1/drafts")) return "drafts";
  if (pathname.startsWith("/api/v1/payments")) return "payments";
  if (pathname.startsWith("/api/v1/webhooks")) return "webhook";
  return "global";
}