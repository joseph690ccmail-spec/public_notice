import { toDraftResponse } from "@/lib/drafts/dto";
import { getDraftBinding } from "@/lib/drafts/access";
import {
  verifyAndStoreAffidavitForDraft,
  verifyStoredAffidavitForDraft,
} from "@/lib/drafts/service";
import { createAffidavitVerifyHandler } from "@/lib/api/upload-handler";
import { API_ROUTE_SECURITY } from "@/lib/security/route-config";

export const runtime = "nodejs";

const profile = API_ROUTE_SECURITY["POST /api/v1/drafts/:draftId/affidavit/verify"];

export const POST = createAffidavitVerifyHandler(
  { rateLimit: profile.rateLimit, getDraftBinding },
  async ({ draftId, sanitized, upload, request }) => {
    const { draft } = await verifyAndStoreAffidavitForDraft(
      draftId,
      sanitized.buffer,
      sanitized.mimeType,
      upload.sizeBytes,
      request
    );
    return Response.json({ data: toDraftResponse(draft) });
  },
  async ({ draftId, request }) => {
    const { draft } = await verifyStoredAffidavitForDraft(draftId, request);
    return Response.json({ data: toDraftResponse(draft) });
  }
);