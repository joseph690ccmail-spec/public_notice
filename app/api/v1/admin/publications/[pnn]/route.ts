import { createSecureHandler } from "@/lib/api/handler";
import { getAdminPublicationByPnn } from "@/lib/admin/publications";
import { requireAdminSession } from "@/lib/admin/service";
import { jsonWithSecurityHeaders } from "@/lib/security/headers";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["GET /api/v1/admin/publications/:pnn"];

export const GET = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
  },
  async ({ request, params }) => {
    requireAdminSession(request);

    const pnn = params?.pnn;
    if (!pnn) {
      return jsonWithSecurityHeaders(
        { error: { code: "BAD_REQUEST", message: "PNN is required." } },
        { status: 400 }
      );
    }

    const notice = await getAdminPublicationByPnn(decodeURIComponent(pnn));
    return jsonWithSecurityHeaders({ data: notice });
  }
);