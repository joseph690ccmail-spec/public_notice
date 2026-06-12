import React, { Suspense } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPaymentsSummary } from "@/components/admin/AdminPaymentsSummary";
import { AdminPaymentsTable } from "@/components/admin/AdminPaymentsTable";
import { requireAdminSession } from "@/lib/admin/guard";

export default async function AdminPaymentsPage() {
  await requireAdminSession();

  return (
    <>
      <AdminPageHeader
        title="Payments"
        description="Monitor payment attempts, successful transactions, and linked drafts."
      />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <Suspense fallback={<div className="admin-payments-summary admin-payments-summary--loading" />}>
          <AdminPaymentsSummary />
        </Suspense>
        <AdminPaymentsTable />
      </div>
    </>
  );
}