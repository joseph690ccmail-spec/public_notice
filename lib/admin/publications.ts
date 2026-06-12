import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import {
  toAdminNoticeDetail,
  toAdminNoticeSummary,
  type AdminNoticeDetail,
  type AdminNoticeListResult,
} from "@/lib/admin/notices-dto";
import { prisma } from "@/lib/db";
import { pnnParamSchema } from "@/lib/security/validation";

export interface AdminPublicationsQuery {
  page: number;
  limit: number;
  search?: string;
  verified: "all" | "yes" | "no";
}

function buildPublicationsWhere(query: AdminPublicationsQuery): Prisma.NoticeWhereInput {
  const where: Prisma.NoticeWhereInput = {};

  if (query.verified === "yes") {
    where.verified = true;
  } else if (query.verified === "no") {
    where.verified = false;
  }

  const search = query.search?.trim();
  if (search) {
    const normalizedPnn = search.toUpperCase();
    where.OR = [
      { pnn: { contains: normalizedPnn, mode: "insensitive" } },
      { formerName: { contains: search, mode: "insensitive" } },
      { newName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
}

export async function listAdminPublications(
  query: AdminPublicationsQuery
): Promise<AdminNoticeListResult> {
  const skip = (query.page - 1) * query.limit;
  const where = buildPublicationsWhere(query);

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: query.limit,
    }),
    prisma.notice.count({ where }),
  ]);

  return {
    items: notices.map(toAdminNoticeSummary),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
}

export async function getAdminPublicationByPnn(pnn: string): Promise<AdminNoticeDetail> {
  const normalized = pnn.trim().toUpperCase();
  const parsed = pnnParamSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new ApiError("BAD_REQUEST", "Invalid PNN format.");
  }

  const notice = await prisma.notice.findUnique({
    where: { pnn: parsed.data },
    include: {
      draft: true,
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!notice) {
    throw new ApiError("NOT_FOUND", "Publication not found.");
  }

  const { draft, transactions, ...record } = notice;
  return toAdminNoticeDetail(record, draft, transactions);
}