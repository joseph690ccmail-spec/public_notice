import React from "react";
import { InlineNotification, TextInput } from "@carbon/react";
import type { PublishFormData, PublishFormErrors } from "@/lib/publish";

interface GetStartedStepProps {
  form: PublishFormData;
  errors: PublishFormErrors;
  hasSavedState: boolean;
  busy: boolean;
  onFieldChange: <K extends keyof PublishFormData>(key: K, value: PublishFormData[K]) => void;
  onStartAfresh: () => void;
}

export function GetStartedStep({
  form,
  errors,
  hasSavedState,
  busy,
  onFieldChange,
  onStartAfresh,
}: GetStartedStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-[var(--color-ink)]">Get started</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)] tracking-[0.16px]">
          Enter your contact details to begin. Your progress saves automatically — no account or
          password required.
        </p>
      </div>

      <TextInput
        id="email"
        type="email"
        labelText="Email address"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => onFieldChange("email", e.target.value)}
        invalid={Boolean(errors.email)}
        invalidText={errors.email}
      />

      {hasSavedState && (
        <p className="-mt-3 text-xs text-[var(--color-ink-muted)]">
          Using a different email?{" "}
          <button
            type="button"
            className="text-[var(--color-primary)] underline-offset-2 hover:underline"
            onClick={onStartAfresh}
            disabled={busy}
          >
            Start afresh
          </button>
        </p>
      )}

      <TextInput
        id="phone"
        labelText="Phone number"
        placeholder="e.g. 08012345678"
        value={form.phone}
        onChange={(e) => onFieldChange("phone", e.target.value)}
        invalid={Boolean(errors.phone)}
        invalidText={errors.phone}
      />

      <InlineNotification
        kind="info"
        lowContrast
        hideCloseButton
        title="Auto-save enabled"
        subtitle="Your progress is saved automatically on this device as you complete each step. No account or password is required."
      />
    </div>
  );
}