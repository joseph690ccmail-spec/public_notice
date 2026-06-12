import React from "react";
import { ArrowLeft, ArrowRight } from "@carbon/icons-react";
import { Button } from "@carbon/react";
import { ButtonLabel } from "@/components/publish/wizard/ui/ButtonLabel";
import { PUBLICATION_FEE_NGN, PUBLISH_STEPS } from "@/lib/publish";

interface PublishWizardFooterProps {
  step: number;
  busy: boolean;
  uploadingAffidavit: boolean;
  onBack: () => void;
  onNext: () => void;
  onPay: () => void;
}

export function PublishWizardFooter({
  step,
  busy,
  uploadingAffidavit,
  onBack,
  onNext,
  onPay,
}: PublishWizardFooterProps) {
  const isLoading = busy || uploadingAffidavit;

  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[var(--color-hairline)] pt-6 sm:flex-row sm:items-center sm:justify-between">
      <Button
        kind="secondary"
        className="publish-wizard__back-btn"
        renderIcon={ArrowLeft}
        disabled={step === 0 || isLoading}
        onClick={onBack}
      >
        Back
      </Button>

      {step < PUBLISH_STEPS.length - 1 ? (
        <Button
          kind="primary"
          renderIcon={isLoading ? undefined : ArrowRight}
          disabled={isLoading}
          onClick={onNext}
        >
          <ButtonLabel loading={isLoading}>Continue</ButtonLabel>
        </Button>
      ) : (
        <Button kind="primary" disabled={busy} onClick={onPay}>
          <ButtonLabel loading={busy}>
            Pay ₦{PUBLICATION_FEE_NGN.toLocaleString("en-NG")}
          </ButtonLabel>
        </Button>
      )}
    </div>
  );
}