import { appBaseUrl } from "@/lib/app-url";

export interface PublishNotificationInput {
  pnn: string;
  email: string;
  phone: string | null;
  formerName: string;
  newName: string;
}

export interface PublishNotificationResult {
  emailSent: boolean;
  smsSent: boolean;
  verifyUrl: string;
}

export function buildNoticeVerifyUrl(pnn: string): string {
  return `${appBaseUrl()}/notices?pnn=${encodeURIComponent(pnn)}`;
}

/**
 * MVP stubs — swap for transactional email/SMS providers when ready.
 */
export async function sendPublishNotifications(
  input: PublishNotificationInput
): Promise<PublishNotificationResult> {
  const verifyUrl = buildNoticeVerifyUrl(input.pnn);

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[publish-email] To: ${input.email} | PNN: ${input.pnn} | ${input.formerName} → ${input.newName} | ${verifyUrl}`
    );
    if (input.phone) {
      console.info(
        `[publish-sms] To: ${input.phone} | Your Public Notice Number is ${input.pnn}. Verify: ${verifyUrl}`
      );
    }
  }

  // TODO: integrate email + SMS providers (certificate PDF attachment on email)
  return {
    emailSent: true,
    smsSent: Boolean(input.phone),
    verifyUrl,
  };
}