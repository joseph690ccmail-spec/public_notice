/** API path prefix — all secured handlers live under this namespace. */
export const API_V1_PREFIX = "/api/v1";

/** Route patterns used for tiered rate limiting (matched against pathname). */
export const RATE_LIMIT_ROUTES = {
  saveLink: `${API_V1_PREFIX}/drafts/*/save-link`,
  search: `${API_V1_PREFIX}/notices/search`,
  noticesList: `${API_V1_PREFIX}/notices`,
  drafts: `${API_V1_PREFIX}/drafts`,
  payments: `${API_V1_PREFIX}/payments`,
  webhooks: `${API_V1_PREFIX}/webhooks`,
} as const;

export type RateLimitTier =
  | "global"
  | "saveLink"
  | "search"
  | "noticesList"
  | "drafts"
  | "payments"
  | "webhook";

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

/** Defaults from API_SEC.md — override per-route in handler options if needed. */
export const RATE_LIMITS: Record<RateLimitTier, RateLimitConfig> = {
  global: { limit: 120, windowMs: 60_000 },
  saveLink: { limit: 3, windowMs: 60 * 60_000 },
  search: { limit: 10, windowMs: 60_000 },
  noticesList: { limit: 30, windowMs: 60_000 },
  drafts: { limit: 60, windowMs: 60_000 },
  payments: { limit: 20, windowMs: 60_000 },
  webhook: { limit: 200, windowMs: 60_000 },
};

export const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Stripped from user-facing /api/v1/notices responses (NDPA).
 * Stored on Notice in the DB — returned only on authorized/admin queries.
 */
export const PUBLIC_LEDGER_REDACTED_FIELDS = [
  "id",
  "email",
  "phone",
  "phoneNumber",
  "affidavitObjectKey",
  "affidavitMimeType",
  "affidavitSizeBytes",
  "affidavitUploadedAt",
  "affidavitUrl",
  "draftId",
  "consentGiven",
  "createdAt",
  "ipHash",
  "fingerprintHash",
  "paymentReference",
  "paystackReference",
  "transactions",
] as const;