export const ALLOWED_AFFIDAVIT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedAffidavitMime = (typeof ALLOWED_AFFIDAVIT_MIME_TYPES)[number];

export const AFFIDAVIT_MAGIC_SIGNATURES: Record<
  AllowedAffidavitMime,
  { bytes: number[]; offset?: number }[]
> = {
  "image/jpeg": [{ bytes: [0xff, 0xd8, 0xff] }],
  "image/png": [{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  "image/webp": [
    { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
    { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 },
  ],
};

export const AFFIDAVIT_UPLOAD_FIELD = "file";