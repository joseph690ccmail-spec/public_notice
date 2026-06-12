import type { Draft, Notice, Transaction } from "@prisma/client";
import { formatNoticeReason } from "@/lib/drafts/reason";

export interface AdminNoticeSummary {
  id: string;
  pnn: string;
  formerName: string;
  newName: string;
  email: string;
  phone: string | null;
  publishedAt: string;
  verified: boolean;
}

export interface AdminNoticeDraftSummary {
  id: string;
  email: string;
  phone: string | null;
  status: Draft["status"];
  createdAt: string;
  updatedAt: string;
}

export interface AdminNoticeTransactionSummary {
  id: string;
  reference: string;
  status: Transaction["status"];
  method: Transaction["method"];
  amountKobo: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
}

export interface AdminNoticeDetail extends AdminNoticeSummary {
  reason: string | null;
  reasonOther: string | null;
  consentGiven: boolean;
  affidavitObjectKey: string | null;
  affidavitMimeType: string | null;
  affidavitSizeBytes: number | null;
  affidavitUploadedAt: string | null;
  affidavitConfidence: number | null;
  affidavitVerdict: Notice["affidavitVerdict"];
  affidavitIssues: string[];
  affidavitVerifiedAt: string | null;
  draftId: string | null;
  createdAt: string;
  draft: AdminNoticeDraftSummary | null;
  transactions: AdminNoticeTransactionSummary[];
}

export interface AdminNoticeListResult {
  items: AdminNoticeSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function serializeTransactionSummary(transaction: Transaction): AdminNoticeTransactionSummary {
  return {
    id: transaction.id,
    reference: transaction.reference,
    status: transaction.status,
    method: transaction.method,
    amountKobo: transaction.amountKobo,
    currency: transaction.currency,
    paidAt: transaction.paidAt?.toISOString() ?? null,
    createdAt: transaction.createdAt.toISOString(),
  };
}

function serializeDraftSummary(draft: Draft): AdminNoticeDraftSummary {
  return {
    id: draft.id,
    email: draft.email,
    phone: draft.phone,
    status: draft.status,
    createdAt: draft.createdAt.toISOString(),
    updatedAt: draft.updatedAt.toISOString(),
  };
}

export function toAdminNoticeSummary(notice: Notice): AdminNoticeSummary {
  return {
    id: notice.id,
    pnn: notice.pnn,
    formerName: notice.formerName,
    newName: notice.newName,
    email: notice.email,
    phone: notice.phone,
    publishedAt: notice.publishedAt.toISOString(),
    verified: notice.verified,
  };
}

export function toAdminNoticeDetail(
  notice: Notice,
  draft: Draft | null,
  transactions: Transaction[]
): AdminNoticeDetail {
  return {
    ...toAdminNoticeSummary(notice),
    reason: formatNoticeReason(notice.reason),
    reasonOther: notice.reasonOther,
    consentGiven: notice.consentGiven,
    affidavitObjectKey: notice.affidavitObjectKey,
    affidavitMimeType: notice.affidavitMimeType,
    affidavitSizeBytes: notice.affidavitSizeBytes,
    affidavitUploadedAt: notice.affidavitUploadedAt?.toISOString() ?? null,
    affidavitConfidence: notice.affidavitConfidence,
    affidavitVerdict: notice.affidavitVerdict,
    affidavitIssues: notice.affidavitIssues,
    affidavitVerifiedAt: notice.affidavitVerifiedAt?.toISOString() ?? null,
    draftId: notice.draftId,
    createdAt: notice.createdAt.toISOString(),
    draft: draft ? serializeDraftSummary(draft) : null,
    transactions: transactions.map(serializeTransactionSummary),
  };
}