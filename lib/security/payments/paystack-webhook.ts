import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { getClientIp } from "@/lib/security/client-ip";
import { getPaystackWebhookIps, requireEnv } from "@/lib/security/env";
import { ApiError } from "@/lib/api/errors";

const PAYSTACK_SIGNATURE_HEADER = "x-paystack-signature";

export interface PaystackWebhookVerification {
  rawBody: string;
  signature: string;
}

export function computePaystackSignature(rawBody: string, secretKey: string): string {
  return createHmac("sha512", secretKey).update(rawBody).digest("hex");
}

export function verifyPaystackSignature(
  rawBody: string,
  signatureHeader: string | null,
  secretKey: string
): boolean {
  if (!signatureHeader) return false;

  const expected = computePaystackSignature(rawBody, secretKey);
  try {
    const expectedBuf = Buffer.from(expected, "hex");
    const receivedBuf = Buffer.from(signatureHeader, "hex");
    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    const expectedUtf8 = Buffer.from(expected);
    const receivedUtf8 = Buffer.from(signatureHeader);
    if (expectedUtf8.length !== receivedUtf8.length) return false;
    return timingSafeEqual(expectedUtf8, receivedUtf8);
  }
}

export async function assertPaystackWebhookRequest(
  request: NextRequest
): Promise<PaystackWebhookVerification> {
  const allowedIps = getPaystackWebhookIps();
  if (allowedIps.length > 0) {
    const clientIp = getClientIp(request);
    if (!allowedIps.includes(clientIp)) {
      throw new ApiError("FORBIDDEN", "Webhook source IP is not allowed.");
    }
  }

  const secretKey = requireEnv("PAYSTACK_SECRET_KEY");
  const signature = request.headers.get(PAYSTACK_SIGNATURE_HEADER);
  const rawBody = await request.text();

  const valid = verifyPaystackSignature(rawBody, signature, secretKey);
  if (!valid) {
    throw new ApiError("UNAUTHORIZED", "Invalid Paystack webhook signature.");
  }

  return {
    rawBody,
    signature: signature ?? "",
  };
}

export interface PaystackChargeSuccessEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount?: number;
    paid_at?: string;
    metadata?: {
      draftId?: string;
      service?: string;
      [key: string]: unknown;
    };
  };
}

export function parsePaystackEvent(rawBody: string): PaystackChargeSuccessEvent {
  try {
    return JSON.parse(rawBody) as PaystackChargeSuccessEvent;
  } catch {
    throw new ApiError("BAD_REQUEST", "Webhook payload is not valid JSON.");
  }
}