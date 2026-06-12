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

export const recentNotices: ChangeOfNameNotice[] = [
  {
    id: "1",
    pnn: "PNN-78BGH1",
    formerName: "Chidinma Okafor",
    newName: "Chidinma Adeyemi",
    publishedAt: "2026-06-11",
    address: "24 Adeniyi Jones Avenue, Ikeja",
    state: "Lagos",
    lga: "Ikeja",
    reason: "Marriage",
    verified: true,
  },
  {
    id: "2",
    pnn: "PNN-42KLM9",
    formerName: "Emeka Nwosu",
    newName: "Emeka Nwosu-Chukwu",
    publishedAt: "2026-06-10",
    address: "8 Zik Avenue, Awka",
    state: "Anambra",
    lga: "Awka South",
    reason: "Family",
    verified: true,
  },
  {
    id: "3",
    pnn: "PNN-91TXR4",
    formerName: "Grace Etim",
    newName: "Grace Ita",
    publishedAt: "2026-06-09",
    address: "15 Ibrahim Babangida Way, Uyo",
    state: "Akwa Ibom",
    lga: "Uyo",
    reason: "Spelling Correction",
    verified: false,
  },
  {
    id: "4",
    pnn: "PNN-55NWP7",
    formerName: "Fatima Ibrahim",
    newName: "Fatima Ibrahim Musa",
    publishedAt: "2026-06-08",
    address: "3 Bompai Road, Nassarawa",
    state: "Kano",
    lga: "Nassarawa",
    reason: "Religious/Cultural",
    verified: true,
  },
  {
    id: "5",
    pnn: "PNN-63DFJ2",
    formerName: "Oluwaseun Bakare",
    newName: "Oluwaseun Abiodun Bakare",
    publishedAt: "2026-06-07",
    address: "11 Lalubu Street, Oke-Ilewo",
    state: "Ogun",
    lga: "Abeokuta South",
    reason: "Marriage",
    verified: false,
  },
];

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

/** MVP stub — returns sample notice data for any verification request. */
export function getSampleVerifiedNotice(pnn?: string): ChangeOfNameNotice {
  const sample = recentNotices[0];
  const trimmed = pnn?.trim();

  return {
    ...sample,
    pnn: trimmed || sample.pnn,
  };
}