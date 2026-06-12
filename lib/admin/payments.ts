import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import {
  toAdminPaymentDetail,
  toAdminPaymentSummary,
  type AdminPaymentDetail,
  type AdminPaymentListResult,
  type AdminPaymentsStats,
} from "@/lib/admin/payments-dto";
import { prisma } from "@/lib/db";

export interface AdminPaymentsQuery {
  page: number;
  limit: number;
  search?: string;
  status: "all" | "PENDING" | "SUCCESS" | "FAILED";
}

function buildPaymentsWhere(query: AdminPaymentsQuery): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = {};

  if (query.status !== "all") {
    where.status = query.status;
  }

  const search = query.search?.trim();
  if (search) {
    where.OR = [
      { reference: { contains: search, mode: "insensitive" } },
      { draft: { email: { contains: search, mode: "insensitive" } } },
      { notice: { pnn: { contains: search.toUpperCase(), mode: "insensitive" } } },
    ];
  }

  return where;
}

export async function listAdminPayments(query: AdminPaymentsQuery): Promise<AdminPaymentListResult> {
  const skip = (query.page - 1) * query.limit;
  const where = buildPaymentsWhere(query);

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: query.limit,
      include: {
        draft: true,
        notice: true,
      },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    items: transactions.map(toAdminPaymentSummary),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getAdminPaymentsStats(): Promise<AdminPaymentsStats> {
  const [received, totalAttempts, pendingCount, failedCount] = await Promise.all([
    prisma.transaction.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amountKobo: true },
      _count: true,
    }),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { status: "PENDING" } }),
    prisma.transaction.count({ where: { status: "FAILED" } }),
  ]);

  return {
    currency: "NGN",
    receivedKobo: received._sum.amountKobo ?? 0,
    successfulCount: received._count,
    totalAttempts,
    pendingCount,
    failedCount,
  };
}

export async function getAdminPaymentByReference(reference: string): Promise<AdminPaymentDetail> {
  const normalized = reference.trim();
  if (!normalized) {
    throw new ApiError("BAD_REQUEST", "Payment reference is required.");
  }

  const transaction = await prisma.transaction.findUnique({
    where: { reference: normalized },
    include: {
      draft: true,
      notice: true,
    },
  });

  if (!transaction) {
    throw new ApiError("NOT_FOUND", "Payment not found.");
  }

  return toAdminPaymentDetail(transaction);
}