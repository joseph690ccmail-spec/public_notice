import { getSecurityEnv } from "@/lib/security/env";
import { ApiError } from "@/lib/api/errors";
import {
  AFFIDAVIT_VERIFICATION_MODEL,
  GROQ_CHAT_COMPLETIONS_URL,
} from "@/lib/affidavit-verification/constants";
import { AFFIDAVIT_VERIFICATION_JSON_SCHEMA } from "@/lib/affidavit-verification/schema";

type GroqMessageContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

export interface GroqChatMessage {
  role: "system" | "user" | "assistant";
  content: GroqMessageContent;
}

interface GroqChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
}

function requireGroqApiKey(): string {
  const key = getSecurityEnv().GROQ_AI_KEY;
  if (!key) {
    throw new ApiError(
      "INTERNAL_ERROR",
      "Affidavit verification is not configured (missing GROQ_AI_KEY)."
    );
  }
  return key;
}

export async function requestAffidavitVerificationFromGroq(
  messages: GroqChatMessage[]
): Promise<string> {
  const apiKey = requireGroqApiKey();

  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AFFIDAVIT_VERIFICATION_MODEL,
      messages,
      temperature: 0.1,
      max_completion_tokens: 1024,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "affidavit_verification",
          strict: false,
          schema: AFFIDAVIT_VERIFICATION_JSON_SCHEMA,
        },
      },
    }),
  });

  let payload: GroqChatCompletionResponse;
  try {
    payload = (await response.json()) as GroqChatCompletionResponse;
  } catch {
    throw new ApiError("INTERNAL_ERROR", "Invalid response from Groq API.");
  }

  if (!response.ok) {
    const message = payload.error?.message ?? "Groq API request failed.";
    throw new ApiError("INTERNAL_ERROR", message);
  }

  const content = payload.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new ApiError("INTERNAL_ERROR", "Groq returned an empty verification response.");
  }

  return content;
}