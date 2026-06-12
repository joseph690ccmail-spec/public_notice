import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSecurityEnv, requireEnv } from "@/lib/security/env";
import type { AllowedAffidavitMime } from "@/lib/security/upload/constants";

export interface PrivateUploadTarget {
  bucket: string;
  key: string;
  mimeType: AllowedAffidavitMime;
}

function getR2Client(): S3Client {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
  const endpoint =
    getSecurityEnv().R2_ENDPOINT ?? `https://${accountId}.r2.cloudflarestorage.com`;

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function buildAffidavitObjectKey(draftId: string, extension: string): string {
  const safeExt = extension.replace(/^\./, "").toLowerCase();
  return `affidavits/${draftId}/${Date.now()}.${safeExt}`;
}

export function extensionForMime(mime: AllowedAffidavitMime): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
  }
}

/**
 * Backend-mediated upload — preferred when the route receives multipart directly.
 * Bucket must remain private; only backend/admin fetches objects.
 */
export async function uploadPrivateAffidavit(
  target: PrivateUploadTarget,
  body: Buffer
): Promise<void> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: target.bucket,
      Key: target.key,
      Body: body,
      ContentType: target.mimeType,
      ACL: undefined,
    })
  );
}

/**
 * Pre-signed PUT URL for direct browser → R2 upload (still private bucket).
 * Route must validate draft + magic bytes on completion callback or via backend proxy.
 */
export async function createAffidavitPresignedPutUrl(
  target: PrivateUploadTarget,
  expiresInSeconds = 300
): Promise<string> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: target.bucket,
    Key: target.key,
    ContentType: target.mimeType,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export function getPrivateBucketName(): string {
  return requireEnv("R2_BUCKET_NAME");
}