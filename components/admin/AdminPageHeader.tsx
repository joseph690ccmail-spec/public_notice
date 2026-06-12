import React from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
}

export function AdminPageHeader({
  title,
  description,
  eyebrow = "Administration",
}: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header border-b border-[var(--color-hairline)] bg-[var(--color-page-header-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
          {eyebrow}
        </p>
        <h1
          className="mt-2 text-2xl font-light tracking-[-0.2px] text-[var(--color-ink)] md:text-[2rem] leading-tight"
          style={{ fontFamily: "var(--font-plex-sans), system-ui" }}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm tracking-[0.16px] text-[var(--color-ink-muted)] md:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}