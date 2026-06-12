import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "@carbon/icons-react";
import { Button } from "@carbon/react";
import { ButtonLabel } from "@/components/publish/wizard/ui/ButtonLabel";
import { PUBLICATION_FEE_NGN, PUBLISH_STEPS } from "@/lib/publish";

interface PublishWizardFooterProps {
  step: number;
  busy: boolean;
  consentGiven: boolean;
  uploadingAffidavit: boolean;
  verifyingAffidavit: boolean;
  affidavitVerificationFailed: boolean;
  onBack: () => void;
  onNext: () => void;
  onPay: () => void;
}

export function PublishWizardFooter({
  step,
  busy,
  consentGiven,
  uploadingAffidavit,
  verifyingAffidavit,
  affidavitVerificationFailed,
  onBack,
  onNext,
  onPay,
}: PublishWizardFooterProps) {
  const isLoading = busy || uploadingAffidavit || verifyingAffidavit;
  const payDisabled = busy || !consentGiven;
  const continueBlocked = step === 2 && affidavitVerificationFailed;
  const continueDisabled = isLoading || continueBlocked;
  const continueLabel = verifyingAffidavit
    ? "Verifying…"
    : uploadingAffidavit
      ? "Uploading…"
      : "Continue";
  const footerRef = useRef<HTMLDivElement>(null);
  const [compactBack, setCompactBack] = useState(false);

  const syncCompactBack = useCallback(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const overflows = footer.scrollWidth > footer.clientWidth + 1;
    setCompactBack((prev) => {
      if (overflows) return true;
      if (prev && footer.clientWidth >= 300) return false;
      return prev;
    });
  }, []);

  useLayoutEffect(() => {
    syncCompactBack();
  }, [step, isLoading, compactBack, syncCompactBack]);

  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => syncCompactBack());
    observer.observe(footer);
    return () => observer.disconnect();
  }, [syncCompactBack]);

  return (
    <div
      ref={footerRef}
      className="publish-wizard__footer mt-8 flex flex-row flex-nowrap items-center justify-between gap-3 border-t border-[var(--color-hairline)] pt-6"
    >
      <Button
        kind="secondary"
        className="publish-wizard__back-btn shrink-0"
        hasIconOnly={compactBack}
        renderIcon={ArrowLeft}
        iconDescription="Go back"
        disabled={step === 0 || isLoading}
        onClick={onBack}
      >
        {compactBack ? null : <span className="publish-wizard__back-label">Back</span>}
      </Button>

      {step < PUBLISH_STEPS.length - 1 ? (
        <Button
          kind="primary"
          className="shrink-0"
          renderIcon={continueDisabled ? undefined : ArrowRight}
          disabled={continueDisabled}
          onClick={onNext}
        >
          <ButtonLabel loading={isLoading && !continueBlocked}>{continueLabel}</ButtonLabel>
        </Button>
      ) : (
        <Button kind="primary" className="shrink-0" disabled={payDisabled} onClick={onPay}>
          <ButtonLabel loading={busy}>
            Pay ₦{PUBLICATION_FEE_NGN.toLocaleString("en-NG")}
          </ButtonLabel>
        </Button>
      )}
    </div>
  );
}