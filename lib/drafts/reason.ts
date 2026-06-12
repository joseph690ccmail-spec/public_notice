import type { NoticeReason as PrismaNoticeReason } from "@prisma/client";
import type { NoticeReason } from "@/lib/notices";
import { ApiError } from "@/lib/api/errors";

const TO_PRISMA: Record<NoticeReason, PrismaNoticeReason> = {
  Marriage: "MARRIAGE",
  "Spelling Correction": "SPELLING_CORRECTION",
  "Religious/Cultural": "RELIGIOUS_CULTURAL",
  Family: "FAMILY",
  Other: "OTHER",
};

const FROM_PRISMA: Record<PrismaNoticeReason, NoticeReason> = {
  MARRIAGE: "Marriage",
  SPELLING_CORRECTION: "Spelling Correction",
  RELIGIOUS_CULTURAL: "Religious/Cultural",
  FAMILY: "Family",
  OTHER: "Other",
};

export function parseNoticeReason(value: string): PrismaNoticeReason {
  const trimmed = value.trim();
  const fromLabel = TO_PRISMA[trimmed as NoticeReason];
  if (fromLabel) return fromLabel;

  const upper = trimmed.toUpperCase().replace(/[\s/]+/g, "_") as PrismaNoticeReason;
  if (upper in FROM_PRISMA) return upper;

  throw new ApiError("BAD_REQUEST", `Invalid reason: ${value}`);
}

export function formatNoticeReason(value: PrismaNoticeReason | null): NoticeReason | null {
  if (!value) return null;
  return FROM_PRISMA[value];
}