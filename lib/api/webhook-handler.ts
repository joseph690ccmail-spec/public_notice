import type { NextRequest } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/api/errors";
import { applyCorsHeaders } from "@/lib/security/cors";
import { applySecurityHeaders, jsonWithSecurityHeaders } from "@/lib/security/headers";
import {
  assertPaystackWebhookRequest,
  parsePaystackEvent,
  type PaystackChargeSuccessEvent,
} from "@/lib/security/payments/paystack-webhook";
import {
  ensureNotProcessed,
  markProcessed,
  paymentReferenceKey,
} from "@/lib/security/payments/idempotency";

export interface PaystackWebhookContext {
  request: NextRequest;
  event: PaystackChargeSuccessEvent;
  rawBody: string;
}

/**
 * Secure wrapper for POST /api/v1/webhooks/paystack.
 * Verifies signature, enforces idempotency on payment reference, then runs handler.
 */
export function createPaystackWebhookHandler(
  handler: (ctx: PaystackWebhookContext) => Promise<Response> | Response
) {
  return async function paystackWebhookRoute(request: NextRequest): Promise<Response> {
    try {
      const { rawBody } = await assertPaystackWebhookRequest(request);
      const event = parsePaystackEvent(rawBody);

      if (event.event === "charge.success" && event.data?.reference) {
        const reference = paymentReferenceKey(event.data.reference);
        await ensureNotProcessed(reference, "paystack_webhook");
        const response = await handler({ request, event, rawBody });
        await markProcessed(reference, "paystack_webhook", {
          status: event.data.status,
        });
        return applySecurityHeaders(response);
      }

      return applySecurityHeaders(
        jsonWithSecurityHeaders({ received: true, ignored: true })
      );
    } catch (error) {
      if (error instanceof Error && error.name === "IdempotencyConflict") {
        return applySecurityHeaders(
          jsonWithSecurityHeaders(
            { received: true, duplicate: true },
            { status: 200 }
          )
        );
      }

      const { status, body } = toErrorResponse(error);
      return applySecurityHeaders(jsonWithSecurityHeaders(body, { status }));
    }
  };
}

export function assertChargeSuccess(
  event: PaystackChargeSuccessEvent
): asserts event is PaystackChargeSuccessEvent & {
  event: "charge.success";
  data: { reference: string; status: "success" };
} {
  if (event.event !== "charge.success") {
    throw new ApiError("BAD_REQUEST", "Unsupported Paystack event type.");
  }
  if (!event.data?.reference) {
    throw new ApiError("BAD_REQUEST", "Missing payment reference in webhook payload.");
  }
}