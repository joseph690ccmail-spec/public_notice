import type { NextRequest } from "next/server";
import type { Notice, Transaction, TransactionStatus } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import { requireDraftAccess } from "@/lib/drafts/access";
import { prisma } from "@/lib/db";
import { toPublicNotice, type PublicNoticeResponse } from "@/lib/notices/dto";
import { publishNoticeFromPayment } from "@/lib/notices/publish";
import { CHANGE_OF_NAME_FEE_KOBO } from "@/lib/payments/constants";
import {
  paystackInitializeTransaction,
  paystackVerifyTransaction,
} from "@/lib/payments/paystack";
import { generatePaymentReference } from "@/lib/payments/reference";
import { assertDraftReadyForPayment } from "@/lib/payments/validate-draft";
import type { PaystackChargeSuccessEvent } from "@/lib/security/payments/paystack-webhook";

export interface PaymentInitializeResult {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amountKobo: number;
  currency: string;
  draftId: string;
}

export interface PaymentVerifyResult {
  reference: string;
  status: TransactionStatus;
  paid: boolean;
  draftId: string;
  amountKobo: number;
  currency: string;
  published: boolean;
  notice: PublicNoticeResponse | null;
  email: string | null;
}

type TransactionWithPublication = Transaction & {
  notice: Notice | null;
  draft: { notice: Notice | null } | null;
};

function resolvePublishedNotice(
  transaction: TransactionWithPublication
): { notice: Notice; email: string } | null {
  const notice = transaction.notice ?? transaction.draft?.notice ?? null;
  if (!notice) return null;
  return { notice, email: notice.email };
}

function buildPaymentVerifyResult(
  transaction: TransactionWithPublication,
  status: TransactionStatus,
  paid: boolean,
  publication: ReturnType<typeof resolvePublishedNotice>
): PaymentVerifyResult {
  return {
    reference: transaction.reference,
    status,
    paid,
    draftId: transaction.draftId,
    amountKobo: transaction.amountKobo,
    currency: transaction.currency,
    published: Boolean(publication),
    notice: publication ? toPublicNotice(publication.notice) : null,
    email: publication?.email ?? null,
  };
}

async function loadTransactionWithPublication(
  reference: string
): Promise<TransactionWithPublication | null> {
  return prisma.transaction.findUnique({
    where: { reference },
    include: {
      notice: true,
      draft: { include: { notice: true } },
    },
  });
}

async function ensureNoticePublished(
  reference: string,
  charge: PaystackChargeSuccessEvent["data"]
): Promise<ReturnType<typeof resolvePublishedNotice>> {
  await publishNoticeFromPayment(reference, charge);

  const refreshed = await loadTransactionWithPublication(reference);
  if (!refreshed) return null;
  return resolvePublishedNotice(refreshed);
}

export async function initializePayment(
  draftId: string,
  request: NextRequest
): Promise<PaymentInitializeResult> {
  const { draft } = await requireDraftAccess(draftId, request);

  if (draft.status !== "IN_PROGRESS") {
    throw new ApiError("CONFLICT", "This application has already been submitted.");
  }

  assertDraftReadyForPayment(draft);

  const existingSuccess = await prisma.transaction.findFirst({
    where: { draftId: draft.id, status: "SUCCESS" },
  });
  if (existingSuccess) {
    throw new ApiError("CONFLICT", "This application has already been paid.");
  }

  const reference = generatePaymentReference();
  const paystack = await paystackInitializeTransaction({
    email: draft.email,
    reference,
    draftId: draft.id,
  });

  await prisma.transaction.create({
    data: {
      draftId: draft.id,
      reference,
      method: "PAYSTACK",
      service: "CHANGE_OF_NAME",
      amountKobo: CHANGE_OF_NAME_FEE_KOBO,
      currency: "NGN",
      status: "PENDING",
    },
  });

  return {
    reference: paystack.reference,
    authorizationUrl: paystack.authorization_url,
    accessCode: paystack.access_code,
    amountKobo: CHANGE_OF_NAME_FEE_KOBO,
    currency: "NGN",
    draftId: draft.id,
  };
}

export async function verifyPayment(reference: string): Promise<PaymentVerifyResult> {
  const transaction = await loadTransactionWithPublication(reference);

  if (!transaction) {
    throw new ApiError("NOT_FOUND", "Payment reference not found.");
  }

  if (transaction.status === "SUCCESS") {
    let publication = resolvePublishedNotice(transaction);
    if (!publication) {
      const paystack = await paystackVerifyTransaction(reference);
      publication = await ensureNoticePublished(reference, {
        reference,
        status: paystack.status,
        amount: paystack.amount,
        paid_at: paystack.paid_at,
        metadata: paystack.metadata,
      });
    }

    return buildPaymentVerifyResult(transaction, transaction.status, true, publication);
  }

  const paystack = await paystackVerifyTransaction(reference);

  if (paystack.amount !== transaction.amountKobo) {
    throw new ApiError("BAD_REQUEST", "Payment amount does not match the expected fee.");
  }

  const paid = paystack.status === "success";
  let status: TransactionStatus = transaction.status;
  let publication = resolvePublishedNotice(transaction);

  if (paid) {
    if (!publication) {
      publication = await ensureNoticePublished(reference, {
        reference,
        status: paystack.status,
        amount: paystack.amount,
        paid_at: paystack.paid_at,
        metadata: paystack.metadata,
      });
    }

    status = "SUCCESS";
  } else if (paystack.status === "failed" && transaction.status === "PENDING") {
    status = "FAILED";
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "FAILED" },
    });
  }

  return buildPaymentVerifyResult(transaction, status, paid, publication);
}