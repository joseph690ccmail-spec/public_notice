export { formatStoredVerification, verificationToDraftData } from "@/lib/affidavit-verification/db";
export { verifyAffidavitImage } from "@/lib/affidavit-verification/service";
export type {
  AffidavitVerificationResult,
  AffidavitVerificationVerdict,
} from "@/lib/affidavit-verification/types";
export {
  AFFIDAVIT_VERIFICATION_MODEL,
  GROQ_MAX_BASE64_BYTES,
} from "@/lib/affidavit-verification/constants";