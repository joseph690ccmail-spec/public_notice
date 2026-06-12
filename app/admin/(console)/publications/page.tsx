import React from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPublicationsTable } from "@/components/admin/AdminPublicationsTable";
import { requireAdminSession } from "@/lib/admin/guard";

export default async function AdminPublicationsPage() {
  await requireAdminSession();

  return (
    <>
      <AdminPageHeader
        title="Publications"
        description="Review published notices with full applicant, affidavit, and payment details."
      />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <AdminPublicationsTable />
      </div>
    </>
  );
}