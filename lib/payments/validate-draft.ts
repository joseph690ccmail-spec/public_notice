import type { Draft } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";

export function assertDraftReadyForPayment(draft: Draft): void {
  const missing: string[] = [];

  if (!draft.formerName?.trim()) missing.push("formerName");
  if (!draft.newName?.trim()) missing.push("newName");
  if (!draft.reason) missing.push("reason");
  if (draft.reason === "OTHER" && !draft.reasonOther?.trim()) missing.push("reasonOther");
  if (!draft.phone?.trim()) missing.push("phone");
  if (!draft.affidavitObjectKey) missing.push("affidavit");
  if (!draft.consentGiven) missing.push("consentGiven");

  if (
    draft.formerName?.trim() &&
    draft.newName?.trim() &&
    draft.formerName.trim().toLowerCase() === draft.newName.trim().toLowerCase()
  ) {
    throw new ApiError("BAD_REQUEST", "New name must be different from former name.");
  }

  if (missing.length > 0) {
    throw new ApiError("BAD_REQUEST", "Draft is incomplete and cannot proceed to payment.", {
      details: missing.map((field) => `${field}: required`),
    });
  }
}