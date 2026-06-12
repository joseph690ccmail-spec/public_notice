"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavLinks = [
  { href: "/admin", label: "Home", match: (path: string) => path === "/admin" },
  {
    href: "/admin/publications",
    label: "Publications",
    match: (path: string) => path.startsWith("/admin/publications"),
  },
  {
    href: "/admin/payments",
    label: "Payments",
    match: (path: string) => path.startsWith("/admin/payments"),
  },
] as const;

export function AdminNavBar() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav-bar border-b border-[var(--color-hairline)] bg-[var(--color-canvas)]" aria-label="Admin">
      <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 md:gap-2 md:px-6">
        {adminNavLinks.map((link) => {
          const isActive = link.match(pathname);

          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className={[
                "admin-nav-bar__link px-3 py-3 text-sm tracking-[0.16px] transition-colors md:px-4",
                isActive
                  ? "admin-nav-bar__link--active text-[var(--color-primary)]"
                  : "text-[var(--color-ink-muted)] hover:text-[var(--color-primary)]",
              ].join(" ")}
              aria-current={isActive ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}