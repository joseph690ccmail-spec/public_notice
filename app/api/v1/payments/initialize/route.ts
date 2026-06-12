import { createSecureHandler } from "@/lib/api/handler";
import { initializePayment } from "@/lib/payments/service";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["POST /api/v1/payments/initialize"];

export const POST = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
    validateBody: profile.bodySchema,
  },
  async ({ request, body }) => {
    const result = await initializePayment(body.draftId, request);
    return Response.json({ data: result });
  }
);