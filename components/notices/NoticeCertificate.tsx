import React from "react";
import { formatNoticeDate, type ChangeOfNameNotice } from "@/lib/notices";

interface NoticeCertificateProps {
  notice: ChangeOfNameNotice;
  id?: string;
}

const contentLayer = "relative z-[1]";

export function NoticeCertificate({
  notice,
  id = "notice-certificate-print",
}: NoticeCertificateProps) {
  const verifyUrl = `https://pns.ng/verify/${notice.pnn}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(verifyUrl)}`;
  const isPrintSource = id === "notice-certificate-print";

  return (
    <article
      id={id}
      className={[
        "relative overflow-hidden border border-ink bg-canvas p-6 text-ink sm:p-8",
        isPrintSource &&
          "print:m-0 print:w-full print:max-w-none print:p-[8mm_10mm] print:shadow-none print:break-inside-avoid print:[print-color-adjust:exact]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center p-8 text-center text-[clamp(1.5rem,5vw,2.5rem)] font-bold text-black/[0.04] -rotate-[18deg]"
        aria-hidden
      >
        DIGITAL PUBLIC NOTICE
      </div>

      <header className={`${contentLayer} flex items-start justify-between gap-5`}>
        <div className="flex min-w-0 flex-1 items-start gap-4 text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/img/seal.svg"
            alt="Coat of Arms of Nigeria"
            width={72}
            height={72}
            className="size-[4.5rem] shrink-0 object-contain"
          />

          <div className="min-w-0 flex-1">
            <p className="m-0 text-[0.7875rem] font-semibold uppercase text-ink-muted">
              FEDERAL REPUBLIC OF NIGERIA
            </p>
            <p className="mt-1 text-[1rem] font-bold leading-snug text-ink">
              Federal Ministry of Information and National Orientation
            </p>
            <p className="mt-0.5 text-sm text-ink-muted">
              Public Notice System — National Registry
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt={`QR code to verify ${notice.pnn}`}
            width={50}
            height={50}
            className="size-16 border border-hairline-strong object-contain"
          />
          <span className="font-mono text-[0.9375rem] text-ink">
            {notice.pnn}
          </span>
        </div>
      </header>

      <div className={`${contentLayer} my-5 border-t border-hairline-strong`} />

      <div className={`${contentLayer} mb-6 text-center`}>
        <p className="m-0 text-[0.6875rem] font-semibold uppercase text-ink-muted">
          CERTIFICATE OF PUBLICATION
        </p>
        <h2 className="mt-1.5 text-xl font-semibold text-ink">
          Public Notice — Change of Name
        </h2>
        <p className="mt-1 text-[0.7rem] text-ink-muted">
          Published {formatNoticeDate(notice.publishedAt)}
        </p>
      </div>

      <section className={contentLayer} aria-label="Name change notice">
        <p className="mb-3 text-[0.6875rem] font-bold uppercase text-ink">
          Public notice
        </p>
        <p className="m-0 text-[1.125rem] leading-[1.8] text-justify text-ink print:text-[1.125rem] print:leading-[1.85] [&_strong]:font-bold [&_strong]:uppercase [&_strong]:text-ink">
          I, formerly known as <strong>{notice.formerName}</strong>, now wish to be
          called and addressed as <strong>{notice.newName}</strong>. All former
          documents remain valid. General public should please take note.
        </p>
      </section>

      <footer
        className={`${contentLayer} mt-5 border-t border-hairline-strong pt-3 text-center`}
      >
        <p className="m-0 text-[0.8rem] leading-snug text-ink-subtle print:text-ink-subtle">
          This is an official digital public notice issued under the Public Notice
          System. It does not replace statutory procedures where applicable.
        </p>
      </footer>
    </article>
  );
}