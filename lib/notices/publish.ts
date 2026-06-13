import type { Draft, Notice } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import { prisma } from "@/lib/db";
import {
  deliverCertificateEmailOnce,
  type PublishNotificationResult,
} from "@/lib/notifications/publish";
import { generateUniquePnn } from "@/lib/notices/pnn";
import { CHANGE_OF_NAME_FEE_KOBO } from "@/lib/payments/constants";
import { assertDraftReadyForPayment } from "@/lib/payments/validate-draft";
import type { PaystackChargeSuccessEvent } from "@/lib/security/payments/paystack-webhook";

export interface PublishFromPaymentResult {
  pnn: string;
  noticeId: string;
  draftId: string;
  reference: string;
  alreadyPublished: boolean;
  notifications: {
    emailSent: boolean;
    smsSent: boolean;
    verifyUrl: string;
  };
}

function assertPublishableDraft(draft: Draft): void {
  if (draft.status === "PUBLISHED") {
    return;
  }
  if (draft.status !== "IN_PROGRESS") {
    throw new ApiError("CONFLICT", "Draft is not eligible for publication.");
  }
  assertDraftReadyForPayment(draft);
}

function noticeFromDraft(draft: Draft, pnn: string) {
  return {
    pnn,
    formerName: draft.formerName!.trim(),
    newName: draft.newName!.trim(),
    reason: draft.reason!,
    reasonOther: draft.reasonOther,
    email: draft.email,
    phone: draft.phone,
    consentGiven: draft.consentGiven,
    affidavitObjectKey: draft.affidavitObjectKey,
    affidavitMimeType: draft.affidavitMimeType,
    affidavitSizeBytes: draft.affidavitSizeBytes,
    affidavitUploadedAt: draft.affidavitUploadedAt,
    affidavitConfidence: draft.affidavitConfidence,
    affidavitVerdict: draft.affidavitVerdict,
    affidavitIssues: draft.affidavitIssues,
    affidavitVerifiedAt: draft.affidavitVerifiedAt,
    draftId: draft.id,
    verified: true,
  };
}

function notificationInputFromNotice(notice: Notice) {
  return {
    pnn: notice.pnn,
    email: notice.email,
    phone: notice.phone,
    formerName: notice.formerName,
    newName: notice.newName,
  };
}

function buildPublishResult(
  notice: Notice,
  reference: string,
  alreadyPublished: boolean,
  notifications: PublishNotificationResult
): PublishFromPaymentResult {
  return {
    pnn: notice.pnn,
    noticeId: notice.id,
    draftId: notice.draftId!,
    reference,
    alreadyPublished,
    notifications: {
      emailSent: notifications.emailSent,
      smsSent: notifications.smsSent,
      verifyUrl: notifications.verifyUrl,
    },
  };
}

async function ensureTransactionLinked(
  transactionId: string,
  noticeId: string,
  paidAt: Date
): Promise<void> {
  await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      status: "SUCCESS",
      noticeId,
      paidAt,
    },
  });
}

async function finalizePublishedNotice(
  notice: Notice,
  reference: string,
  transactionId: string,
  paidAt: Date,
  alreadyPublished: boolean
): Promise<PublishFromPaymentResult> {
  await ensureTransactionLinked(transactionId, notice.id, paidAt);

  const notifications = await deliverCertificateEmailOnce(
    notice.id,
    notificationInputFromNotice(notice)
  );

  return buildPublishResult(notice, reference, alreadyPublished, notifications);
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
  );
}

export async function publishNoticeFromPayment(
  reference: string,
  charge: PaystackChargeSuccessEvent["data"]
): Promise<PublishFromPaymentResult> {
  const transaction = await prisma.transaction.findUnique({
    where: { reference },
    include: { draft: { include: { notice: true } } },
  });

  if (!transaction) {
    throw new ApiError("NOT_FOUND", "Payment reference not found for webhook.");
  }

  if (charge.amount !== undefined && charge.amount !== transaction.amountKobo) {
    throw new ApiError("BAD_REQUEST", "Webhook payment amount does not match expected fee.");
  }

  if (transaction.amountKobo !== CHANGE_OF_NAME_FEE_KOBO) {
    throw new ApiError("BAD_REQUEST", "Transaction fee does not match expected publication amount.");
  }

  const draft = transaction.draft;
  if (!draft) {
    throw new ApiError("NOT_FOUND", "Draft not found for payment.");
  }

  const paidAt = transaction.paidAt ?? new Date();

  if (draft.notice) {
    return finalizePublishedNotice(draft.notice, reference, transaction.id, paidAt, true);
  }

  assertPublishableDraft(draft);

  const pnn = await generateUniquePnn();

  try {
    const notice = await prisma.$transaction(async (tx) => {
      const created = await tx.notice.create({
        data: noticeFromDraft(draft, pnn),
      });

      await tx.draft.update({
        where: { id: draft.id },
        data: {
          status: "PUBLISHED",
          affidavitObjectKey: null,
          affidavitMimeType: null,
          affidavitSizeBytes: null,
          affidavitUploadedAt: null,
        },
      });

      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCESS",
          noticeId: created.id,
          paidAt,
        },
      });

      return created;
    });

    const notifications = await deliverCertificateEmailOnce(
      notice.id,
      notificationInputFromNotice(notice)
    );

    return buildPublishResult(notice, reference, false, notifications);
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const existing = await prisma.notice.findUnique({
      where: { draftId: draft.id },
    });

    if (!existing) {
      throw error;
    }

    return finalizePublishedNotice(existing, reference, transaction.id, paidAt, true);
  }
}