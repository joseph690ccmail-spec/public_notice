import { createSecureHandler } from "@/lib/api/handler";
import { listAdminPayments } from "@/lib/admin/payments";
import { requireAdminSession } from "@/lib/admin/service";
import { jsonWithSecurityHeaders } from "@/lib/security/headers";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";
import { adminPaymentsQuerySchema, parseStrictQuery } from "@/lib/security/validation";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["GET /api/v1/admin/payments"];

export const GET = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
  },
  async ({ request }) => {
    requireAdminSession(request);

    const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = parseStrictQuery(adminPaymentsQuerySchema, queryParams);

    if (!parsed.success) {
      return jsonWithSecurityHeaders(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Invalid query parameters.",
            details: parsed.errors,
          },
        },
        { status: 400 }
      );
    }

    const result = await listAdminPayments(parsed.data);
    return jsonWithSecurityHeaders({ data: result });
  }
);