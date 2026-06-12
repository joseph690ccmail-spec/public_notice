import React from "react";
import { InlineNotification } from "@carbon/react";
import { ApplicationSummary } from "@/components/publish/wizard/ui/ApplicationSummary";
import type { PublishFormData } from "@/lib/publish";

interface PreviewStepProps {
  form: PublishFormData;
}

export function PreviewStep({ form }: PreviewStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-[var(--color-ink)]">
          Preview your notice
        </h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)] tracking-[0.16px]">
          Review your details below. Your PNN will be assigned after payment.
        </p>
      </div>

      <InlineNotification
        kind="info"
        lowContrast
        hideCloseButton
        title="Review your application"
        subtitle="Check spelling carefully. Published notices cannot be edited."
      />

      <div className="lg:hidden">
        <ApplicationSummary form={form} />
      </div>
    </div>
  );
}