import {
  AFFIDAVIT_MAGIC_SIGNATURES,
  ALLOWED_AFFIDAVIT_MIME_TYPES,
  type AllowedAffidavitMime,
} from "@/lib/security/upload/constants";

function matchesSignature(
  buffer: Buffer,
  signature: { bytes: number[]; offset?: number }
): boolean {
  const offset = signature.offset ?? 0;
  if (buffer.length < offset + signature.bytes.length) return false;
  return signature.bytes.every((byte, index) => buffer[offset + index] === byte);
}

export function detectImageMime(buffer: Buffer): AllowedAffidavitMime | null {
  for (const mime of ALLOWED_AFFIDAVIT_MIME_TYPES) {
    const signatures = AFFIDAVIT_MAGIC_SIGNATURES[mime];
    const allMatch = signatures.every((sig) => matchesSignature(buffer, sig));
    if (allMatch) return mime;
  }
  return null;
}

export function assertMagicBytesMatchDeclaredMime(
  buffer: Buffer,
  declaredMime: string
): buffer is Buffer {
  const detected = detectImageMime(buffer);
  return detected !== null && detected === declaredMime;
}