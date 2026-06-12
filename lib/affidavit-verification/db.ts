import type { AffidavitVerdict as PrismaAffidavitVerdict } from "@prisma/client";
import type {
  AffidavitVerificationResult,
  AffidavitVerificationVerdict,
} from "@/lib/affidavit-verification/types";

const VERDICT_TO_PRISMA: Record<AffidavitVerificationVerdict, PrismaAffidavitVerdict> = {
  genuine: "GENUINE",
  uncertain: "UNCERTAIN",
  rejected: "REJECTED",
};

const VERDICT_FROM_PRISMA: Record<PrismaAffidavitVerdict, AffidavitVerificationVerdict> = {
  GENUINE: "genuine",
  UNCERTAIN: "uncertain",
  REJECTED: "rejected",
};

export function verificationToDraftData(verification: AffidavitVerificationResult) {
  return {
    affidavitConfidence: verification.confidence,
    affidavitVerdict: VERDICT_TO_PRISMA[verification.verdict],
    affidavitIssues: verification.issues,
    affidavitVerifiedAt: new Date(),
  };
}

export function formatStoredVerification(draft: {
  affidavitConfidence: number | null;
  affidavitVerdict: PrismaAffidavitVerdict | null;
  affidavitIssues: string[];
}): AffidavitVerificationResult | null {
  if (draft.affidavitConfidence == null || draft.affidavitVerdict == null) {
    return null;
  }

  return {
    confidence: draft.affidavitConfidence,
    verdict: VERDICT_FROM_PRISMA[draft.affidavitVerdict],
    issues: draft.affidavitIssues,
  };
}