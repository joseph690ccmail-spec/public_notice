import React from "react";
import { CheckmarkFilled } from "@carbon/icons-react";
import { LegalDisclaimer } from "@/components/publish/LegalDisclaimer";
import { PUBLICATION_FEE_NGN } from "@/lib/publish";

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

export function WhatYouWillNeed() {
  return (
    <aside className="sticky top-6 border border-[var(--color-hairline)] bg-[var(--color-surface-1)] p-5 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
        Before you begin
      </p>
      <h3 className="mt-2 text-lg font-medium text-[var(--color-ink)]">What you will need</h3>
      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        <ChecklistItem>
          A court-sworn Change of Name affidavit from a Nigerian High Court
        </ChecklistItem>
        <ChecklistItem>
          A clear photo or scan of the affidavit (JPG, PNG, or WebP)
        </ChecklistItem>
        <ChecklistItem>
          Your former and new legal names exactly as they should appear publicly
        </ChecklistItem>
        <ChecklistItem>
          ₦{PUBLICATION_FEE_NGN.toLocaleString("en-NG")} for instant digital publication
        </ChecklistItem>
      </ul>
      <LegalDisclaimer className="mt-6 border-t border-[var(--color-hairline)] pt-4" />
    </aside>
  );
}