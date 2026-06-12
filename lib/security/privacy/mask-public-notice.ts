import { PUBLIC_LEDGER_REDACTED_FIELDS } from "@/lib/security/constants";

type RedactableKey = (typeof PUBLIC_LEDGER_REDACTED_FIELDS)[number];

const REDACTED_SET = new Set<string>(PUBLIC_LEDGER_REDACTED_FIELDS);

export type PublicNoticeRecord = Record<string, unknown>;

/** Fields safe to return from public ledger routes (GET /notices, search, :pnn). */
export const PUBLIC_NOTICE_FIELDS = [
  "pnn",
  "formerName",
  "newName",
  "reason",
  "reasonOther",
  "publishedAt",
  "verified",
] as const;

export type PublicNoticeField = (typeof PUBLIC_NOTICE_FIELDS)[number];

export type PublicNoticeDto = Pick<
  Record<PublicNoticeField, unknown>,
  PublicNoticeField
>;

/**
 * Removes PII and internal fields before any public ledger response (NDPA).
 * The full Notice row may include email, phone, affidavit R2 fields, etc.
 */
export function maskPublicNotice<T extends PublicNoticeRecord>(record: T): Partial<T> {
  const masked: PublicNoticeRecord = {};

  for (const [key, value] of Object.entries(record)) {
    if (REDACTED_SET.has(key as RedactableKey)) continue;
    masked[key] = value;
  }

  return masked as Partial<T>;
}

export function maskPublicNotices<T extends PublicNoticeRecord>(
  records: T[]
): Partial<T>[] {
  return records.map((record) => maskPublicNotice(record));
}

export function pickPublicNoticeFields<T extends PublicNoticeRecord>(
  record: T
): Pick<T, Extract<keyof T, PublicNoticeField>> {
  const picked = {} as Pick<T, Extract<keyof T, PublicNoticeField>>;
  for (const field of PUBLIC_NOTICE_FIELDS) {
    if (field in record) {
      (picked as PublicNoticeRecord)[field] = record[field];
    }
  }
  return picked;
}

/** Authorized/admin views — full Notice record, no masking applied. */
export function toAuthorizedNotice<T extends PublicNoticeRecord>(record: T): T {
  return record;
}