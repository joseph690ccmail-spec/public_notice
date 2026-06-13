import { escapeHtml } from "@/lib/email/escape";
import {
  emailClosing,
  emailCtaBlock,
  emailDivider,
  emailLabelValue,
  emailParagraph,
  renderEmailLayout,
} from "@/lib/email/templates/layout";

export interface CertificatePublishedEmailInput {
  email: string;
  pnn: string;
  formerName: string;
  newName: string;
  certificateUrl: string;
}

export function buildCertificatePublishedSubject(pnn: string): string {
  return `Your public notice is published — ${pnn}`;
}

export function buildCertificatePublishedText(
  input: CertificatePublishedEmailInput
): string {
  return [
    "Your public notice is now published.",
    "",
    `Public Notice Number (PNN): ${input.pnn}`,
    `Former name: ${input.formerName}`,
    `New name: ${input.newName}`,
    "",
    `View your certificate: ${input.certificateUrl}`,
    "",
    "Federal Republic of Nigeria — Public Notice System",
  ].join("\n");
}

export function renderCertificatePublishedEmail(
  input: CertificatePublishedEmailInput
): string {
  const safePnn = escapeHtml(input.pnn);
  const safeFormer = escapeHtml(input.formerName);
  const safeNew = escapeHtml(input.newName);
  const safeEmail = escapeHtml(input.email);

  const bodyRows = [
    emailParagraph(
      "Your change of name notice has been officially published on the Public Notice System."
    ),
    emailLabelValue("Your Public Notice Number (PNN) is:", `<strong>${safePnn}</strong>`),
    emailLabelValue("Former name:", safeFormer),
    emailLabelValue("New name:", safeNew),
    emailLabelValue(
      "Registered email:",
      `<a href="mailto:${safeEmail}" style="color:#005c38;text-decoration:none">${safeEmail}</a>`
    ),
    emailDivider(),
    emailCtaBlock(
      `Your digital certificate is ready. Visit the registry to view, verify, and download your official publication record.`,
      "View certificate",
      input.certificateUrl
    ),
    emailClosing("Thank you for using the Public Notice System."),
  ].join("");

  return renderEmailLayout({
    headline: "Your public notice<br>is now published!",
    bodyRows,
    recipientEmail: input.email,
  });
}