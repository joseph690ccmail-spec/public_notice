import type { ChangeOfNameNotice, NoticeReason } from "@/lib/notices";
import { CHANGE_OF_NAME_FEE_KOBO } from "@/lib/payments/constants";

export const LEGAL_DISCLAIMER =
  "This system provides fast, affordable, and verifiable digital public notice publication through a secure national registry. While publication here is permanent and publicly verifiable, it does not replace the statutory requirements for a valid legal name change, including a sworn affidavit from a court of law.";

export const PUBLISH_STEPS = [
  { id: "email", label: "Get started" },
  { id: "details", label: "Notice details" },
  { id: "document", label: "Affidavit" },
  { id: "preview", label: "Preview" },
  { id: "pay", label: "Pay & publish" },
] as const;

export type PublishStepId = (typeof PUBLISH_STEPS)[number]["id"];

export const NOTICE_REASONS: NoticeReason[] = [
  "Marriage",
  "Spelling Correction",
  "Religious/Cultural",
  "Family",
  "Other",
];

export const AFFIDAVIT_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const AFFIDAVIT_MAX_BYTES = 8 * 1024 * 1024;

export const PUBLICATION_FEE_NGN = CHANGE_OF_NAME_FEE_KOBO / 100;

export interface PublishFormData {
  formerName: string;
  newName: string;
  reason: NoticeReason | "";
  reasonOther: string;
  phone: string;
  email: string;
  consentGiven: boolean;
}

export const initialPublishFormData: PublishFormData = {
  formerName: "",
  newName: "",
  reason: "",
  reasonOther: "",
  phone: "",
  email: "",
  consentGiven: false,
};

export type PublishFormErrors = Partial<Record<keyof PublishFormData | "document", string>>;

export function validatePublishStep(
  step: number,
  data: PublishFormData,
  hasDocument: boolean
): PublishFormErrors {
  const errors: PublishFormErrors = {};

  if (step === 0) {
    if (!data.email.trim()) errors.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = "Enter a valid email address.";
    }
    if (!data.phone.trim()) errors.phone = "Enter a Nigerian phone number.";
  }

  if (step === 1) {
    if (!data.formerName.trim()) errors.formerName = "Enter your former legal name.";
    if (!data.newName.trim()) errors.newName = "Enter your new legal name.";
    if (
      data.formerName.trim() &&
      data.newName.trim() &&
      data.formerName.trim().toLowerCase() === data.newName.trim().toLowerCase()
    ) {
      errors.newName = "New name must be different from your former name.";
    }
    if (!data.reason) errors.reason = "Select a reason for the name change.";
    if (data.reason === "Other" && !data.reasonOther.trim()) {
      errors.reasonOther = "Briefly describe your reason.";
    }
  }

  if (step === 2 && !hasDocument) {
    errors.document = "Upload a clear photo of your court affidavit (JPG, PNG, or WebP, max 8 MB).";
  }

  if (step === 4 && !data.consentGiven) {
    errors.consentGiven = "You must confirm the declaration before paying.";
  }

  return errors;
}

export function formDataToPreviewNotice(data: PublishFormData): ChangeOfNameNotice {
  return {
    id: "draft",
    pnn: "PNN-PENDING",
    formerName: data.formerName.trim(),
    newName: data.newName.trim(),
    publishedAt: new Date().toISOString().slice(0, 10),
    address: "",
    state: "",
    lga: "",
    reason: (data.reason || "Other") as NoticeReason,
    verified: false,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}