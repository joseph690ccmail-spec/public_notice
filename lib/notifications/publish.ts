import { appBaseUrl } from "@/lib/app-url";
import { sendEmail } from "@/lib/email/client";
import {
  buildCertificatePublishedSubject,
  buildCertificatePublishedText,
  renderCertificatePublishedEmail,
} from "@/lib/email/templates/certificate-published";
import {
  getIdempotencyStore,
  type IdempotencyScope,
} from "@/lib/security/payments/idempotency";

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

const CERTIFICATE_EMAIL_SCOPE = "certificate_email" satisfies IdempotencyScope;

export function buildNoticeVerifyUrl(pnn: string): string {
  return `${appBaseUrl()}/notices?pnn=${encodeURIComponent(pnn)}`;
}

async function sendCertificateEmail(
  input: PublishNotificationInput
): Promise<{ sent: boolean; error?: string }> {
  const verifyUrl = buildNoticeVerifyUrl(input.pnn);

  return sendEmail({
    to: input.email,
    subject: buildCertificatePublishedSubject(input.pnn),
    html: renderCertificatePublishedEmail({
      email: input.email,
      pnn: input.pnn,
      formerName: input.formerName,
      newName: input.newName,
      certificateUrl: verifyUrl,
    }),
    text: buildCertificatePublishedText({
      email: input.email,
      pnn: input.pnn,
      formerName: input.formerName,
      newName: input.newName,
      certificateUrl: verifyUrl,
    }),
  });
}

/**
 * Sends the certificate email at most once per notice.
 * Retries when a previous publish path created the notice but email delivery failed.
 */
export async function deliverCertificateEmailOnce(
  noticeId: string,
  input: PublishNotificationInput
): Promise<PublishNotificationResult> {
  const verifyUrl = buildNoticeVerifyUrl(input.pnn);
  const store = getIdempotencyStore();

  if (await store.has(noticeId, CERTIFICATE_EMAIL_SCOPE)) {
    return { emailSent: true, smsSent: false, verifyUrl };
  }

  const emailResult = await sendCertificateEmail(input);

  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[publish-email] To: ${input.email} | PNN: ${input.pnn} | ${input.formerName} → ${input.newName} | ${verifyUrl} | sent=${emailResult.sent}${emailResult.error ? ` | error=${emailResult.error}` : ""}`
    );
    if (input.phone) {
      console.info(
        `[publish-sms] To: ${input.phone} | Your Public Notice Number is ${input.pnn}. Verify: ${verifyUrl}`
      );
    }
  } else if (!emailResult.sent) {
    console.error(
      `[publish-email] Failed for ${input.email} (${input.pnn}): ${emailResult.error ?? "unknown error"}`
    );
  }

  if (emailResult.sent) {
    await store.mark(noticeId, CERTIFICATE_EMAIL_SCOPE, { pnn: input.pnn });
  }

  return {
    emailSent: emailResult.sent,
    smsSent: false,
    verifyUrl,
  };
}