import React from "react";
import { Loading } from "@carbon/react";

export function PublishingScreen() {
  return (
    <div className="flex min-h-[20rem] flex-col items-center justify-center border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-8">
      <Loading withOverlay={false} description="Confirming payment and publishing your notice…" />
      <p className="mt-4 max-w-md text-center text-sm text-[var(--color-ink-muted)]">
        This usually takes a few seconds. Please keep this page open.
      </p>
    </div>
  );
}