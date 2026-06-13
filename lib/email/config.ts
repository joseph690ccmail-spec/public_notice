import { getSecurityEnv } from "@/lib/security/env";

export interface EmailConfig {
  apiKey: string | undefined;
  from: string;
  isConfigured: boolean;
}

function readApiKey(): string | undefined {
  const env = getSecurityEnv();
  const key = env.RESEND_API_KEY?.trim() || env.SMTP_API_KEY?.trim();
  if (key) return key;

  const runtimeKey =
    process.env.RESEND_API_KEY?.trim() || process.env.SMTP_API_KEY?.trim();
  return runtimeKey || undefined;
}

function readFromAddress(): string {
  const env = getSecurityEnv();
  const configured = env.EMAIL_FROM?.trim() || process.env.EMAIL_FROM?.trim();
  return configured || "Public Notice System <onboarding@resend.dev>";
}

export function getEmailConfig(): EmailConfig {
  const apiKey = readApiKey();

  return {
    apiKey,
    from: readFromAddress(),
    isConfigured: Boolean(apiKey),
  };
}