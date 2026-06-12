import type { AllowedAffidavitMime } from "@/lib/security/upload/constants";
import { ApiError } from "@/lib/api/errors";
import { requestAffidavitVerificationFromGroq } from "@/lib/affidavit-verification/groq-client";
import {
  getAffidavitVerificationSystemPrompt,
  getAffidavitVerificationUserPrompt,
} from "@/lib/affidavit-verification/prompt";
import {
  prepareAffidavitImageForGroq,
  toGroqImageDataUrl,
} from "@/lib/affidavit-verification/prepare-image";
import {
  affidavitVerificationModelSchema,
  type AffidavitVerificationModelResult,
} from "@/lib/affidavit-verification/schema";
import type { AffidavitVerificationResult } from "@/lib/affidavit-verification/types";

function toApiResult(
  modelResult: AffidavitVerificationModelResult
): AffidavitVerificationResult {
  return {
    confidence: modelResult.confidence,
    verdict: modelResult.verdict,
    issues: modelResult.issues,
  };
}

function parseModelResponse(raw: string): AffidavitVerificationModelResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new ApiError("INTERNAL_ERROR", "Groq returned invalid JSON for affidavit verification.");
  }

  const parsed = affidavitVerificationModelSchema.safeParse(json);
  if (!parsed.success) {
    throw new ApiError(
      "INTERNAL_ERROR",
      "Groq verification response did not match the expected schema.",
      { details: parsed.error.issues.map((issue) => issue.message) }
    );
  }

  return parsed.data;
}

/**
 * Runs AI verification on a court affidavit image buffer.
 * Keeps GROQ_AI_KEY server-side — call from API routes or server actions only.
 */
export async function verifyAffidavitImage(
  buffer: Buffer,
  mimeType: AllowedAffidavitMime
): Promise<AffidavitVerificationResult> {
  const prepared = await prepareAffidavitImageForGroq(buffer, mimeType);
  const imageUrl = toGroqImageDataUrl(prepared.buffer, prepared.mimeType);

  const raw = await requestAffidavitVerificationFromGroq([
    {
      role: "system",
      content: getAffidavitVerificationSystemPrompt(),
    },
    {
      role: "user",
      content: [
        { type: "text", text: getAffidavitVerificationUserPrompt() },
        { type: "image_url", image_url: { url: imageUrl } },
      ],
    },
  ]);

  return toApiResult(parseModelResponse(raw));
}