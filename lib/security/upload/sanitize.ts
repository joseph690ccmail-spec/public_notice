import sharp from "sharp";
import type { AllowedAffidavitMime } from "@/lib/security/upload/constants";

export interface SanitizedImage {
  buffer: Buffer;
  mimeType: AllowedAffidavitMime;
  width: number;
  height: number;
}

/**
 * Strips EXIF/GPS and re-encodes the image before storage (NDPA / privacy).
 */
export async function stripExifAndSanitize(
  buffer: Buffer,
  mimeType: AllowedAffidavitMime
): Promise<SanitizedImage> {
  const pipeline = sharp(buffer, { failOn: "error" }).rotate();

  let encoded: Buffer;
  switch (mimeType) {
    case "image/jpeg":
      encoded = await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
      break;
    case "image/png":
      encoded = await pipeline.png({ compressionLevel: 9 }).toBuffer();
      break;
    case "image/webp":
      encoded = await pipeline.webp({ quality: 85 }).toBuffer();
      break;
    default:
      throw new Error(`Unsupported mime for sanitization: ${mimeType}`);
  }

  const meta = await sharp(encoded).metadata();
  return {
    buffer: encoded,
    mimeType,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}