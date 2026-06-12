import { createSecureHandler } from "@/lib/api/handler";
import { clearAdminSessionCookie } from "@/lib/admin/session";
import { jsonWithSecurityHeaders } from "@/lib/security/headers";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["POST /api/v1/admin/logout"];

export const POST = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
  },
  async () => {
    const response = jsonWithSecurityHeaders({
      data: { loggedOut: true },
    });
    clearAdminSessionCookie(response);
    return response;
  }
);