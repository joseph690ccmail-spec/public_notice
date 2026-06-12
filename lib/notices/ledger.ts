import { ApiError } from "@/lib/api/errors";
import { toPublicNotice, toPublicNotices, type PublicNoticeResponse } from "@/lib/notices/dto";
import { prisma } from "@/lib/db";
import { pnnParamSchema } from "@/lib/security/validation";

export interface NoticeListResult {
  items: PublicNoticeResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NoticeSearchResult {
  query: string;
  items: PublicNoticeResponse[];
}

function normalizePnn(pnn: string): string {
  return pnn.trim().toUpperCase();
}

export async function getNoticeByPnn(pnn: string): Promise<PublicNoticeResponse> {
  const normalized = normalizePnn(pnn);
  const parsed = pnnParamSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new ApiError("BAD_REQUEST", "Invalid PNN format.");
  }

  const notice = await prisma.notice.findUnique({
    where: { pnn: parsed.data },
  });

  if (!notice) {
    throw new ApiError("NOT_FOUND", "Notice not found.");
  }

  return toPublicNotice(notice);
}

export async function listRecentNotices(
  page: number,
  limit: number
): Promise<NoticeListResult> {
  const skip = (page - 1) * limit;

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notice.count(),
  ]);

  return {
    items: toPublicNotices(notices),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function searchNoticesByName(query: string): Promise<NoticeSearchResult> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    throw new ApiError("BAD_REQUEST", "Search query must be at least 2 characters.");
  }

  const normalizedPnn = trimmed.toUpperCase();
  const exactPnn = pnnParamSchema.safeParse(normalizedPnn);
  if (exactPnn.success) {
    const notice = await prisma.notice.findUnique({
      where: { pnn: exactPnn.data },
    });

    return {
      query: trimmed,
      items: notice ? [toPublicNotice(notice)] : [],
    };
  }

  const notices = await prisma.notice.findMany({
    where: {
      OR: [
        { formerName: { contains: trimmed, mode: "insensitive" } },
        { newName: { contains: trimmed, mode: "insensitive" } },
        { pnn: { contains: normalizedPnn, mode: "insensitive" } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return {
    query: trimmed,
    items: toPublicNotices(notices),
  };
}