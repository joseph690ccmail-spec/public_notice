/** Short typable PNN format, e.g. PNN-78BGH1 (digits + letters). */
export type NoticeReason =
  | "Marriage"
  | "Spelling Correction"
  | "Religious/Cultural"
  | "Family"
  | "Other";

export interface ChangeOfNameNotice {
  id: string;
  pnn: string;
  formerName: string;
  newName: string;
  publishedAt: string;
  address: string;
  state: string;
  lga: string;
  reason: NoticeReason;
  verified: boolean;
}

export function formatNoticeDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(isoDate));
}

/** Plain-text notice body for search indexing. */
export function buildNoticeText(notice: ChangeOfNameNotice): string {
  return `I, formerly known as ${notice.formerName} now wish to be called and addressed as ${notice.newName}. All former documents remain valid. General public should please take note.`;
}

