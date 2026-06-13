"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Checkmark, Printer } from "@carbon/icons-react";
import { Button } from "@carbon/react";
import { NoticeCertificate } from "@/components/notices/NoticeCertificate";
import { LegalDisclaimer } from "@/components/publish/LegalDisclaimer";
import type { PublicNoticeResponse } from "@/lib/notices/dto";
import { publicNoticeToCertificateNotice } from "@/lib/notices/mappers";
import { useCertificatePrint } from "@/lib/useCertificatePrint";

interface PublishedSuccessScreenProps {
  notice: PublicNoticeResponse;
  email: string;
  onReturnHome: () => void;
}

export function PublishedSuccessScreen({
  notice,
  email,
  onReturnHome,
}: PublishedSuccessScreenProps) {
  const handlePrint = useCertificatePrint();
  const certificateNotice = publicNoticeToCertificateNotice(notice);

  return (
    <>
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="min-w-0 border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-6 md:p-8">
          <div className="mb-4 flex size-12 items-center justify-center bg-[var(--color-primary)] text-white">
            <Checkmark size={24} />
          </div>
          <h2 className="text-2xl font-light tracking-[-0.2px] text-[var(--color-ink)]">
            Notice published
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)] tracking-[0.16px]">
            Your Change of Name notice is now on the public ledger. Your permanent Public Notice
            Number is below — share it with banks, NIMC, or anyone who needs to verify your name
            change.
          </p>
          <p className="mt-4 font-mono text-lg text-[var(--color-primary)]">{notice.pnn}</p>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            A confirmation has been sent to{" "}
            <strong className="text-[var(--color-ink)]">{email}</strong>.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button kind="primary" renderIcon={Printer} onClick={handlePrint}>
              Print certificate
            </Button>
            <Button kind="secondary" onClick={onReturnHome}>
              Return home
            </Button>
          </div>
          <LegalDisclaimer className="mt-8 border-t border-[var(--color-hairline)] pt-4" />
        </div>

        <aside className="min-w-0 self-start lg:sticky lg:top-6">
          <div className="border border-[var(--color-hairline)] bg-[var(--color-surface-2)] p-4">
            <NoticeCertificate notice={certificateNotice} id="notice-certificate-preview" />
          </div>
        </aside>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <div data-certificate-print-portal className="hidden" aria-hidden="true">
            <NoticeCertificate notice={certificateNotice} id="notice-certificate-print" />
          </div>,
          document.body
        )}
    </>
  );
}