import { createSecureHandler } from "@/lib/api/handler";
import { listRecentNotices } from "@/lib/notices/ledger";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";
import { parseStrictQuery, paginationQuerySchema } from "@/lib/security/validation";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["GET /api/v1/notices"];

export const GET = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
  },
  async ({ request }) => {
    const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = parseStrictQuery(paginationQuerySchema, queryParams);

    if (!parsed.success) {
      return Response.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Invalid pagination parameters.",
            details: parsed.errors,
          },
        },
        { status: 400 }
      );
    }

    const result = await listRecentNotices(parsed.data.page, parsed.data.limit);
    return Response.json({ data: result });
  }
);