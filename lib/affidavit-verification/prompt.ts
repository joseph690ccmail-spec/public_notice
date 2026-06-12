import { readFileSync } from "fs";
import { join } from "path";
import { AFFIDAVIT_VERIFICATION_JSON_SCHEMA } from "@/lib/affidavit-verification/schema";
import { VERIFICATION_PROMPT_RELATIVE_PATH } from "@/lib/affidavit-verification/constants";

let cachedSystemPrompt: string | null = null;

function loadVerificationPrompt(): string {
  const path = join(process.cwd(), VERIFICATION_PROMPT_RELATIVE_PATH);
  return readFileSync(path, "utf-8").trim();
}

export function getAffidavitVerificationSystemPrompt(): string {
  if (cachedSystemPrompt) return cachedSystemPrompt;

  const basePrompt = loadVerificationPrompt();
  const schemaBlock = JSON.stringify(AFFIDAVIT_VERIFICATION_JSON_SCHEMA, null, 2);

  cachedSystemPrompt = `${basePrompt}

Respond with a single JSON object matching this schema exactly:
${schemaBlock}

Field guidance:
- confidence: decimal from 0.00 to 1.00 per the scoring rules above.
- verdict: "genuine" if confidence >= 0.90, "uncertain" if 0.50-0.89, "rejected" if < 0.50.
- issues: list specific problems found; use an empty array if none.`;

  return cachedSystemPrompt;
}

export function getAffidavitVerificationUserPrompt(): string {
  return "Analyze the attached affidavit image and return your verification result as JSON.";
}