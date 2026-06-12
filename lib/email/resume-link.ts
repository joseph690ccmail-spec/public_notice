import { appBaseUrl } from "@/lib/app-url";

export interface ResumeLinkResult {
  sent: boolean;
  resumeUrl: string;
}

export function buildDraftResumeUrl(draftId: string): string {
  return `${appBaseUrl()}/publish/change-of-name?draft=${draftId}`;
}

/**
 * MVP stub — logs in development. Swap for Resend/SendGrid/SES when ready.
 */
export async function sendDraftResumeLink(
  email: string,
  draftId: string
): Promise<ResumeLinkResult> {
  const resumeUrl = buildDraftResumeUrl(draftId);

  if (process.env.NODE_ENV !== "production") {
    console.info(`[resume-link] To: ${email} | ${resumeUrl}`);
  }

  // TODO: integrate transactional email provider
  return { sent: true, resumeUrl };
}