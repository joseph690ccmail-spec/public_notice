import { createSecureHandler } from "@/lib/api/handler";
import { toAdminSessionResponse } from "@/lib/admin/dto";
import { authenticateAdmin } from "@/lib/admin/service";
import { setAdminSessionCookie } from "@/lib/admin/session";
import { jsonWithSecurityHeaders } from "@/lib/security/headers";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["POST /api/v1/admin/login"];

export const POST = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
    validateBody: profile.bodySchema,
  },
  async ({ body }) => {
    const { admin, token } = await authenticateAdmin(body.email, body.password);
    const response = jsonWithSecurityHeaders({
      data: toAdminSessionResponse(admin),
    });
    setAdminSessionCookie(response, token);
    return response;
  }
);