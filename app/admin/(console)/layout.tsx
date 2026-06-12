import React from "react";
import { AdminChrome } from "@/components/admin/AdminChrome";

export default function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-console flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <AdminChrome />
      <main className="flex-1">{children}</main>
    </div>
  );
}