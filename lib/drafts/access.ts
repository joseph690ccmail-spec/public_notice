import type { Draft } from "@prisma/client";
import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/api/errors";
import { prisma } from "@/lib/db";
import {
  createClientBinding,
  isValidDraftId,
  verifyDraftBinding,
  type ClientBinding,
  type DraftBindingCheck,
} from "@/lib/security/draft-session";

export async function getDraftBinding(draftId: string): Promise<ClientBinding | null> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
    select: { ipHash: true, fingerprintHash: true, status: true },
  });

  if (!draft || draft.status !== "IN_PROGRESS" || !draft.ipHash) {
    return null;
  }

  return {
    ipHash: draft.ipHash,
    fingerprintHash: draft.fingerprintHash,
    createdAt: new Date().toISOString(),
  };
}

export async function requireDraftAccess(
  draftId: string | undefined,
  request: NextRequest
): Promise<{ draft: Draft; bindingCheck: DraftBindingCheck }> {
  if (!draftId || !isValidDraftId(draftId)) {
    throw new ApiError("BAD_REQUEST", "Invalid draftId parameter.");
  }

  const draft = await prisma.draft.findUnique({ where: { id: draftId } });
  if (!draft || draft.status !== "IN_PROGRESS") {
    throw new ApiError("NOT_FOUND", "Draft session not found.");
  }

  if (!draft.ipHash) {
    throw new ApiError("FORBIDDEN", "Draft session is missing binding metadata.");
  }

  const bindingCheck = verifyDraftBinding(
    {
      ipHash: draft.ipHash,
      fingerprintHash: draft.fingerprintHash,
      createdAt: draft.createdAt.toISOString(),
    },
    request
  );

  if (!bindingCheck.valid) {
    throw new ApiError("FORBIDDEN", "Draft session binding mismatch.");
  }

  return { draft, bindingCheck };
}

export function bindingFromRequest(request: NextRequest) {
  const binding = createClientBinding(request);
  return {
    ipHash: binding.ipHash,
    fingerprintHash: binding.fingerprintHash,
  };
}