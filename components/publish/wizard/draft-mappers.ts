import type { PatchDraftPayload } from "@/lib/api/client";
import type { DraftResponse } from "@/lib/drafts/dto";
import type { PublishFormData } from "@/lib/publish";

export function draftToForm(draft: DraftResponse): PublishFormData {
  return {
    email: draft.email,
    phone: draft.phone ?? "",
    formerName: draft.formerName ?? "",
    newName: draft.newName ?? "",
    reason: (draft.reason ?? "") as PublishFormData["reason"],
    reasonOther: draft.reasonOther ?? "",
    consentGiven: draft.consentGiven,
  };
}

export function inferStepFromDraft(
  draft: DraftResponse,
  options?: { paymentReturn?: boolean; storedStep?: number }
): number {
  if (options?.paymentReturn) return 4;

  if (
    typeof options?.storedStep === "number" &&
    options.storedStep >= 0 &&
    options.storedStep <= 4
  ) {
    return options.storedStep;
  }

  if (!draft.formerName || !draft.newName || !draft.reason || !draft.phone) return 1;
  if (!draft.hasAffidavit) return 2;
  if (draft.consentGiven) return 4;
  return 3;
}

export function formToPatchPayload(data: PublishFormData): PatchDraftPayload {
  const payload: PatchDraftPayload = {};
  if (data.formerName.trim()) payload.oldName = data.formerName.trim();
  if (data.newName.trim()) payload.newName = data.newName.trim();
  if (data.phone.trim()) payload.phone = data.phone.trim();
  if (data.reason) payload.reason = data.reason;
  if (data.reasonOther.trim()) payload.reasonOther = data.reasonOther.trim();
  if (data.consentGiven) payload.consentGiven = data.consentGiven;
  return payload;
}