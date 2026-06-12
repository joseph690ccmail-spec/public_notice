"use client";

import React, { type ReactNode } from "react";

interface AdminUtilityBarProps {
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function AdminUtilityBar({ leading, trailing }: AdminUtilityBarProps) {
  return (
    <div className="admin-utility-bar utility-bar bg-[var(--color-primary-dark)] text-sm text-white/75">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 md:px-6">
        {leading}
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4 text-xs tracking-[0.16px]">
          <span className="truncate text-white/80">FEDERAL REPUBLIC OF NIGERIA</span>
          <span className="hidden text-white/40 md:inline">•</span>
          <span className="hidden text-white/65 md:inline">Public Notice System Admin</span>
        </div>
        {trailing ? <div className="flex shrink-0 items-center">{trailing}</div> : null}
      </div>
    </div>
  );
}