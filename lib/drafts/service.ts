import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/api/errors";
import { verifyAffidavitImage } from "@/lib/affidavit-verification";
import { AFFIDAVIT_MIN_CONFIDENCE } from "@/lib/affidavit-verification/constants";
import { verificationToDraftData } from "@/lib/affidavit-verification/db";
import { AFFIDAVIT_LOW_CONFIDENCE_MESSAGE } from "@/lib/affidavit-verification/user-messages";
import type { AffidavitVerificationResult } from "@/lib/affidavit-verification/types";
import { bindingFromRequest, requireDraftAccess } from "@/lib/drafts/access";
import { parseNoticeReason } from "@/lib/drafts/reason";
import { sendDraftResumeLink } from "@/lib/email/resume-link";
import { prisma } from "@/lib/db";
import { getSecurityEnv } from "@/lib/security/env";
import type { AllowedAffidavitMime } from "@/lib/security/upload/constants";
import {
  buildAffidavitObjectKey,
  downloadPrivateAffidavit,
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

function assertVerificationAllowsProgress(verification: AffidavitVerificationResult): void {
  if (verification.confidence >= AFFIDAVIT_MIN_CONFIDENCE) return;

  throw new ApiError("BAD_REQUEST", AFFIDAVIT_LOW_CONFIDENCE_MESSAGE);
}

async function saveVerificationAttempt(
  draftId: string,
  verification: AffidavitVerificationResult
) {
  return prisma.draft.update({
    where: { id: draftId },
    data: verificationToDraftData(verification),
  });
}

async function uploadVerifiedAffidavitToR2(
  draftId: string,
  buffer: Buffer,
  mimeType: AllowedAffidavitMime,
  sizeBytes: number,
  verification: AffidavitVerificationResult
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
    throw new ApiError("INTERNAL_ERROR", "Affidavit storage is not configured.");
  }

  return prisma.draft.update({
    where: { id: draftId },
    data: {
      affidavitObjectKey: objectKey,
      affidavitMimeType: mimeType,
      affidavitSizeBytes: sizeBytes,
      affidavitUploadedAt: new Date(),
      ...verificationToDraftData(verification),
    },
  });
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

/**
 * Verifies an affidavit image with AI, then uploads to R2 only when confidence is high enough.
 */
export async function verifyAndStoreAffidavitForDraft(
  draftId: string,
  buffer: Buffer,
  mimeType: AllowedAffidavitMime,
  sizeBytes: number,
  request: NextRequest
) {
  await requireDraftAccess(draftId, request);

  const verification = await verifyAffidavitImage(buffer, mimeType);
  await saveVerificationAttempt(draftId, verification);
  assertVerificationAllowsProgress(verification);

  const draft = await uploadVerifiedAffidavitToR2(
    draftId,
    buffer,
    mimeType,
    sizeBytes,
    verification
  );

  return { draft, verification };
}

export async function verifyStoredAffidavitForDraft(draftId: string, request: NextRequest) {
  const { draft } = await requireDraftAccess(draftId, request);

  if (!draft.affidavitObjectKey || !draft.affidavitMimeType) {
    throw new ApiError(
      "BAD_REQUEST",
      "Upload a clear photo of your court affidavit before continuing."
    );
  }

  if (!isR2Configured()) {
    throw new ApiError(
      "BAD_REQUEST",
      "Upload your affidavit image again so we can verify it."
    );
  }

  const buffer = await downloadPrivateAffidavit(
    getPrivateBucketName(),
    draft.affidavitObjectKey
  );

  const verification = await verifyAffidavitImage(
    buffer,
    draft.affidavitMimeType as AllowedAffidavitMime
  );

  const updated = await saveVerificationAttempt(draftId, verification);
  assertVerificationAllowsProgress(verification);

  return { draft: updated, verification };
}

export async function sendSaveForLaterLink(draftId: string, request: NextRequest) {
  const { draft } = await requireDraftAccess(draftId, request);
  const result = await sendDraftResumeLink(draft.email, draft.id);
  return result;
}