import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin | Public Notice System",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-surface-1)] text-[var(--color-ink)]">
      <header className="border-b border-[var(--color-hairline)] bg-[var(--color-canvas)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="text-sm font-semibold tracking-[0.16px] text-[var(--color-ink)]">
            PNN Admin
          </Link>
          <Link href="/" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-primary)]">
            Back to site
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}