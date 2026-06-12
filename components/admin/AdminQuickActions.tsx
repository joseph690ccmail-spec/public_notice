"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, DocumentMultiple_02, Wallet } from "@carbon/icons-react";
import { ClickableTile } from "@carbon/react";

export function AdminQuickActions() {
  return (
    <div className="admin-quick-actions quick-actions-grid grid grid-cols-1 gap-4 md:grid-cols-2">
      <Link href="/admin/publications" prefetch={false} className="block no-underline">
        <ClickableTile
          className="admin-quick-actions__tile"
          renderIcon={ArrowRight}
          title="Publications"
        >
          <DocumentMultiple_02
            size={32}
            aria-hidden
            className="mb-3 text-[var(--color-primary)]"
          />
          <h3 className="text-xl font-medium tracking-tight mb-2 transition-colors">
            Publications
          </h3>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            Review published notices with full applicant and affidavit details.
          </p>
        </ClickableTile>
      </Link>

      <Link href="/admin/payments" prefetch={false} className="block no-underline">
        <ClickableTile
          className="admin-quick-actions__tile"
          renderIcon={ArrowRight}
          title="Payments"
        >
          <Wallet size={32} aria-hidden className="mb-3 text-[var(--color-primary)]" />
          <h3 className="text-xl font-medium tracking-tight mb-2 transition-colors">Payments</h3>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            Monitor payment attempts, successful transactions, and linked drafts.
          </p>
        </ClickableTile>
      </Link>
    </div>
  );
}