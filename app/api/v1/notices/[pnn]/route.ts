import { createSecureHandler } from "@/lib/api/handler";
import { getNoticeByPnn } from "@/lib/notices/ledger";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["GET /api/v1/notices/:pnn"];

export const GET = createSecureHandler(
  {
    methods: profile.methods,
    rateLimit: profile.rateLimit,
  },
  async ({ params }) => {
    const pnn = params?.pnn ?? "";
    const notice = await getNoticeByPnn(pnn);
    return Response.json({ data: notice });
  }
);