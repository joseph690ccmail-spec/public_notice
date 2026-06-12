import { verifyAffidavitImage } from "@/lib/affidavit-verification";
import { createSecureHandler } from "@/lib/api/handler";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";
import { validateAffidavitUpload } from "@/lib/security/upload/validate";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["POST /api/v1/affidavit/verify"];

export const POST = createSecureHandler(
  { methods: profile.methods, rateLimit: profile.rateLimit },
  async ({ request }) => {
    const formData = await request.formData();
    const upload = await validateAffidavitUpload(formData);
    const result = await verifyAffidavitImage(upload.buffer, upload.mimeType);
    return Response.json({ data: result });
  }
);