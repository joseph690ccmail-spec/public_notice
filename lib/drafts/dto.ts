import type { Draft } from "@prisma/client";
import type { AffidavitVerificationResult } from "@/lib/affidavit-verification/types";
import { formatStoredVerification } from "@/lib/affidavit-verification/db";
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
  affidavitVerification: AffidavitVerificationResult | null;
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
    affidavitVerification: formatStoredVerification(draft),
    status: draft.status,
    ...(options?.resumed ? { resumed: true } : {}),
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
  };
}