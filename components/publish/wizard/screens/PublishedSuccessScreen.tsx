import React from "react";
import { Checkmark } from "@carbon/icons-react";
import { Button } from "@carbon/react";
import { LegalDisclaimer } from "@/components/publish/LegalDisclaimer";
import type { PublicNoticeResponse } from "@/lib/notices/dto";

interface PublishedSuccessScreenProps {
  notice: PublicNoticeResponse;
  email: string;
}

export function PublishedSuccessScreen({ notice, email }: PublishedSuccessScreenProps) {
  return (
    <div className="w-full max-w-3xl border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-6 md:p-8">
      <div className="mb-4 flex size-12 items-center justify-center bg-[var(--color-primary)] text-white">
        <Checkmark size={24} />
      </div>
      <h2 className="text-2xl font-light tracking-[-0.2px] text-[var(--color-ink)]">
        Notice published
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)] tracking-[0.16px]">
        Your Change of Name notice is now on the public ledger. Your permanent Public Notice Number
        is below — share it with banks, NIMC, or anyone who needs to verify your name change.
      </p>
      <p className="mt-4 font-mono text-lg text-[var(--color-primary)]">{notice.pnn}</p>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        A confirmation has been sent to <strong className="text-[var(--color-ink)]">{email}</strong>.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button kind="primary" href={`/notices/${notice.pnn}`}>
          View notice
        </Button>
        <Button kind="secondary" href="/">
          Return home
        </Button>
      </div>
      <LegalDisclaimer className="mt-8 border-t border-[var(--color-hairline)] pt-4" />
    </div>
  );
}