import { z } from "zod";

export const affidavitVerificationModelSchema = z.object({
  confidence: z.number().min(0).max(1),
  verdict: z.enum(["genuine", "uncertain", "rejected"]),
  issues: z.array(z.string()),
});

export type AffidavitVerificationModelResult = z.infer<
  typeof affidavitVerificationModelSchema
>;

/** JSON Schema sent to Groq structured output (best-effort mode). */
export const AFFIDAVIT_VERIFICATION_JSON_SCHEMA = {
  type: "object",
  properties: {
    confidence: { type: "number", minimum: 0, maximum: 1 },
    verdict: { type: "string", enum: ["genuine", "uncertain", "rejected"] },
    issues: { type: "array", items: { type: "string" } },
  },
  required: ["confidence", "verdict", "issues"],
  additionalProperties: false,
} as const;