import { Resend } from "resend";
import { getEmailConfig } from "@/lib/email/config";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  sent: boolean;
  id?: string;
  error?: string;
}

let resendClient: Resend | null = null;

function getResendClient(apiKey: string): Resend {
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const { apiKey, from, isConfigured } = getEmailConfig();

  if (!isConfigured || !apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[email] RESEND_API_KEY not set — skipped send to ${input.to}: ${input.subject}`
      );
    } else {
      console.error(
        `[email] RESEND_API_KEY is required in production. Could not send to ${input.to}.`
      );
    }
    return { sent: false, error: "Email provider is not configured." };
  }

  try {
    const { data, error } = await getResendClient(apiKey).emails.send({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (error) {
      console.error(`[email] Resend error for ${input.to}:`, error);
      return { sent: false, error: error.message };
    }

    return { sent: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email.";
    console.error(`[email] Unexpected error for ${input.to}:`, err);
    return { sent: false, error: message };
  }
}