import { createSecureHandler } from "@/lib/api/handler";
import { getAdminPaymentByReference } from "@/lib/admin/payments";
import { requireAdminSession } from "@/lib/admin/service";
import { jsonWithSecurityHeaders } from "@/lib/security/headers";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["GET /api/v1/admin/payments/:reference"];

export const GET = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
  },
  async ({ request, params }) => {
    requireAdminSession(request);

    const reference = params?.reference;
    if (!reference) {
      return jsonWithSecurityHeaders(
        { error: { code: "BAD_REQUEST", message: "Payment reference is required." } },
        { status: 400 }
      );
    }

    const payment = await getAdminPaymentByReference(decodeURIComponent(reference));
    return jsonWithSecurityHeaders({ data: payment });
  }
);