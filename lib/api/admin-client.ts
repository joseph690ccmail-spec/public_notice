import type { AdminNoticeDetail, AdminNoticeListResult } from "@/lib/admin/notices-dto";
import type { AdminPaymentDetail, AdminPaymentListResult } from "@/lib/admin/payments-dto";
import { PublishApiError, type ApiErrorPayload } from "@/lib/api/client";

async function adminFetch<T>(path: string): Promise<T> {
  const response = await fetch(path, { credentials: "include" });
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

export interface AdminPublicationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  verified?: "all" | "yes" | "no";
}

export interface AdminPaymentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "PENDING" | "SUCCESS" | "FAILED";
}

export async function listAdminPublications(
  query: AdminPublicationsQuery = {}
): Promise<AdminNoticeListResult> {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 20),
    verified: query.verified ?? "all",
  });

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  return adminFetch<AdminNoticeListResult>(`/api/v1/admin/publications?${params}`);
}

export async function getAdminPublication(pnn: string): Promise<AdminNoticeDetail> {
  return adminFetch<AdminNoticeDetail>(`/api/v1/admin/publications/${encodeURIComponent(pnn)}`);
}

export async function listAdminPayments(
  query: AdminPaymentsQuery = {}
): Promise<AdminPaymentListResult> {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 20),
    status: query.status ?? "all",
  });

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  return adminFetch<AdminPaymentListResult>(`/api/v1/admin/payments?${params}`);
}

export async function getAdminPayment(reference: string): Promise<AdminPaymentDetail> {
  return adminFetch<AdminPaymentDetail>(
    `/api/v1/admin/payments/${encodeURIComponent(reference)}`
  );
}