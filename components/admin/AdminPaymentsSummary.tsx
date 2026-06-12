import React from "react";
import { getAdminPaymentsStats } from "@/lib/admin/payments";

function formatAmount(kobo: number, currency: string): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(kobo / 100);
}

function formatCount(value: number, label: string): string {
  return `${value.toLocaleString("en-NG")} ${label}${value === 1 ? "" : "s"}`;
}

export async function AdminPaymentsSummary() {
  const stats = await getAdminPaymentsStats();

  return (
    <section className="admin-payments-summary" aria-label="Payment totals">
      <div className="admin-payments-summary__hero">
        <p className="admin-payments-summary__eyebrow">Total received</p>
        <p className="admin-payments-summary__amount">
          {formatAmount(stats.receivedKobo, stats.currency)}
        </p>
        <p className="admin-payments-summary__caption">
          {stats.successfulCount > 0
            ? `From ${formatCount(stats.successfulCount, "successful payment")}`
            : "No successful payments recorded yet"}
        </p>
      </div>

      <div className="admin-payments-summary__stat">
        <p className="admin-payments-summary__stat-label">Payment attempts</p>
        <p className="admin-payments-summary__stat-value">
          {stats.totalAttempts.toLocaleString("en-NG")}
        </p>
      </div>

      <div className="admin-payments-summary__stat">
        <p className="admin-payments-summary__stat-label">Pending</p>
        <p className="admin-payments-summary__stat-value">
          {stats.pendingCount.toLocaleString("en-NG")}
        </p>
      </div>

      <div className="admin-payments-summary__stat">
        <p className="admin-payments-summary__stat-label">Failed</p>
        <p className="admin-payments-summary__stat-value">
          {stats.failedCount.toLocaleString("en-NG")}
        </p>
      </div>
    </section>
  );
}