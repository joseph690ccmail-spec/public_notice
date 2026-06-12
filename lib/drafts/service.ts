import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import { bindingFromRequest, requireDraftAccess } from "@/lib/drafts/access";
import { parseNoticeReason } from "@/lib/drafts/reason";
import { sendDraftResumeLink } from "@/lib/email/resume-link";
import { prisma } from "@/lib/db";
import { getSecurityEnv } from "@/lib/security/env";
import type { AllowedAffidavitMime } from "@/lib/security/upload/constants";
import {
  buildAffidavitObjectKey,
  extensionForMime,
  getPrivateBucketName,
  uploadPrivateAffidavit,
} from "@/lib/security/upload/storage";
import type { draftPatchBodySchema } from "@/lib/security/validation";
import type { z } from "zod";

type PatchBody = z.infer<typeof draftPatchBodySchema>;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isR2Configured(): boolean {
  const env = getSecurityEnv();
  return Boolean(
    env.R2_ACCOUNT_ID &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_BUCKET_NAME
  );
}

export async function initDraft(
  email: string,
  request: NextRequest,
  forceNew = false
) {
  const normalizedEmail = normalizeEmail(email);
  const binding = bindingFromRequest(request);

  const existing = await prisma.draft.findFirst({
    where: { email: normalizedEmail, status: "IN_PROGRESS" },
    orderBy: { updatedAt: "desc" },
  });

  if (existing && !forceNew) {
    const draft = await prisma.draft.update({
      where: { id: existing.id },
      data: binding,
    });
    return { draft, resumed: true as const };
  }

  if (existing && forceNew) {
    await prisma.draft.delete({ where: { id: existing.id } });
  }

  const draft = await prisma.draft.create({
    data: {
      email: normalizedEmail,
      ...binding,
    },
  });

  return { draft, resumed: false as const };
}

export async function abandonDraftByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await prisma.draft.findFirst({
    where: { email: normalizedEmail, status: "IN_PROGRESS" },
    orderBy: { updatedAt: "desc" },
  });

  if (!existing) {
    return { deleted: false as const, draftId: null };
  }

  await prisma.draft.delete({ where: { id: existing.id } });
  return { deleted: true as const, draftId: existing.id };
}

export async function patchDraft(draftId: string, body: PatchBody, request: NextRequest) {
  await requireDraftAccess(draftId, request);

  const data: Prisma.DraftUpdateInput = {};

  if (body.oldName !== undefined) data.formerName = body.oldName;
  if (body.newName !== undefined) data.newName = body.newName;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.reasonOther !== undefined) data.reasonOther = body.reasonOther;
  if (body.consentGiven !== undefined) data.consentGiven = body.consentGiven;
  if (body.reason !== undefined) data.reason = parseNoticeReason(body.reason);

  return prisma.draft.update({
    where: { id: draftId },
    data,
  });
}

export async function deleteDraft(draftId: string, request: NextRequest) {
  await requireDraftAccess(draftId, request);
  await prisma.draft.delete({ where: { id: draftId } });
}

export async function saveAffidavitForDraft(
  draftId: string,
  buffer: Buffer,
  mimeType: AllowedAffidavitMime,
  sizeBytes: number
) {
  const objectKey = buildAffidavitObjectKey(draftId, extensionForMime(mimeType));

  if (isR2Configured()) {
    await uploadPrivateAffidavit(
      {
        bucket: getPrivateBucketName(),
        key: objectKey,
        mimeType,
      },
      buffer
    );
  } else if (getSecurityEnv().NODE_ENV === "production") {
    throw new ApiError(
      "INTERNAL_ERROR",
      "Affidavit storage is not configured."
    );
  }

  return prisma.draft.update({
    where: { id: draftId },
    data: {
      affidavitObjectKey: objectKey,
      affidavitMimeType: mimeType,
      affidavitSizeBytes: sizeBytes,
      affidavitUploadedAt: new Date(),
    },
  });
}

export async function sendSaveForLaterLink(draftId: string, request: NextRequest) {
  const { draft } = await requireDraftAccess(draftId, request);
  const result = await sendDraftResumeLink(draft.email, draft.id);
  return result;
}