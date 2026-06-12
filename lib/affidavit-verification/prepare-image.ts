import sharp from "sharp";
import type { AllowedAffidavitMime } from "@/lib/security/upload/constants";
import {
  GROQ_MAX_MEGAPIXELS,
  GROQ_MAX_RAW_IMAGE_BYTES,
} from "@/lib/affidavit-verification/constants";

export interface PreparedAffidavitImage {
  buffer: Buffer;
  mimeType: AllowedAffidavitMime;
  width: number;
  height: number;
}

function megapixels(width: number, height: number): number {
  return width * height;
}

function maxDimensionForMegapixelCap(width: number, height: number): number {
  const current = megapixels(width, height);
  if (current <= GROQ_MAX_MEGAPIXELS) return Math.max(width, height);
  const scale = Math.sqrt(GROQ_MAX_MEGAPIXELS / current);
  return Math.max(1, Math.floor(Math.max(width, height) * scale));
}

async function encodeForGroq(
  pipeline: sharp.Sharp,
  mimeType: AllowedAffidavitMime,
  quality: number
): Promise<Buffer> {
  switch (mimeType) {
    case "image/jpeg":
      return pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
    case "image/png":
      return pipeline.png({ compressionLevel: 9 }).toBuffer();
    case "image/webp":
      return pipeline.webp({ quality }).toBuffer();
    default:
      throw new Error(`Unsupported mime for Groq preparation: ${mimeType}`);
  }
}

/**
 * Normalizes affidavit images for Groq vision limits (4 MB base64, 33 MP).
 * Prefers JPEG re-encode for photos to reduce payload size.
 */
export async function prepareAffidavitImageForGroq(
  buffer: Buffer,
  mimeType: AllowedAffidavitMime
): Promise<PreparedAffidavitImage> {
  const source = sharp(buffer, { failOn: "error" }).rotate();
  const meta = await source.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (width <= 0 || height <= 0) {
    throw new Error("Could not read affidavit image dimensions.");
  }

  const targetMime: AllowedAffidavitMime =
    mimeType === "image/png" ? "image/png" : "image/jpeg";

  let maxDimension = maxDimensionForMegapixelCap(width, height);
  const qualitySteps = targetMime === "image/png" ? [9] : [85, 75, 65, 55, 45];

  for (let attempt = 0; attempt < 6; attempt++) {
    for (const quality of qualitySteps) {
      const resized = sharp(buffer, { failOn: "error" })
        .rotate()
        .resize({
          width: maxDimension,
          height: maxDimension,
          fit: "inside",
          withoutEnlargement: true,
        });

      const encoded = await encodeForGroq(resized, targetMime, quality);
      if (encoded.byteLength <= GROQ_MAX_RAW_IMAGE_BYTES) {
        const outputMeta = await sharp(encoded).metadata();
        return {
          buffer: encoded,
          mimeType: targetMime,
          width: outputMeta.width ?? width,
          height: outputMeta.height ?? height,
        };
      }
    }

    maxDimension = Math.max(640, Math.floor(maxDimension * 0.85));
  }

  throw new Error("Affidavit image is too large to send for AI verification.");
}

export function toGroqImageDataUrl(
  buffer: Buffer,
  mimeType: AllowedAffidavitMime
): string {
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}