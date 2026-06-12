import React from "react";
import { AffidavitPreview } from "@/components/publish/AffidavitPreview";
import { ApplicationSummary } from "@/components/publish/wizard/ui/ApplicationSummary";
import { WhatYouWillNeed } from "@/components/publish/wizard/ui/WhatYouWillNeed";
import type { PublishFormData } from "@/lib/publish";

interface PublishWizardSidebarProps {
  step: number;
  form: PublishFormData;
  documentFile: File | null;
  previewUrl: string | null;
  uploadingAffidavit: boolean;
  hasAffidavit: boolean;
  onRemoveDocument: () => void;
  onReplaceDocument: () => void;
}

export function PublishWizardSidebar({
  step,
  form,
  documentFile,
  previewUrl,
  uploadingAffidavit,
  hasAffidavit,
  onRemoveDocument,
  onReplaceDocument,
}: PublishWizardSidebarProps) {
  if (step === 2 && documentFile && previewUrl) {
    return (
      <AffidavitPreview
        file={documentFile}
        previewUrl={previewUrl}
        uploading={uploadingAffidavit}
        uploaded={hasAffidavit}
        onRemove={onRemoveDocument}
        onReplace={onReplaceDocument}
      />
    );
  }

  if (step === 3) {
    return (
      <div className="sticky top-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
          Application summary
        </p>
        <ApplicationSummary form={form} />
      </div>
    );
  }

  return <WhatYouWillNeed />;
}