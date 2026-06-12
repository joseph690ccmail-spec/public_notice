import { createDraftBoundHandler } from "@/lib/drafts/handler";
import { sendSaveForLaterLink } from "@/lib/drafts/service";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["POST /api/v1/drafts/:draftId/save-link"];

export const POST = createDraftBoundHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
  },
  async ({ request, draft }) => {
    const result = await sendSaveForLaterLink(draft.id, request);
    return Response.json({
      data: {
        sent: result.sent,
        draftId: draft.id,
        resumeUrl: result.resumeUrl,
      },
    });
  }
);