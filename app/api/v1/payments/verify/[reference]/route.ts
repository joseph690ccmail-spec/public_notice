import { ApiError } from "@/lib/api/errors";
import { createSecureHandler } from "@/lib/api/handler";
import { verifyPayment } from "@/lib/payments/service";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["GET /api/v1/payments/verify/:reference"];

export const GET = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
  },
  async ({ params }) => {
    const reference = params?.reference?.trim();
    if (!reference) {
      throw new ApiError("BAD_REQUEST", "Missing payment reference.");
    }

    const result = await verifyPayment(reference);
    return Response.json({ data: result });
  }
);