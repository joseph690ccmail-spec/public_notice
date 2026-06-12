import type { Draft } from "@prisma/client";
import { formatNoticeReason } from "@/lib/drafts/reason";

export interface DraftResponse {
  draftId: string;
  email: string;
  phone: string | null;
  formerName: string | null;
  newName: string | null;
  reason: string | null;
  reasonOther: string | null;
  consentGiven: boolean;
  hasAffidavit: boolean;
  status: Draft["status"];
  resumed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function toDraftResponse(
  draft: Draft,
  options?: { resumed?: boolean }
): DraftResponse {
  return {
    draftId: draft.id,
    email: draft.email,
    phone: draft.phone,
    formerName: draft.formerName,
    newName: draft.newName,
    reason: formatNoticeReason(draft.reason),
    reasonOther: draft.reasonOther,
    consentGiven: draft.consentGiven,
    hasAffidavit: Boolean(draft.affidavitObjectKey),
    status: draft.status,
    ...(options?.resumed ? { resumed: true } : {}),
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
  };
}