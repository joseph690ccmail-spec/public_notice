import {
  assertChargeSuccess,
  createPaystackWebhookHandler,
} from "@/lib/api/webhook-handler";
import { publishNoticeFromPayment } from "@/lib/notices/publish";

export const runtime = "nodejs";

export const POST = createPaystackWebhookHandler(async ({ event }) => {
  assertChargeSuccess(event);

  if (event.data.status !== "success") {
    return Response.json({ received: true, ignored: true });
  }

  const result = await publishNoticeFromPayment(event.data.reference, event.data);

  return Response.json({
    received: true,
    data: {
      pnn: result.pnn,
      noticeId: result.noticeId,
      draftId: result.draftId,
      reference: result.reference,
      alreadyPublished: result.alreadyPublished,
    },
  });
});