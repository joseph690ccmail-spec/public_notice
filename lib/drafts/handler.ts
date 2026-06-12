import type { NextRequest } from "next/server";
import type { Draft } from "@prisma/client";
import type { ZodType } from "zod";
import { createSecureHandler, type SecureHandlerOptions } from "@/lib/api/handler";
import { requireDraftAccess } from "@/lib/drafts/access";

type BoundContext<TBody> = {
  request: NextRequest;
  body: TBody;
  params?: Record<string, string>;
  draft: Draft;
};

export function createDraftBoundHandler<TBodySchema extends ZodType | undefined = undefined>(
  options: SecureHandlerOptions<TBodySchema>,
  handler: (ctx: BoundContext<
    TBodySchema extends ZodType ? import("zod").infer<TBodySchema> : undefined
  >) => Promise<Response> | Response
) {
  return createSecureHandler(options, async (ctx) => {
    const draftId = ctx.params?.draftId;
    const { draft } = await requireDraftAccess(draftId, ctx.request);
    return handler({ ...ctx, draft });
  });
}