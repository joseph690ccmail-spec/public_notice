import type { NextRequest } from "next/server";
import { createSecureHandler } from "@/lib/api/handler";
import type { RateLimitTier } from "@/lib/security/constants";
import {
  isValidDraftId,
  verifyDraftBinding,
  type ClientBinding,
} from "@/lib/security/draft-session";
import { ApiError } from "@/lib/api/errors";
import {
  validateAffidavitUpload,
  type ValidatedUpload,
} from "@/lib/security/upload/validate";
import { stripExifAndSanitize, type SanitizedImage } from "@/lib/security/upload/sanitize";

export interface AffidavitUploadContext {
  request: NextRequest;
  draftId: string;
  upload: ValidatedUpload;
  sanitized: SanitizedImage;
  bindingCheck: ReturnType<typeof verifyDraftBinding>;
  params?: Record<string, string>;
}

export interface AffidavitUploadHandlerOptions {
  rateLimit?: RateLimitTier;
  getDraftBinding: (draftId: string) => Promise<ClientBinding | null>;
}

/**
 * Multipart handler for POST /api/v1/drafts/:draftId/affidavit.
 * Validates draft ID, session binding, file magic bytes, and strips EXIF before handler runs.
 */
export function createAffidavitUploadHandler(
  options: AffidavitUploadHandlerOptions,
  handler: (ctx: AffidavitUploadContext) => Promise<Response> | Response
) {
  return createSecureHandler(
    { methods: ["POST"], rateLimit: options.rateLimit ?? "drafts" },
    async ({ request, params }) => {
      const draftId = params?.draftId;
      if (!draftId || !isValidDraftId(draftId)) {
        throw new ApiError("BAD_REQUEST", "Invalid draftId parameter.");
      }

      const storedBinding = await options.getDraftBinding(draftId);
      if (!storedBinding) {
        throw new ApiError("NOT_FOUND", "Draft session not found.");
      }

      const bindingCheck = verifyDraftBinding(storedBinding, request);
      if (!bindingCheck.valid) {
        throw new ApiError("FORBIDDEN", "Draft session binding mismatch.");
      }

      const formData = await request.formData();
      const upload = await validateAffidavitUpload(formData);
      const sanitized = await stripExifAndSanitize(upload.buffer, upload.mimeType);

      return handler({
        request,
        draftId,
        upload,
        sanitized,
        bindingCheck,
        params,
      });
    }
  );
}