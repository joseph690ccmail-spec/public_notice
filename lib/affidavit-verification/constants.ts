/** Groq vision model for Nigerian Change of Name affidavit verification. */
export const AFFIDAVIT_VERIFICATION_MODEL =
  "meta-llama/llama-4-scout-17b-16e-instruct" as const;

export const GROQ_CHAT_COMPLETIONS_URL =
  "https://api.groq.com/openai/v1/chat/completions";

/** Groq base64 image payload limit (bytes). */
export const GROQ_MAX_BASE64_BYTES = 4 * 1024 * 1024;

/** Target encoded size before base64 inflation (~33%). */
export const GROQ_MAX_RAW_IMAGE_BYTES = Math.floor(GROQ_MAX_BASE64_BYTES * 0.72);

/** Groq max image resolution (33 megapixels). */
export const GROQ_MAX_MEGAPIXELS = 33_177_600;

export const VERIFICATION_PROMPT_FILENAME = "VERFICATION_PROMPT.md";

export const VERIFICATION_PROMPT_RELATIVE_PATH = `lib/affidavit-verification/${VERIFICATION_PROMPT_FILENAME}`;

/** Minimum AI confidence required before an affidavit is stored in R2. */
export const AFFIDAVIT_MIN_CONFIDENCE = 0.5;