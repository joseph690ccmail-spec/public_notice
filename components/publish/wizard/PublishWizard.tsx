"use client";

import React from "react";
import { InlineNotification, Loading } from "@carbon/react";
import { ResumeDraftModal } from "@/components/publish/wizard/modals/ResumeDraftModal";
import { PublishWizardStepContent } from "@/components/publish/wizard/PublishWizardStepContent";
import { PublishedSuccessScreen } from "@/components/publish/wizard/screens/PublishedSuccessScreen";
import { PublishingScreen } from "@/components/publish/wizard/screens/PublishingScreen";
import { PublishWizardFooter } from "@/components/publish/wizard/ui/PublishWizardFooter";
import { PublishWizardProgress } from "@/components/publish/wizard/ui/PublishWizardProgress";
import { PublishWizardSidebar } from "@/components/publish/wizard/ui/PublishWizardSidebar";
import { usePublishWizard } from "@/components/publish/wizard/usePublishWizard";

export function PublishWizard() {
  const wizard = usePublishWizard();

  if (wizard.publishing) {
    return <PublishingScreen />;
  }

  if (wizard.publishedNotice) {
    return (
      <PublishedSuccessScreen notice={wizard.publishedNotice} email={wizard.form.email} />
    );
  }

  return (
    <>
      <ResumeDraftModal
        open={wizard.resumeModalOpen}
        email={wizard.form.email}
        onClose={() => wizard.setResumeModalOpen(false)}
        onResume={() => wizard.handleResumeChoice(false)}
        onStartFresh={() => wizard.handleResumeChoice(true)}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="min-w-0">
          <PublishWizardProgress step={wizard.step} />

          {wizard.apiError && (
            <InlineNotification
              className="mb-4 max-w-full"
              kind="error"
              lowContrast
              hideCloseButton
              title="Something went wrong"
              subtitle={wizard.apiError}
            />
          )}

          <div className="relative border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5 md:p-8">
            {wizard.busy && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[var(--color-canvas)]/90 p-6">
                <Loading withOverlay={false} description="Loading your application…" />
                <p className="text-sm text-[var(--color-ink-muted)]">Please wait a moment.</p>
              </div>
            )}

            <PublishWizardStepContent wizard={wizard} />

            <PublishWizardFooter
              step={wizard.step}
              busy={wizard.busy}
              uploadingAffidavit={wizard.uploadingAffidavit}
              onBack={wizard.goBack}
              onNext={wizard.goNext}
              onPay={wizard.handlePay}
            />
          </div>
        </div>

        <div className="hidden min-w-0 lg:block">
          <PublishWizardSidebar
            step={wizard.step}
            form={wizard.form}
            documentFile={wizard.documentFile}
            previewUrl={wizard.previewUrl}
            uploadingAffidavit={wizard.uploadingAffidavit}
            hasAffidavit={wizard.hasAffidavit}
            onRemoveDocument={wizard.clearDocument}
            onReplaceDocument={wizard.replaceDocument}
          />
        </div>
      </div>
    </>
  );
}