import { createSecureHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { resolveAdminSession } from "@/lib/admin/service";
import { jsonWithSecurityHeaders } from "@/lib/security/headers";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["GET /api/v1/admin/session"];

export const GET = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
  },
  async ({ request }) => {
    const admin = await resolveAdminSession(request);
    if (!admin) {
      throw new ApiError("UNAUTHORIZED", "Not signed in.");
    }

    return jsonWithSecurityHeaders({ data: admin });
  }
);