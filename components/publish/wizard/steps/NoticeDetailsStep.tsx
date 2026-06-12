import React from "react";
import { Dropdown, TextInput } from "@carbon/react";
import { NOTICE_REASONS, type PublishFormData, type PublishFormErrors } from "@/lib/publish";

interface NoticeDetailsStepProps {
  form: PublishFormData;
  errors: PublishFormErrors;
  onFieldChange: <K extends keyof PublishFormData>(key: K, value: PublishFormData[K]) => void;
}

export function NoticeDetailsStep({ form, errors, onFieldChange }: NoticeDetailsStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-[var(--color-ink)]">
          Notice details
        </h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)] tracking-[0.16px]">
          Enter the legal names and reason exactly as they should appear on the public notice.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <TextInput
          id="former-name"
          labelText="Former full legal name"
          placeholder="e.g. Chidinma Okafor"
          value={form.formerName}
          onChange={(e) => onFieldChange("formerName", e.target.value)}
          invalid={Boolean(errors.formerName)}
          invalidText={errors.formerName}
        />
        <TextInput
          id="new-name"
          labelText="New full legal name"
          placeholder="e.g. Chidinma Adeyemi"
          value={form.newName}
          onChange={(e) => onFieldChange("newName", e.target.value)}
          invalid={Boolean(errors.newName)}
          invalidText={errors.newName}
        />
      </div>

      <Dropdown
        id="reason"
        titleText="Reason for name change"
        label="Select reason"
        items={NOTICE_REASONS as unknown as string[]}
        selectedItem={form.reason || null}
        onChange={({ selectedItem }) =>
          onFieldChange("reason", (selectedItem as PublishFormData["reason"]) || "")
        }
        invalid={Boolean(errors.reason)}
        invalidText={errors.reason}
      />

      {form.reason === "Other" && (
        <TextInput
          id="reason-other"
          labelText="Describe your reason"
          value={form.reasonOther}
          onChange={(e) => onFieldChange("reasonOther", e.target.value)}
          invalid={Boolean(errors.reasonOther)}
          invalidText={errors.reasonOther}
        />
      )}
    </div>
  );
}