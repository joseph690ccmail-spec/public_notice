"use client";

import React, { Suspense } from "react";
import { Loading } from "@carbon/react";
import { PublishPageHeader } from "@/components/site/PublishPageHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { PublishWizard } from "@/components/publish/PublishWizard";

function WizardFallback() {
  return (
    <div className="flex min-h-[24rem] items-center justify-center border border-[var(--color-hairline)] bg-[var(--color-canvas)]">
      <Loading withOverlay={false} description="Loading application…" />
    </div>
  );
}

export default function ChangeOfNamePublishPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans">
      <PublishPageHeader
        description="Swear your affidavit at court, then complete the steps below to publish your Change of Name notice digitally."
      />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 py-8 text-left md:px-6 md:py-12">
          <Suspense fallback={<WizardFallback />}>
            <PublishWizard />
          </Suspense>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}