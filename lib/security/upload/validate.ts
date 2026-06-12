import { getSecurityEnv } from "@/lib/security/env";
import {
  AFFIDAVIT_UPLOAD_FIELD,
  ALLOWED_AFFIDAVIT_MIME_TYPES,
  type AllowedAffidavitMime,
} from "@/lib/security/upload/constants";
import { detectImageMime } from "@/lib/security/upload/magic-bytes";

export interface ValidatedUpload {
  fieldName: string;
  fileName: string;
  mimeType: AllowedAffidavitMime;
  sizeBytes: number;
  buffer: Buffer;
}

export type UploadValidationErrorCode =
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "BAD_REQUEST";

export class UploadValidationError extends Error {
  readonly code: UploadValidationErrorCode;

  constructor(code: UploadValidationErrorCode, message: string) {
    super(message);
    this.name = "UploadValidationError";
    this.code = code;
  }
}

export async function validateAffidavitUpload(
  formData: FormData
): Promise<ValidatedUpload> {
  const maxBytes = getSecurityEnv().UPLOAD_MAX_BYTES;
  const file = formData.get(AFFIDAVIT_UPLOAD_FIELD);

  if (!(file instanceof File)) {
    throw new UploadValidationError("BAD_REQUEST", `Missing "${AFFIDAVIT_UPLOAD_FIELD}" file field`);
  }

  if (file.size <= 0) {
    throw new UploadValidationError("BAD_REQUEST", "Uploaded file is empty");
  }

  if (file.size > maxBytes) {
    throw new UploadValidationError(
      "PAYLOAD_TOO_LARGE",
      `File exceeds maximum size of ${maxBytes} bytes`
    );
  }

  const declaredMime = file.type.trim().toLowerCase();
  if (!ALLOWED_AFFIDAVIT_MIME_TYPES.includes(declaredMime as AllowedAffidavitMime)) {
    throw new UploadValidationError(
      "UNSUPPORTED_MEDIA_TYPE",
      `Unsupported file type: ${declaredMime || "unknown"}`
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const detectedMime = detectImageMime(buffer);

  if (!detectedMime || detectedMime !== declaredMime) {
    throw new UploadValidationError(
      "UNSUPPORTED_MEDIA_TYPE",
      "File content does not match a permitted image signature"
    );
  }

  return {
    fieldName: AFFIDAVIT_UPLOAD_FIELD,
    fileName: file.name,
    mimeType: detectedMime,
    sizeBytes: file.size,
    buffer,
  };
}