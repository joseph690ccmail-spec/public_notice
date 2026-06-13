import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  /** Comma-separated allowed browser origins, e.g. https://publicnotice.ng,http://localhost:3000 */
  CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),

  /** Comma-separated Paystack webhook source IPs (optional extra gate). */
  PAYSTACK_WEBHOOK_IPS: z.string().optional(),

  PAYSTACK_SECRET_KEY: z.string().optional(),
  PAYSTACK_PUBLIC_KEY: z.string().optional(),

  /** HMAC pepper for hashing client IP / fingerprint bindings. */
  SESSION_BINDING_SECRET: z.string().optional(),

  /** R2 / S3-compatible object storage (affidavits — private bucket). */
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_ENDPOINT: z.string().optional(),
  R2_PUBLIC_BASE_URL: z.string().optional(),

  /** Max affidavit upload size in bytes (default 8 MB). */
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(8 * 1024 * 1024),

  /** PostgreSQL connection string (Prisma). */
  DATABASE_URL: z.string().optional(),

  /** Public app URL for resume links in emails (e.g. https://publicnotice.ng). */
  APP_BASE_URL: z.string().optional(),

  /** Resend API key for transactional email (server-side only). */
  RESEND_API_KEY: z.string().optional(),

  /** Alias for RESEND_API_KEY (legacy / SMTP naming). */
  SMTP_API_KEY: z.string().optional(),

  /** Sender address for outbound email, e.g. Public Notice System <noreply@yourdomain.com>. */
  EMAIL_FROM: z.string().optional(),

  /** Optional Redis URL for distributed rate limiting / idempotency. */
  REDIS_URL: z.string().optional(),

  /** Groq API key for AI affidavit verification (server-side only). */
  GROQ_AI_KEY: z.string().optional(),

  /** HMAC secret for signed admin session cookies. */
  ADMIN_SESSION_SECRET: z.string().optional(),

  /** Seed credentials for the initial super admin (`npm run db:seed`). */
  SUPER_ADMIN_EMAIL: z.string().optional(),
  SUPER_ADMIN_PASSWORD: z.string().optional(),
  SUPER_ADMIN_NAME: z.string().optional(),
});

export type SecurityEnv = z.infer<typeof envSchema>;

let cachedEnv: SecurityEnv | null = null;

export function getSecurityEnv(): SecurityEnv {
  if (cachedEnv) return cachedEnv;
  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}

export function getCorsAllowedOrigins(): string[] {
  return getSecurityEnv()
    .CORS_ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getPaystackWebhookIps(): string[] {
  const raw = getSecurityEnv().PAYSTACK_WEBHOOK_IPS;
  if (!raw) return [];
  return raw.split(",").map((ip) => ip.trim()).filter(Boolean);
}

export function requireEnv(key: keyof SecurityEnv): string {
  const value = getSecurityEnv()[key];
  if (!value || typeof value !== "string") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}