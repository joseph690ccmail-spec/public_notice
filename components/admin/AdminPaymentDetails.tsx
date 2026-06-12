import React from "react";
import { AdminDetailField } from "@/components/admin/AdminDetailField";
import { AdminDetailGrid } from "@/components/admin/AdminDetailGrid";
import { AdminDetailSection } from "@/components/admin/AdminDetailSection";
import { AdminDetailStatus } from "@/components/admin/AdminDetailStatus";
import type { AdminPaymentDetail } from "@/lib/admin/payments-dto";

function formatAmount(kobo: number, currency: string): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(kobo / 100);
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

interface AdminPaymentDetailsProps {
  payment: AdminPaymentDetail;
}

export function AdminPaymentDetails({ payment }: AdminPaymentDetailsProps) {
  return (
    <div className="admin-detail-layout">
      <div className="admin-detail-summary">
        <p className="admin-detail-summary__eyebrow">Payment record</p>
        <p className="admin-detail-summary__primary">{payment.reference}</p>
        <p className="admin-detail-summary__amount">
          {formatAmount(payment.amountKobo, payment.currency)}
        </p>
        <div className="admin-detail-summary__meta">
          <AdminDetailStatus label={payment.status} />
          <span>{payment.method}</span>
          <span>{payment.service}</span>
        </div>
      </div>

      <AdminDetailSection
        title="Transaction"
        description="Ledger entry and settlement timestamps."
      >
        <AdminDetailGrid>
          <AdminDetailField label="Currency" value={payment.currency} />
          <AdminDetailField label="Paid at" value={formatDateTime(payment.paidAt)} />
          <AdminDetailField label="Created" value={formatDateTime(payment.createdAt)} />
          <AdminDetailField label="Updated" value={formatDateTime(payment.updatedAt)} />
          <AdminDetailField label="Transaction ID" value={payment.id} mono fullWidth />
          <AdminDetailField label="Draft ID" value={payment.draftId} mono fullWidth />
          <AdminDetailField label="Notice ID" value={payment.noticeId} mono fullWidth />
        </AdminDetailGrid>
      </AdminDetailSection>

      <AdminDetailSection
        title="Draft"
        description="Guest application associated with this payment attempt."
      >
        <AdminDetailGrid>
          <AdminDetailField
            label="Status"
            value={<AdminDetailStatus label={payment.draft.status} />}
          />
          <AdminDetailField label="Email" value={payment.draft.email} />
          <AdminDetailField label="Phone" value={payment.draft.phone} />
          <AdminDetailField label="Former name" value={payment.draft.formerName} />
          <AdminDetailField label="New name" value={payment.draft.newName} />
          <AdminDetailField
            label="Created"
            value={formatDateTime(payment.draft.createdAt)}
          />
          <AdminDetailField
            label="Updated"
            value={formatDateTime(payment.draft.updatedAt)}
          />
          <AdminDetailField label="Draft ID" value={payment.draft.id} mono fullWidth />
        </AdminDetailGrid>
      </AdminDetailSection>

      {payment.notice ? (
        <AdminDetailSection
          title="Linked publication"
          description="Published notice produced after successful payment."
        >
          <div className="admin-detail-linked-card">
            <p className="admin-detail-linked-card__label">PNN</p>
            <p className="admin-detail-linked-card__value">{payment.notice.pnn}</p>
            <p className="admin-detail-linked-card__names">
              {payment.notice.formerName}
              <span className="admin-detail-summary__arrow" aria-hidden>
                →
              </span>
              {payment.notice.newName}
            </p>
            <AdminDetailGrid>
              <AdminDetailField label="Email" value={payment.notice.email} />
              <AdminDetailField
                label="Published"
                value={formatDateTime(payment.notice.publishedAt)}
              />
              <AdminDetailField label="Notice ID" value={payment.notice.id} mono fullWidth />
            </AdminDetailGrid>
          </div>
        </AdminDetailSection>
      ) : null}
    </div>
  );
}