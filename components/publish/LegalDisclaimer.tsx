import React from "react";
import { LEGAL_DISCLAIMER } from "@/lib/publish";

export function LegalDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`text-xs leading-relaxed text-[var(--color-ink-muted)] tracking-[0.16px] ${className}`}
    >
      {LEGAL_DISCLAIMER}
    </p>
  );
}