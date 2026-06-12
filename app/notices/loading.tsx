import React from "react";
import { Loading } from "@carbon/react";
import { NoticesPageHeader } from "@/components/site/NoticesPageHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export default function NoticesLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans">
      <NoticesPageHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Loading withOverlay={false} description="Loading notices…" />
      </main>
      <SiteFooter />
    </div>
  );
}