import type { Draft, Notice, Transaction } from "@prisma/client";

export interface AdminPaymentSummary {
  id: string;
  reference: string;
  status: Transaction["status"];
  method: Transaction["method"];
  service: Transaction["service"];
  amountKobo: number;
  currency: string;
  paidAt: string | null;
  createdAt: string;
  noticePnn: string | null;
  draftEmail: string;
}

export interface AdminPaymentDraftSummary {
  id: string;
  email: string;
  phone: string | null;
  status: Draft["status"];
  formerName: string | null;
  newName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentNoticeSummary {
  id: string;
  pnn: string;
  formerName: string;
  newName: string;
  email: string;
  publishedAt: string;
}

export interface AdminPaymentDetail extends AdminPaymentSummary {
  draftId: string;
  noticeId: string | null;
  updatedAt: string;
  draft: AdminPaymentDraftSummary;
  notice: AdminPaymentNoticeSummary | null;
}

export interface AdminPaymentListResult {
  items: AdminPaymentSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminPaymentsStats {
  currency: string;
  receivedKobo: number;
  successfulCount: number;
  totalAttempts: number;
  pendingCount: number;
  failedCount: number;
}

type TransactionWithRelations = Transaction & {
  draft: Draft;
  notice: Notice | null;
};

export function toAdminPaymentSummary(transaction: TransactionWithRelations): AdminPaymentSummary {
  return {
    id: transaction.id,
    reference: transaction.reference,
    status: transaction.status,
    method: transaction.method,
    service: transaction.service,
    amountKobo: transaction.amountKobo,
    currency: transaction.currency,
    paidAt: transaction.paidAt?.toISOString() ?? null,
    createdAt: transaction.createdAt.toISOString(),
    noticePnn: transaction.notice?.pnn ?? null,
    draftEmail: transaction.draft.email,
  };
}

export function toAdminPaymentDetail(transaction: TransactionWithRelations): AdminPaymentDetail {
  return {
    ...toAdminPaymentSummary(transaction),
    draftId: transaction.draftId,
    noticeId: transaction.noticeId,
    updatedAt: transaction.updatedAt.toISOString(),
    draft: {
      id: transaction.draft.id,
      email: transaction.draft.email,
      phone: transaction.draft.phone,
      status: transaction.draft.status,
      formerName: transaction.draft.formerName,
      newName: transaction.draft.newName,
      createdAt: transaction.draft.createdAt.toISOString(),
      updatedAt: transaction.draft.updatedAt.toISOString(),
    },
    notice: transaction.notice
      ? {
          id: transaction.notice.id,
          pnn: transaction.notice.pnn,
          formerName: transaction.notice.formerName,
          newName: transaction.notice.newName,
          email: transaction.notice.email,
          publishedAt: transaction.notice.publishedAt.toISOString(),
        }
      : null,
  };
}