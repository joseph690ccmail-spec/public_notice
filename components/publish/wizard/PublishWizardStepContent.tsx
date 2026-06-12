import React from "react";
import { AffidavitStep } from "@/components/publish/wizard/steps/AffidavitStep";
import { GetStartedStep } from "@/components/publish/wizard/steps/GetStartedStep";
import { NoticeDetailsStep } from "@/components/publish/wizard/steps/NoticeDetailsStep";
import { PayAndPublishStep } from "@/components/publish/wizard/steps/PayAndPublishStep";
import { PreviewStep } from "@/components/publish/wizard/steps/PreviewStep";
import type { usePublishWizard } from "@/components/publish/wizard/usePublishWizard";

type WizardState = ReturnType<typeof usePublishWizard>;

interface PublishWizardStepContentProps {
  wizard: WizardState;
}

export function PublishWizardStepContent({ wizard }: PublishWizardStepContentProps) {
  const { step } = wizard;

  switch (step) {
    case 0:
      return (
        <GetStartedStep
          form={wizard.form}
          errors={wizard.errors}
          hasSavedState={wizard.hasSavedState}
          busy={wizard.busy}
          onFieldChange={wizard.updateField}
          onStartAfresh={wizard.handleStartAfresh}
        />
      );
    case 1:
      return (
        <NoticeDetailsStep
          form={wizard.form}
          errors={wizard.errors}
          onFieldChange={wizard.updateField}
        />
      );
    case 2:
      return (
        <AffidavitStep
          fileInputRef={wizard.fileInputRef}
          documentFile={wizard.documentFile}
          previewUrl={wizard.previewUrl}
          uploadingAffidavit={wizard.uploadingAffidavit}
          hasAffidavit={wizard.hasAffidavit}
          documentError={wizard.errors.document}
          onFileAdd={wizard.handleFileAdd}
          onRemoveDocument={wizard.clearDocument}
          onReplaceDocument={wizard.replaceDocument}
        />
      );
    case 3:
      return <PreviewStep form={wizard.form} />;
    case 4:
      return (
        <PayAndPublishStep
          form={wizard.form}
          errors={wizard.errors}
          draftId={wizard.draftId}
          saveLinkSent={wizard.saveLinkSent}
          saveLinkBusy={wizard.saveLinkBusy}
          onFieldChange={wizard.updateField}
          onSaveForLater={wizard.handleSaveForLater}
        />
      );
    default:
      return null;
  }
}