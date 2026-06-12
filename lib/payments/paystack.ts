import { appBaseUrl } from "@/lib/app-url";
import { ApiError } from "@/lib/api/errors";
import { CHANGE_OF_NAME_FEE_KOBO, PAYSTACK_API_BASE } from "@/lib/payments/constants";
import { requireEnv } from "@/lib/security/env";

interface PaystackInitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackVerifyData {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string;
  metadata?: Record<string, unknown>;
}

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const secretKey = requireEnv("PAYSTACK_SECRET_KEY");
  const response = await fetch(`${PAYSTACK_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  let payload: { status?: boolean; message?: string; data?: T } = {};
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new ApiError("INTERNAL_ERROR", "Invalid response from Paystack.");
  }

  if (!response.ok || !payload.status || !payload.data) {
    throw new ApiError(
      "BAD_REQUEST",
      payload.message ?? "Paystack request failed."
    );
  }

  return payload.data;
}

export function buildPaymentCallbackUrl(draftId: string): string {
  const base = appBaseUrl();
  return `${base}/publish/change-of-name?draft=${draftId}&payment=return`;
}

export async function paystackInitializeTransaction(params: {
  email: string;
  reference: string;
  draftId: string;
  amountKobo?: number;
}): Promise<PaystackInitializeData> {
  const amount = params.amountKobo ?? CHANGE_OF_NAME_FEE_KOBO;

  return paystackRequest<PaystackInitializeData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount,
      reference: params.reference,
      currency: "NGN",
      callback_url: buildPaymentCallbackUrl(params.draftId),
      metadata: {
        draftId: params.draftId,
        service: "CHANGE_OF_NAME",
        custom_fields: [
          { display_name: "Service", variable_name: "service", value: "Change of Name" },
        ],
      },
    }),
  });
}

export async function paystackVerifyTransaction(
  reference: string
): Promise<PaystackVerifyData> {
  return paystackRequest<PaystackVerifyData>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}