import { toDraftResponse } from "@/lib/drafts/dto";
import { getDraftBinding } from "@/lib/drafts/access";
import { saveAffidavitForDraft } from "@/lib/drafts/service";
import { createAffidavitUploadHandler } from "@/lib/api/upload-handler";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["POST /api/v1/drafts/:draftId/affidavit"];

export const POST = createAffidavitUploadHandler(
  { rateLimit: profile.rateLimit, getDraftBinding },
  async ({ draftId, sanitized, upload }) => {
    const draft = await saveAffidavitForDraft(
      draftId,
      sanitized.buffer,
      sanitized.mimeType,
      upload.sizeBytes
    );
    return Response.json({ data: toDraftResponse(draft) });
  }
);