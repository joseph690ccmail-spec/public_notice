import React from "react";
import type { PublishFormData } from "@/lib/publish";

interface ApplicationSummaryProps {
  form: PublishFormData;
  showReason?: boolean;
}

export function ApplicationSummary({ form, showReason = true }: ApplicationSummaryProps) {
  return (
    <dl className="grid gap-3 border border-[var(--color-hairline)] bg-[var(--color-surface-1)] p-4 text-sm">
      <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
        <dt className="text-[var(--color-ink-muted)]">Former name</dt>
        <dd className="font-medium uppercase text-[var(--color-ink)]">{form.formerName}</dd>
      </div>
      <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
        <dt className="text-[var(--color-ink-muted)]">New name</dt>
        <dd className="font-medium uppercase text-[var(--color-ink)]">{form.newName}</dd>
      </div>
      {showReason && (
        <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
          <dt className="text-[var(--color-ink-muted)]">Reason</dt>
          <dd className="text-[var(--color-ink)]">
            {form.reason === "Other" && form.reasonOther.trim()
              ? form.reasonOther
              : form.reason}
          </dd>
        </div>
      )}
      <div className="grid gap-1 sm:grid-cols-[8rem_1fr]">
        <dt className="text-[var(--color-ink-muted)]">Contact</dt>
        <dd className="text-[var(--color-ink)]">
          {form.email} · {form.phone}
        </dd>
      </div>
    </dl>
  );
}