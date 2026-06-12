import type { Draft, Notice } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import { prisma } from "@/lib/db";
import {
  buildNoticeVerifyUrl,
  sendPublishNotifications,
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
    draftId: draft.id,
    verified: true,
  };
}

function alreadyPublishedResult(notice: Notice, reference: string): PublishFromPaymentResult {
  return {
    pnn: notice.pnn,
    noticeId: notice.id,
    draftId: notice.draftId!,
    reference,
    alreadyPublished: true,
    notifications: {
      emailSent: false,
      smsSent: false,
      verifyUrl: buildNoticeVerifyUrl(notice.pnn),
    },
  };
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

  if (draft.notice) {
    if (transaction.status !== "SUCCESS" || !transaction.noticeId) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCESS",
          noticeId: draft.notice.id,
          paidAt: transaction.paidAt ?? new Date(),
        },
      });
    }
    return alreadyPublishedResult(draft.notice, reference);
  }

  assertPublishableDraft(draft);

  const pnn = await generateUniquePnn();
  const paidAt = new Date();

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

  const notifications = await sendPublishNotifications({
    pnn: notice.pnn,
    email: notice.email,
    phone: notice.phone,
    formerName: notice.formerName,
    newName: notice.newName,
  });

  return {
    pnn: notice.pnn,
    noticeId: notice.id,
    draftId: draft.id,
    reference,
    alreadyPublished: false,
    notifications: {
      emailSent: notifications.emailSent,
      smsSent: notifications.smsSent,
      verifyUrl: notifications.verifyUrl,
    },
  };
}