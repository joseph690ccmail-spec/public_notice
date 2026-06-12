import type { ZodType } from "zod";
import type { RateLimitTier } from "@/lib/security/constants";
import {
  draftAbandonBodySchema,
  draftInitBodySchema,
  draftPatchBodySchema,
  noticeSearchBodySchema,
  paymentInitializeBodySchema,
} from "@/lib/security/validation";

export interface RouteSecurityProfile {
  methods: Array<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">;
  rateLimit: RateLimitTier | false;
  bodySchema?: ZodType;
  requiresDraftBinding?: boolean;
  requiresPaystackWebhook?: boolean;
  acceptsMultipart?: boolean;
  maskPublicResponse?: boolean;
}

/**
 * Security profiles for every planned v1 route (API.md).
 * Import these when implementing route handlers — do not duplicate config.
 */
export const API_ROUTE_SECURITY = {
  "POST /api/v1/drafts/init": {
    methods: ["POST"],
    rateLimit: "drafts",
    bodySchema: draftInitBodySchema,
  },
  "POST /api/v1/drafts/abandon": {
    methods: ["POST"],
    rateLimit: "drafts",
    bodySchema: draftAbandonBodySchema,
  },
  "GET /api/v1/drafts/:draftId": {
    methods: ["GET"],
    rateLimit: "drafts",
    requiresDraftBinding: true,
  },
  "PATCH /api/v1/drafts/:draftId": {
    methods: ["PATCH"],
    rateLimit: "drafts",
    bodySchema: draftPatchBodySchema,
    requiresDraftBinding: true,
  },
  "POST /api/v1/drafts/:draftId/affidavit": {
    methods: ["POST"],
    rateLimit: "drafts",
    requiresDraftBinding: true,
    acceptsMultipart: true,
  },
  "POST /api/v1/drafts/:draftId/affidavit/verify": {
    methods: ["POST"],
    rateLimit: "affidavitVerify",
    requiresDraftBinding: true,
  },
  "POST /api/v1/drafts/:draftId/save-link": {
    methods: ["POST"],
    rateLimit: "saveLink",
    requiresDraftBinding: true,
  },
  "DELETE /api/v1/drafts/:draftId": {
    methods: ["DELETE"],
    rateLimit: "drafts",
    requiresDraftBinding: true,
  },
  "POST /api/v1/payments/initialize": {
    methods: ["POST"],
    rateLimit: "payments",
    bodySchema: paymentInitializeBodySchema,
    requiresDraftBinding: true,
  },
  "GET /api/v1/payments/verify/:reference": {
    methods: ["GET"],
    rateLimit: "payments",
  },
  "POST /api/v1/webhooks/paystack": {
    methods: ["POST"],
    rateLimit: false,
    requiresPaystackWebhook: true,
  },
  "GET /api/v1/notices/:pnn": {
    methods: ["GET"],
    rateLimit: "noticesList",
    maskPublicResponse: true,
  },
  "GET /api/v1/notices": {
    methods: ["GET"],
    rateLimit: "noticesList",
    maskPublicResponse: true,
  },
  "POST /api/v1/notices/search": {
    methods: ["POST"],
    rateLimit: "search",
    bodySchema: noticeSearchBodySchema,
    maskPublicResponse: true,
  },
  "POST /api/v1/affidavit/verify": {
    methods: ["POST"],
    rateLimit: "affidavitVerify",
    acceptsMultipart: true,
  },
} as const satisfies Record<string, RouteSecurityProfile>;

export type ApiRouteKey = keyof typeof API_ROUTE_SECURITY;