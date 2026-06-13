import React from "react";
import { Checkbox } from "@carbon/react";
import { ApplicationSummary } from "@/components/publish/wizard/ui/ApplicationSummary";
import { FieldError } from "@/components/publish/wizard/ui/FieldError";
import { PUBLICATION_FEE_NGN, type PublishFormData, type PublishFormErrors } from "@/lib/publish";

interface PayAndPublishStepProps {
  form: PublishFormData;
  errors: PublishFormErrors;
  onFieldChange: <K extends keyof PublishFormData>(key: K, value: PublishFormData[K]) => void;
}

export function PayAndPublishStep({
  form,
  errors,
  onFieldChange,
}: PayAndPublishStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-[var(--color-ink)]">
          Pay and publish
        </h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)] tracking-[0.16px]">
          Complete payment to publish your notice instantly to the public ledger.
        </p>
      </div>

      <ApplicationSummary form={form} showReason={false} />

      <div className="border border-[var(--color-hairline)] bg-[var(--color-surface-1)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
          Standard publication
        </p>
        <p className="mt-1 text-2xl font-light text-[var(--color-ink)]">
          ₦{PUBLICATION_FEE_NGN.toLocaleString("en-NG")}
        </p>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Includes instant digital publication, your permanent PNN, and confirmation via email and
          SMS.
        </p>
      </div>

      <Checkbox
        id="consent"
        labelText="I confirm the information provided is accurate and I consent to the public publication of this notice as described in the Terms of Use."
        checked={form.consentGiven}
        onChange={(_, { checked }) => onFieldChange("consentGiven", checked)}
        invalid={Boolean(errors.consentGiven)}
      />
      <FieldError message={errors.consentGiven} />
    </div>
  );
}