import React from "react";
import { Tile } from "@carbon/react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { getAdminDashboardData } from "@/lib/admin/dashboard";

function formatRole(role: string): string {
  return role === "SUPER_ADMIN" ? "Super Admin" : "Admin";
}

export default async function AdminDashboardPage() {
  const { admin, stats } = await getAdminDashboardData();
  const { noticeCount, recentNotices, paymentCount, successfulPayments } = stats;

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={`Signed in as ${admin.name} (${admin.email}) · ${formatRole(admin.role)}`}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <section className="mb-10">
          <h2
            className="mb-4 text-xl font-light tracking-[-0.2px] text-[var(--color-ink)]"
            style={{ fontFamily: "var(--font-plex-sans), system-ui" }}
          >
            Overview
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Tile className="admin-stat-tile border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
                Total publications
              </p>
              <p className="mt-2 text-3xl font-medium text-[var(--color-ink)]">{noticeCount}</p>
            </Tile>

            <Tile className="admin-stat-tile border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
                Published this week
              </p>
              <p className="mt-2 text-3xl font-medium text-[var(--color-ink)]">{recentNotices}</p>
            </Tile>

            <Tile className="admin-stat-tile border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
                Payment attempts
              </p>
              <p className="mt-2 text-3xl font-medium text-[var(--color-ink)]">{paymentCount}</p>
            </Tile>

            <Tile className="admin-stat-tile border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
                Successful payments
              </p>
              <p className="mt-2 text-3xl font-medium text-[var(--color-ink)]">
                {successfulPayments}
              </p>
            </Tile>
          </div>
        </section>

        <section>
          <h2
            className="mb-4 text-xl font-light tracking-[-0.2px] text-[var(--color-ink)]"
            style={{ fontFamily: "var(--font-plex-sans), system-ui" }}
          >
            Quick actions
          </h2>
          <AdminQuickActions />
        </section>
      </div>
    </>
  );
}