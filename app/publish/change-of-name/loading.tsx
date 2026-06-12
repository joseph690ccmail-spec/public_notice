import React from "react";
import { Loading } from "@carbon/react";
import { PublishPageHeader } from "@/components/site/PublishPageHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function PublishWizardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans">
      <PublishPageHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Loading withOverlay={false} description="Loading application…" />
      </main>
      <SiteFooter />
    </div>
  );
}