import { createDraftBoundHandler } from "@/lib/drafts/handler";
import { toDraftResponse } from "@/lib/drafts/dto";
import { deleteDraft, patchDraft } from "@/lib/drafts/service";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const getProfile = API_ROUTE_SECURITY["GET /api/v1/drafts/:draftId"];
const patchProfile = API_ROUTE_SECURITY["PATCH /api/v1/drafts/:draftId"];
const deleteProfile = API_ROUTE_SECURITY["DELETE /api/v1/drafts/:draftId"];

export const GET = createDraftBoundHandler(
  {
    methods: getProfile.methods,
    rateLimit: getProfile.rateLimit,
  },
  async ({ draft }) => {
    return Response.json({ data: toDraftResponse(draft) });
  }
);

export const PATCH = createDraftBoundHandler(
  {
    methods: patchProfile.methods,
    rateLimit: patchProfile.rateLimit,
    validateBody: patchProfile.bodySchema,
  },
  async ({ request, body, params, draft }) => {
    const updated = await patchDraft(draft.id, body, request);
    return Response.json({ data: toDraftResponse(updated) });
  }
);

export const DELETE = createDraftBoundHandler(
  {
    methods: deleteProfile.methods,
    rateLimit: deleteProfile.rateLimit,
  },
  async ({ request, draft }) => {
    await deleteDraft(draft.id, request);
    return Response.json({ data: { deleted: true, draftId: draft.id } });
  }
);