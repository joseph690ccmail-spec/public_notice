import type { NextRequest } from "next/server";
import type { TransactionStatus } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import { requireDraftAccess } from "@/lib/drafts/access";
import { prisma } from "@/lib/db";
import { CHANGE_OF_NAME_FEE_KOBO } from "@/lib/payments/constants";
import {
  paystackInitializeTransaction,
  paystackVerifyTransaction,
} from "@/lib/payments/paystack";
import { generatePaymentReference } from "@/lib/payments/reference";
import { assertDraftReadyForPayment } from "@/lib/payments/validate-draft";

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
  const transaction = await prisma.transaction.findUnique({
    where: { reference },
  });

  if (!transaction) {
    throw new ApiError("NOT_FOUND", "Payment reference not found.");
  }

  if (transaction.status === "SUCCESS") {
    return {
      reference: transaction.reference,
      status: transaction.status,
      paid: true,
      draftId: transaction.draftId,
      amountKobo: transaction.amountKobo,
      currency: transaction.currency,
    };
  }

  const paystack = await paystackVerifyTransaction(reference);

  if (paystack.amount !== transaction.amountKobo) {
    throw new ApiError("BAD_REQUEST", "Payment amount does not match the expected fee.");
  }

  const paid = paystack.status === "success";
  let status: TransactionStatus = transaction.status;

  if (paid) {
    status = "SUCCESS";
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: "SUCCESS",
        paidAt: paystack.paid_at ? new Date(paystack.paid_at) : new Date(),
      },
    });
  } else if (paystack.status === "failed" && transaction.status === "PENDING") {
    status = "FAILED";
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "FAILED" },
    });
  }

  return {
    reference: transaction.reference,
    status,
    paid,
    draftId: transaction.draftId,
    amountKobo: transaction.amountKobo,
    currency: transaction.currency,
  };
}