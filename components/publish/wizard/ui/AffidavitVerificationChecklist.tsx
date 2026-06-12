import React from "react";
import { CheckmarkFilled } from "@carbon/icons-react";

function ChecklistItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <CheckmarkFilled
        size={18}
        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
        aria-hidden
      />
      <span>{children}</span>
    </li>
  );
}

interface AffidavitVerificationChecklistProps {
  compact?: boolean;
}

export function AffidavitVerificationChecklist({
  compact = false,
}: AffidavitVerificationChecklistProps) {
  return (
    <aside
      className={
        compact
          ? "border border-[var(--color-hairline)] bg-[var(--color-surface-1)] p-4"
          : "border border-[var(--color-hairline)] bg-[var(--color-surface-1)] p-5 md:p-6 lg:sticky lg:top-6"
      }
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
        Before you upload
      </p>
      <h3 className="mt-2 text-lg font-medium text-[var(--color-ink)]">
        Valid affidavit checklist
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        Your image is verified automatically before you can continue. Upload a sworn Change of Name
        affidavit that meets all of the following:
      </p>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        <ChecklistItem>
          Issued and sworn at a Nigerian High Court or Magistrate Court
        </ChecklistItem>
        <ChecklistItem>
          The photo of the affidavit must be very clear and legible, no heavy blur, glare, or cropped edges.
        </ChecklistItem>
        <ChecklistItem>
          Includes a visible court stamp or seal and Commissioner for Oaths signature
        </ChecklistItem>
        <ChecklistItem>
          Shows the deponent&rsquo;s signature or thumbprint and attached passport photograph
        </ChecklistItem>
        <ChecklistItem>File is a JPG, PNG, or WebP image (not a blank template)</ChecklistItem>
      </ul>
    </aside>
  );
}