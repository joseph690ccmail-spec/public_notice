export const AFFIDAVIT_VERIFYING_LABEL = "Verifying your document…";

export const AFFIDAVIT_VERIFYING_DESCRIPTION =
  "Our system is checking that your upload looks like a sworn Change of Name affidavit. This usually takes a few seconds.";

export const AFFIDAVIT_REJECTED_MESSAGE =
  "We could not verify this as a sworn Change of Name affidavit. Please upload a clear photo of your executed court document and try again.";

export const AFFIDAVIT_LOW_CONFIDENCE_MESSAGE =
  "Your document could not be verified with enough confidence. Please upload a clear photo of your sworn Change of Name affidavit and try again.";

export const AFFIDAVIT_VERIFY_FAILED_MESSAGE =
  "We could not verify your document right now. Please try again in a moment.";

export function affidavitRejectionMessage(issues: string[]): string {
  const safeIssues = issues
    .map((issue) => issue.trim())
    .filter((issue) => issue.length > 0 && issue.length <= 160)
    .slice(0, 2);

  if (safeIssues.length === 0) return AFFIDAVIT_REJECTED_MESSAGE;

  return `${AFFIDAVIT_REJECTED_MESSAGE} ${safeIssues.join(" ")}`;
}