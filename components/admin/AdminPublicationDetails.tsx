import React from "react";
import { AdminDetailField } from "@/components/admin/AdminDetailField";
import { AdminDetailGrid } from "@/components/admin/AdminDetailGrid";
import { AdminDetailSection } from "@/components/admin/AdminDetailSection";
import { AdminDetailStatus } from "@/components/admin/AdminDetailStatus";
import type { AdminNoticeDetail } from "@/lib/admin/notices-dto";
import { formatNoticeDate } from "@/lib/notices";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAmount(kobo: number, currency: string): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(kobo / 100);
}

interface AdminPublicationDetailsProps {
  notice: AdminNoticeDetail;
}

export function AdminPublicationDetails({ notice }: AdminPublicationDetailsProps) {
  return (
    <div className="admin-detail-layout">
      <div className="admin-detail-summary">
        <p className="admin-detail-summary__eyebrow">Publication record</p>
        <p className="admin-detail-summary__primary">{notice.pnn}</p>
        <p className="admin-detail-summary__secondary">
          {notice.formerName}
          <span className="admin-detail-summary__arrow" aria-hidden>
            →
          </span>
          {notice.newName}
        </p>
        <div className="admin-detail-summary__meta">
          <span>Published {formatNoticeDate(notice.publishedAt)}</span>
          <AdminDetailStatus label={notice.verified ? "Verified" : "Unverified"} />
        </div>
      </div>

      <AdminDetailSection
        title="Notice details"
        description="Core publication and applicant contact information."
      >
        <AdminDetailGrid>
          <AdminDetailField label="Reason" value={notice.reason} />
          <AdminDetailField label="Reason (other)" value={notice.reasonOther} />
          <AdminDetailField label="Email" value={notice.email} />
          <AdminDetailField label="Phone" value={notice.phone} />
          <AdminDetailField
            label="Consent given"
            value={<AdminDetailStatus label={notice.consentGiven ? "Yes" : "No"} />}
          />
          <AdminDetailField label="Created" value={formatDateTime(notice.createdAt)} />
          <AdminDetailField label="Notice ID" value={notice.id} mono fullWidth />
          <AdminDetailField label="Draft ID" value={notice.draftId} mono fullWidth />
        </AdminDetailGrid>
      </AdminDetailSection>

      <AdminDetailSection
        title="Affidavit"
        description="Uploaded document metadata and verification outcome."
      >
        <AdminDetailGrid>
          <AdminDetailField
            label="Verdict"
            value={
              notice.affidavitVerdict ? (
                <AdminDetailStatus label={notice.affidavitVerdict} />
              ) : null
            }
          />
          <AdminDetailField
            label="Confidence"
            value={
              notice.affidavitConfidence !== null
                ? `${Math.round(notice.affidavitConfidence * 100)}%`
                : null
            }
          />
          <AdminDetailField
            label="Uploaded"
            value={formatDateTime(notice.affidavitUploadedAt)}
          />
          <AdminDetailField
            label="Verified at"
            value={formatDateTime(notice.affidavitVerifiedAt)}
          />
          <AdminDetailField label="MIME type" value={notice.affidavitMimeType} />
          <AdminDetailField
            label="Size"
            value={
              notice.affidavitSizeBytes
                ? `${notice.affidavitSizeBytes.toLocaleString()} bytes`
                : null
            }
          />
          <AdminDetailField
            label="Issues"
            value={
              notice.affidavitIssues.length > 0 ? notice.affidavitIssues.join(", ") : null
            }
            fullWidth
          />
          <AdminDetailField
            label="Object key"
            value={notice.affidavitObjectKey}
            mono
            fullWidth
          />
        </AdminDetailGrid>
      </AdminDetailSection>

      {notice.draft ? (
        <AdminDetailSection
          title="Linked draft"
          description="Guest application session that produced this publication."
        >
          <AdminDetailGrid>
            <AdminDetailField
              label="Status"
              value={<AdminDetailStatus label={notice.draft.status} />}
            />
            <AdminDetailField label="Email" value={notice.draft.email} />
            <AdminDetailField label="Phone" value={notice.draft.phone} />
            <AdminDetailField
              label="Created"
              value={formatDateTime(notice.draft.createdAt)}
            />
            <AdminDetailField
              label="Updated"
              value={formatDateTime(notice.draft.updatedAt)}
            />
            <AdminDetailField label="Draft ID" value={notice.draft.id} mono fullWidth />
          </AdminDetailGrid>
        </AdminDetailSection>
      ) : null}

      {notice.transactions.length > 0 ? (
        <AdminDetailSection
          title="Payments"
          description={`${notice.transactions.length} transaction${
            notice.transactions.length === 1 ? "" : "s"
          } linked to this notice.`}
        >
          <ul className="admin-detail-card-list">
            {notice.transactions.map((transaction) => (
              <li key={transaction.id} className="admin-detail-card-list__item">
                <div className="admin-detail-card-list__row">
                  <p className="admin-detail-card-list__title">{transaction.reference}</p>
                  <AdminDetailStatus label={transaction.status} />
                </div>
                <p className="admin-detail-card-list__amount">
                  {formatAmount(transaction.amountKobo, transaction.currency)}
                </p>
                <p className="admin-detail-card-list__meta">
                  {transaction.method} ·{" "}
                  {formatDateTime(transaction.paidAt ?? transaction.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </AdminDetailSection>
      ) : null}
    </div>
  );
}