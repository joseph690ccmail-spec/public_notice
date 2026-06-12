import { getSecurityEnv } from "@/lib/security/env";

export function appBaseUrl(): string {
  const configured = process.env.APP_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const [firstOrigin] = getSecurityEnv()
    .CORS_ALLOWED_ORIGINS.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return firstOrigin || "http://localhost:3000";
}