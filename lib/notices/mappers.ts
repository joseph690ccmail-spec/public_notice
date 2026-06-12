import type { ChangeOfNameNotice, NoticeReason } from "@/lib/notices";
import type { PublicNoticeResponse } from "@/lib/notices/dto";

const NOTICE_REASONS = new Set<NoticeReason>([
  "Marriage",
  "Spelling Correction",
  "Religious/Cultural",
  "Family",
  "Other",
]);

function toNoticeReason(value: string | null): NoticeReason {
  if (value && NOTICE_REASONS.has(value as NoticeReason)) {
    return value as NoticeReason;
  }
  return "Other";
}

/** Maps a public API notice into the shape expected by certificate UI. */
export function publicNoticeToCertificateNotice(
  notice: PublicNoticeResponse
): ChangeOfNameNotice {
  return {
    id: notice.pnn,
    pnn: notice.pnn,
    formerName: notice.formerName,
    newName: notice.newName,
    publishedAt: notice.publishedAt,
    address: "",
    state: "",
    lga: "",
    reason: toNoticeReason(notice.reason),
    verified: notice.verified,
  };
}