import type { DraftResponse } from "@/lib/drafts/dto";
import type { PublicNoticeResponse } from "@/lib/notices/dto";
import type { PaymentInitializeResult, PaymentVerifyResult } from "@/lib/payments/service";
import { getOrCreateDraftFingerprint } from "@/lib/api/fingerprint";

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

export class PublishApiError extends Error {
  readonly code: string;
  readonly details?: string[];

  constructor(code: string, message: string, details?: string[]) {
    super(message);
    this.name = "PublishApiError";
    this.code = code;
    this.details = details;
  }
}

type ApiFetchOptions = RequestInit & {
  bindDraft?: boolean;
  json?: unknown;
};

async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { json, bindDraft = true, ...init } = options;
  const headers = new Headers(init.headers);

  if (bindDraft) {
    headers.set("X-Draft-Fingerprint", getOrCreateDraftFingerprint());
  }

  let body = init.body;
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }

  const response = await fetch(path, { ...init, headers, body });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new PublishApiError("INTERNAL_ERROR", "Invalid response from server.");
  }

  if (!response.ok) {
    const err = payload as ApiErrorPayload;
    throw new PublishApiError(
      err.error?.code ?? "INTERNAL_ERROR",
      err.error?.message ?? "Request failed.",
      err.error?.details
    );
  }

  return (payload as { data: T }).data;
}

export async function initDraft(email: string, forceNew = false): Promise<DraftResponse> {
  return apiFetch<DraftResponse>("/api/v1/drafts/init", {
    method: "POST",
    json: { email, forceNew },
  });
}

export async function abandonDraftByEmail(
  email: string
): Promise<{ deleted: boolean; draftId: string | null }> {
  return apiFetch("/api/v1/drafts/abandon", {
    method: "POST",
    json: { email },
  });
}

export interface PatchDraftPayload {
  oldName?: string;
  newName?: string;
  reason?: string;
  reasonOther?: string;
  phone?: string;
  consentGiven?: boolean;
}

export async function patchDraft(
  draftId: string,
  payload: PatchDraftPayload
): Promise<DraftResponse> {
  return apiFetch<DraftResponse>(`/api/v1/drafts/${draftId}`, {
    method: "PATCH",
    json: payload,
  });
}

export async function uploadAffidavit(draftId: string, file: File): Promise<DraftResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<DraftResponse>(`/api/v1/drafts/${draftId}/affidavit`, {
    method: "POST",
    body: formData,
  });
}

export async function sendSaveForLaterLink(draftId: string): Promise<{
  sent: boolean;
  draftId: string;
  resumeUrl: string;
}> {
  return apiFetch(`/api/v1/drafts/${draftId}/save-link`, { method: "POST" });
}

export async function discardDraft(draftId: string): Promise<{ deleted: boolean; draftId: string }> {
  return apiFetch(`/api/v1/drafts/${draftId}`, { method: "DELETE" });
}

export async function initializePayment(draftId: string): Promise<PaymentInitializeResult> {
  return apiFetch<PaymentInitializeResult>("/api/v1/payments/initialize", {
    method: "POST",
    json: { draftId },
  });
}

export async function verifyPayment(reference: string): Promise<PaymentVerifyResult> {
  return apiFetch<PaymentVerifyResult>(
    `/api/v1/payments/verify/${encodeURIComponent(reference)}`,
    { bindDraft: false }
  );
}

export async function searchNotices(query: string): Promise<{ query: string; items: PublicNoticeResponse[] }> {
  return apiFetch("/api/v1/notices/search", {
    method: "POST",
    json: { query },
    bindDraft: false,
  });
}

export async function getNoticeByPnn(pnn: string): Promise<PublicNoticeResponse> {
  return apiFetch<PublicNoticeResponse>(
    `/api/v1/notices/${encodeURIComponent(pnn)}`,
    { bindDraft: false }
  );
}

export async function pollForPublishedNotice(
  newName: string,
  options?: { attempts?: number; intervalMs?: number }
): Promise<PublicNoticeResponse | null> {
  const attempts = options?.attempts ?? 20;
  const intervalMs = options?.intervalMs ?? 2000;
  const trimmed = newName.trim();

  for (let i = 0; i < attempts; i++) {
    const result = await searchNotices(trimmed);
    const match = result.items.find(
      (item) => item.newName.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (match) return match;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return null;
}