export type AffidavitVerificationVerdict = "genuine" | "uncertain" | "rejected";

export interface AffidavitVerificationResult {
  confidence: number;
  verdict: AffidavitVerificationVerdict;
  issues: string[];
}