import React from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Tile } from "@carbon/react";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";
import { verifyAdminSessionToken } from "@/lib/admin/session";
import { prisma } from "@/lib/db";

function formatRole(role: string): string {
  return role === "SUPER_ADMIN" ? "Super Admin" : "Admin";
}

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const session = verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) redirect("/admin/login");

  const [admin, noticeCount, recentNotices] = await Promise.all([
    prisma.admin.findUnique({ where: { id: session.adminId } }),
    prisma.notice.count(),
    prisma.notice.count({
      where: {
        publishedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  if (!admin?.isActive) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 border-b border-[var(--color-hairline)] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
            Signed in as
          </p>
          <h1 className="mt-1 text-2xl font-medium tracking-tight text-[var(--color-ink)]">
            {admin.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {admin.email} · {formatRole(admin.role)}
          </p>
        </div>
        <AdminSignOutButton />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Tile className="border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
            Total publications
          </p>
          <p className="mt-2 text-3xl font-medium text-[var(--color-ink)]">{noticeCount}</p>
        </Tile>

        <Tile className="border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
            Published this week
          </p>
          <p className="mt-2 text-3xl font-medium text-[var(--color-ink)]">{recentNotices}</p>
        </Tile>
      </div>

      <div className="mt-8 border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5">
        <h2 className="text-lg font-medium text-[var(--color-ink)]">Quick links</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Browse the public ledger while admin tooling is expanded.
        </p>
        <Link
          href="/notices"
          className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          View recent publications
        </Link>
      </div>
    </div>
  );
}