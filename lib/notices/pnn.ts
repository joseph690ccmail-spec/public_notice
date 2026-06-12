import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api/errors";

const MAX_ATTEMPTS = 12;

/** Format: PNN-XXXXXX (6 uppercase hex chars, matches pnnParamSchema). */
function buildPnnCandidate(): string {
  return `PNN-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function generateUniquePnn(): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const pnn = buildPnnCandidate();

    const existing = await prisma.notice.findUnique({
      where: { pnn },
      select: { id: true },
    });
    if (!existing) return pnn;
  }

  throw new ApiError("INTERNAL_ERROR", "Unable to generate a unique PNN.");
}