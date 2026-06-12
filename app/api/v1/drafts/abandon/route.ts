import { createSecureHandler } from "@/lib/api/handler";
import { abandonDraftByEmail } from "@/lib/drafts/service";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["POST /api/v1/drafts/abandon"];

export const POST = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
    validateBody: profile.bodySchema,
  },
  async ({ body }) => {
    const result = await abandonDraftByEmail(body.email);
    return Response.json({ data: result });
  }
);