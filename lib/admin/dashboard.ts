import { cache } from "react";
import type { Admin } from "@prisma/client";
import { requireAdminSession } from "@/lib/admin/guard";
import { prisma } from "@/lib/db";

export interface AdminDashboardStats {
  noticeCount: number;
  recentNotices: number;
  paymentCount: number;
  successfulPayments: number;
}

export interface AdminDashboardData {
  admin: Admin;
  stats: AdminDashboardStats;
}

export const getAdminDashboardData = cache(async (): Promise<AdminDashboardData> => {
  const admin = await requireAdminSession();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [noticeCount, recentNotices, paymentCount, successfulPayments] = await Promise.all([
    prisma.notice.count(),
    prisma.notice.count({ where: { publishedAt: { gte: weekAgo } } }),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: "SUCCESS" } }),
  ]);

  return {
    admin,
    stats: { noticeCount, recentNotices, paymentCount, successfulPayments },
  };
});