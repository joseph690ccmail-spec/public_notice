import { z, type ZodType } from "zod";

/**
 * Strict request-body validation — Zod `.strict()` mirrors NestJS
 * `whitelist: true` + `forbidNonWhitelisted: true`.
 */
export function parseStrictBody<T extends ZodType>(
  schema: T,
  body: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "body";
    return `${path}: ${issue.message}`;
  });

  return { success: false, errors };
}

export function parseStrictQuery<T extends ZodType>(
  schema: T,
  params: Record<string, string | string[] | undefined>
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const normalized: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    normalized[key] = Array.isArray(value) ? value[0] : value;
  }
  return parseStrictBody(schema, normalized);
}

/** Shared param schemas for upcoming API routes. */
export const draftIdParamSchema = z
  .string()
  .uuid({ message: "draftId must be a valid UUID v4" });

export const pnnParamSchema = z
  .string()
  .trim()
  .regex(/^PNN-[A-Z0-9]{6}$/, "pnn must match PNN-XXXXXX format");

export const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .strict();

export const draftInitBodySchema = z
  .object({
    email: z.string().trim().email().max(254),
    /** Discard any in-progress draft for this email and start fresh. */
    forceNew: z.boolean().optional().default(false),
  })
  .strict();

export const draftAbandonBodySchema = z
  .object({
    email: z.string().trim().email().max(254),
  })
  .strict();

export const draftPatchBodySchema = z
  .object({
    oldName: z.string().trim().min(2).max(200).optional(),
    newName: z.string().trim().min(2).max(200).optional(),
    reason: z.string().trim().min(2).max(80).optional(),
    reasonOther: z.string().trim().min(2).max(200).optional(),
    phone: z.string().trim().min(7).max(20).optional(),
    consentGiven: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const paymentInitializeBodySchema = z
  .object({
    draftId: z.string().uuid(),
  })
  .strict();

export const noticeSearchBodySchema = z
  .object({
    query: z.string().trim().min(2).max(120),
  })
  .strict();