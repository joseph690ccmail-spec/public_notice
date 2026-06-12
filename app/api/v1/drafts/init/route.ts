import { createSecureHandler } from "@/lib/api/handler";
import { toDraftResponse } from "@/lib/drafts/dto";
import { initDraft } from "@/lib/drafts/service";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["POST /api/v1/drafts/init"];

export const POST = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
    validateBody: profile.bodySchema,
  },
  async ({ request, body }) => {
    const { draft, resumed } = await initDraft(body.email, request, body.forceNew);
    return Response.json({ data: toDraftResponse(draft, { resumed }) });
  }
);