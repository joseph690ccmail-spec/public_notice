import type { Notice } from "@prisma/client";
import { formatNoticeReason } from "@/lib/drafts/reason";
import { pickPublicNoticeFields } from "@/lib/security/privacy/mask-public-notice";

export interface PublicNoticeResponse {
  pnn: string;
  formerName: string;
  newName: string;
  reason: string | null;
  reasonOther: string | null;
  publishedAt: string;
  verified: boolean;
}

export function toPublicNotice(notice: Notice): PublicNoticeResponse {
  const record = {
    pnn: notice.pnn,
    formerName: notice.formerName,
    newName: notice.newName,
    reason: formatNoticeReason(notice.reason),
    reasonOther: notice.reasonOther,
    publishedAt: notice.publishedAt.toISOString(),
    verified: notice.verified,
  };

  return pickPublicNoticeFields(record) as PublicNoticeResponse;
}

export function toPublicNotices(notices: Notice[]): PublicNoticeResponse[] {
  return notices.map((notice) => toPublicNotice(notice));
}