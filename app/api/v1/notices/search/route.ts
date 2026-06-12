import { createSecureHandler } from "@/lib/api/handler";
import { searchNoticesByName } from "@/lib/notices/ledger";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["POST /api/v1/notices/search"];

export const POST = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
    validateBody: profile.bodySchema,
  },
  async ({ body }) => {
    const result = await searchNoticesByName(body.query);
    return Response.json({ data: result });
  }
);