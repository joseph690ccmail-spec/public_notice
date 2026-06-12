import React from "react";
import { ProgressIndicator, ProgressStep } from "@carbon/react";
import { PUBLISH_STEPS } from "@/lib/publish";

export function PublishWizardProgress({ step }: { step: number }) {
  return (
    <>
      <div className="mb-6 hidden md:block">
        <ProgressIndicator currentIndex={step} spaceEqually>
          {PUBLISH_STEPS.map((publishStep) => (
            <ProgressStep key={publishStep.id} label={publishStep.label} />
          ))}
        </ProgressIndicator>
      </div>

      <p className="mb-4 text-xs font-medium uppercase tracking-[0.16px] text-[var(--color-ink-muted)] md:hidden">
        Step {step + 1} of {PUBLISH_STEPS.length} — {PUBLISH_STEPS[step].label}
      </p>
    </>
  );
}