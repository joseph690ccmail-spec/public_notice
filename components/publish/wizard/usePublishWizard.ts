"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  abandonDraftByEmail,
  discardDraft,
  getDraft,
  initDraft,
  initializePayment,
  patchDraft,
  pollForPublishedNotice,
  isUnavailableDraftSessionError,
  PublishApiError,
  verifyAffidavitDraft,
  verifyPayment,
} from "@/lib/api/client";
import {
  AFFIDAVIT_VERIFY_FAILED_MESSAGE,
  AFFIDAVIT_VERIFYING_DESCRIPTION,
} from "@/lib/affidavit-verification/user-messages";
import {
  clearDraftSession,
  loadDraftSession,
  saveDraftSession,
} from "@/lib/api/fingerprint";
import type { DraftResponse } from "@/lib/drafts/dto";
import type { PublicNoticeResponse } from "@/lib/notices/dto";
import {
  draftToForm,
  formToPatchPayload,
  inferStepFromDraft,
} from "@/components/publish/wizard/draft-mappers";
import {
  AFFIDAVIT_ACCEPTED_TYPES,
  AFFIDAVIT_MAX_BYTES,
  initialPublishFormData,
  validatePublishStep,
  type PublishFormData,
  type PublishFormErrors,
} from "@/lib/publish";

interface ResumeDraftOptions {
  inferStep?: boolean;
  paymentReturn?: boolean;
  storedStep?: number;
}

export function usePublishWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionBootstrapped = useRef(false);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PublishFormData>(initialPublishFormData);
  const [errors, setErrors] = useState<PublishFormErrors>({});
  const [draftId, setDraftId] = useState<string | null>(null);
  const [hasAffidavit, setHasAffidavit] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [uploadingAffidavit, setUploadingAffidavit] = useState(false);
  const [verifyingAffidavit, setVerifyingAffidavit] = useState(false);
  const [affidavitVerificationFailed, setAffidavitVerificationFailed] = useState(false);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [pendingResumeDraft, setPendingResumeDraft] = useState<DraftResponse | null>(null);
  const [publishedNotice, setPublishedNotice] = useState<PublicNoticeResponse | null>(null);
  const [publishedEmail, setPublishedEmail] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [hasStoredSession, setHasStoredSession] = useState(false);

  const hasSavedState = Boolean(draftId || hasStoredSession);

  const resetToFreshSession = useCallback((email?: string) => {
    clearDraftSession();
    setDraftId(null);
    setHasAffidavit(false);
    setDocumentFile(null);
    setAffidavitVerificationFailed(false);
    setStep(0);
    setApiError(null);
    setHasStoredSession(Boolean(email));
    if (email) {
      setForm((prev) => ({ ...prev, email }));
    }
  }, []);

  const applyDraft = useCallback((draft: DraftResponse, resume?: ResumeDraftOptions) => {
    setDraftId(draft.draftId);
    setForm(draftToForm(draft));
    setHasAffidavit(draft.hasAffidavit);
    setHasStoredSession(true);

    if (resume?.inferStep) {
      const nextStep = inferStepFromDraft(draft, {
        paymentReturn: resume.paymentReturn,
        storedStep: resume.storedStep,
      });
      setStep(nextStep);
      saveDraftSession({ draftId: draft.draftId, email: draft.email, step: nextStep });
      return;
    }

    saveDraftSession({ draftId: draft.draftId, email: draft.email });
  }, []);

  const updateField = useCallback(
    <K extends keyof PublishFormData>(key: K, value: PublishFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setApiError(null);
    },
    []
  );

  const validateCurrentStep = useCallback(() => {
    const stepErrors = validatePublishStep(
      step,
      form,
      Boolean(documentFile) || hasAffidavit
    );
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [documentFile, form, hasAffidavit, step]);

  const syncDraftFields = useCallback(async (id: string, data: PublishFormData) => {
    const payload = formToPatchPayload(data);
    if (Object.keys(payload).length === 0) return;
    const updated = await patchDraft(id, payload);
    setHasAffidavit(updated.hasAffidavit);
  }, []);

  useEffect(() => {
    if (!draftId || step === 0) return;
    const timer = window.setTimeout(() => {
      syncDraftFields(draftId, form).catch(() => {
        /* silent background save */
      });
    }, 600);
    return () => window.clearTimeout(timer);
  }, [draftId, form, step, syncDraftFields]);

  const completePublishedPayment = useCallback((verification: Awaited<ReturnType<typeof verifyPayment>>) => {
    if (!verification.notice) return false;

    setPublishedNotice(verification.notice);
    if (verification.email) {
      setPublishedEmail(verification.email);
      setForm((prev) => ({ ...prev, email: verification.email! }));
    }
    clearDraftSession();
    return true;
  }, []);

  const processPaymentReturn = useCallback(
    async (reference: string, draftIdToRestore?: string) => {
      setPublishing(true);
      setApiError(null);

      try {
        const verification = await verifyPayment(reference);

        if (!verification.paid) {
          setApiError("Payment was not completed. You can try again below.");
          setStep(4);
          return;
        }

        if (completePublishedPayment(verification)) {
          return;
        }

        const fallbackName =
          verification.notice?.newName ??
          (draftIdToRestore
            ? (await getDraft(draftIdToRestore).catch(() => null))?.newName
            : null) ??
          form.newName;

        const notice = fallbackName ? await pollForPublishedNotice(fallbackName) : null;
        if (notice) {
          setPublishedNotice(notice);
          if (verification.email) {
            setPublishedEmail(verification.email);
            setForm((prev) => ({ ...prev, email: verification.email! }));
          }
          clearDraftSession();
          return;
        }

        setApiError(
          "Payment received. Your notice is being published — check your email shortly for your PNN."
        );
        setStep(4);
      } catch (error) {
        const message =
          error instanceof PublishApiError
            ? error.code === "NOT_FOUND"
              ? "We could not find this payment reference. If you completed payment, check your email for your PNN."
              : error.message
            : "Could not verify payment. Please try again.";
        setApiError(message);
        setStep(4);
      } finally {
        setPublishing(false);
      }
    },
    [completePublishedPayment, form.newName]
  );

  useEffect(() => {
    if (!draftId) return;
    saveDraftSession({ draftId, email: form.email, step });
  }, [draftId, form.email, step]);

  useEffect(() => {
    if (sessionBootstrapped.current) return;
    sessionBootstrapped.current = true;

    const draftIdFromUrl = searchParams.get("draft")?.trim();
    const stored = loadDraftSession();
    const draftIdToRestore = draftIdFromUrl || stored?.draftId;
    const isPaymentReturn = searchParams.get("payment") === "return";
    const shouldCleanUrl = Boolean(
      draftIdFromUrl ||
        isPaymentReturn ||
        searchParams.get("reference") ||
        searchParams.get("trxref")
    );

    if (!draftIdToRestore) {
      if (!isPaymentReturn) {
        setPublishedNotice(null);
        setPublishedEmail(null);
        setStep(0);
      }
      if (stored?.email) {
        setHasStoredSession(true);
        setForm((prev) => (prev.email ? prev : { ...prev, email: stored.email }));
      }
      return;
    }

    (async () => {
      setBusy(true);
      const paymentReference =
        searchParams.get("reference")?.trim() ||
        searchParams.get("trxref")?.trim() ||
        "";

      try {
        if (isPaymentReturn && paymentReference) {
          await processPaymentReturn(paymentReference, draftIdToRestore);
          return;
        }

        const draft = await getDraft(draftIdToRestore);
        applyDraft(draft, {
          inferStep: true,
          paymentReturn: isPaymentReturn,
          storedStep: stored?.step,
        });
      } catch (error) {
        if (isUnavailableDraftSessionError(error)) {
          resetToFreshSession(stored?.email);
          return;
        }

        if (stored?.email) {
          setForm((prev) => ({ ...prev, email: stored.email }));
          setHasStoredSession(true);
        }

        if (isPaymentReturn && paymentReference) {
          await processPaymentReturn(paymentReference, draftIdToRestore);
          return;
        }

        if (isPaymentReturn) {
          setStep(4);
          setApiError("Payment was not completed. You can try again below.");
          return;
        }

        setApiError(
          error instanceof PublishApiError
            ? error.message
            : "Could not restore your application. Please use your resume link or start again."
        );
      } finally {
        setBusy(false);
        if (shouldCleanUrl) {
          router.replace("/publish/change-of-name", { scroll: false });
        }
      }
    })();
  }, [applyDraft, processPaymentReturn, resetToFreshSession, router, searchParams]);

  useEffect(() => {
    if (!documentFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(documentFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [documentFile]);

  const handleFileAdd = useCallback((_: unknown, { addedFiles }: { addedFiles: File[] }) => {
    const file = addedFiles[0];
    if (!file) return;

    if (!AFFIDAVIT_ACCEPTED_TYPES.includes(file.type as (typeof AFFIDAVIT_ACCEPTED_TYPES)[number])) {
      setErrors((prev) => ({
        ...prev,
        document: "Upload a JPG, PNG, or WebP image of your affidavit.",
      }));
      return;
    }

    if (file.size > AFFIDAVIT_MAX_BYTES) {
      setErrors((prev) => ({
        ...prev,
        document: "File must be 8 MB or smaller.",
      }));
      return;
    }

    setDocumentFile(file);
    setHasAffidavit(false);
    setAffidavitVerificationFailed(false);
    setApiError(null);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.document;
      return next;
    });
  }, []);

  const discardServerDrafts = useCallback(
    async (email: string, extraDraftIds: string[] = []) => {
      const draftIds = new Set(
        [draftId, pendingResumeDraft?.draftId, ...extraDraftIds].filter(Boolean) as string[]
      );

      for (const id of draftIds) {
        await discardDraft(id).catch(() => {
          /* draft may already be gone or binding may differ */
        });
      }

      const normalizedEmail = email.trim();
      if (normalizedEmail) {
        await abandonDraftByEmail(normalizedEmail);
      }
    },
    [draftId, pendingResumeDraft?.draftId]
  );

  const resetWizardLocally = useCallback(() => {
    clearDraftSession();
    setStep(0);
    setForm(initialPublishFormData);
    setErrors({});
    setDraftId(null);
    setHasAffidavit(false);
    setDocumentFile(null);
    setAffidavitVerificationFailed(false);
    setPendingResumeDraft(null);
    setResumeModalOpen(false);
    setHasStoredSession(false);
  }, []);

  const handleStartAfresh = useCallback(async () => {
    if (
      step > 0 &&
      !window.confirm("Discard your current application and start over?")
    ) {
      return;
    }

    setBusy(true);
    setApiError(null);

    try {
      await discardServerDrafts(form.email);
    } catch (error) {
      setApiError(
        error instanceof PublishApiError
          ? error.message
          : "Could not discard your saved application."
      );
    } finally {
      resetWizardLocally();
      setBusy(false);
    }
  }, [discardServerDrafts, form.email, resetWizardLocally, step]);

  const handleResumeChoice = useCallback(
    async (forceNew: boolean) => {
      const draft = pendingResumeDraft;
      if (!draft) return;

      setResumeModalOpen(false);
      setPendingResumeDraft(null);
      setBusy(true);
      setApiError(null);

      try {
        if (forceNew) {
          await discardServerDrafts(form.email, [draft.draftId]);
          resetWizardLocally();
          return;
        }

        const phone = form.phone.trim();
        applyDraft(draft, { inferStep: true, storedStep: loadDraftSession()?.step });
        if (phone) {
          await patchDraft(draft.draftId, { phone });
        }
      } catch (error) {
        setApiError(
          error instanceof PublishApiError ? error.message : "Could not resume your application."
        );
      } finally {
        setBusy(false);
      }
    },
    [
      applyDraft,
      discardServerDrafts,
      form.email,
      form.phone,
      pendingResumeDraft,
      resetWizardLocally,
    ]
  );

  const goNext = useCallback(async () => {
    if (!validateCurrentStep()) return;
    setApiError(null);

    if (step === 0) {
      setBusy(true);
      try {
        const draft = await initDraft(form.email.trim());
        if (draft.resumed) {
          setPendingResumeDraft(draft);
          setResumeModalOpen(true);
          return;
        }
        applyDraft(draft);
        await patchDraft(draft.draftId, { phone: form.phone.trim() });
        setStep(1);
      } catch (error) {
        setApiError(
          error instanceof PublishApiError ? error.message : "Could not start your application."
        );
      } finally {
        setBusy(false);
      }
      return;
    }

    if (step === 1) {
      if (!draftId) return;
      setBusy(true);
      try {
        await syncDraftFields(draftId, form);
        setStep(2);
      } catch (error) {
        setApiError(
          error instanceof PublishApiError ? error.message : "Could not save your details."
        );
      } finally {
        setBusy(false);
      }
      return;
    }

    if (step === 2) {
      if (!draftId) return;

      if (affidavitVerificationFailed) return;

      if (hasAffidavit && !documentFile) {
        setStep(3);
        return;
      }

      setVerifyingAffidavit(true);
      setApiError(null);

      try {
        const updated = await verifyAffidavitDraft(draftId, documentFile ?? undefined);
        setHasAffidavit(updated.hasAffidavit);
        setAffidavitVerificationFailed(false);
        setStep(3);
      } catch (error) {
        setHasAffidavit(false);
        setAffidavitVerificationFailed(true);
        setApiError(
          error instanceof PublishApiError
            ? error.message
            : AFFIDAVIT_VERIFY_FAILED_MESSAGE
        );
      } finally {
        setVerifyingAffidavit(false);
      }
      return;
    }

    if (step === 3) {
      setStep(4);
      return;
    }

    setStep((current) => Math.min(current + 1, 4));
  }, [
    applyDraft,
    documentFile,
    draftId,
    form,
    step,
    syncDraftFields,
    affidavitVerificationFailed,
    hasAffidavit,
    validateCurrentStep,
  ]);

  const goBack = useCallback(() => {
    setErrors({});
    setApiError(null);
    setAffidavitVerificationFailed(false);
    setStep((current) => Math.max(current - 1, 0));
  }, []);

  const handlePay = useCallback(async () => {
    if (!validateCurrentStep() || !draftId) return;
    setBusy(true);
    setApiError(null);
    try {
      await syncDraftFields(draftId, { ...form, consentGiven: true });
      saveDraftSession({ draftId, email: form.email, step: 4 });
      const payment = await initializePayment(draftId);
      window.location.href = payment.authorizationUrl;
    } catch (error) {
      setApiError(
        error instanceof PublishApiError ? error.message : "Could not start payment."
      );
      setBusy(false);
    }
  }, [draftId, form, syncDraftFields, validateCurrentStep]);

  const handleReturnHome = useCallback(() => {
    clearDraftSession();
    sessionBootstrapped.current = false;
    setPublishedNotice(null);
    setPublishedEmail(null);
    setPublishing(false);
    setStep(0);
    setForm(initialPublishFormData);
    setErrors({});
    setDraftId(null);
    setHasAffidavit(false);
    setDocumentFile(null);
    setAffidavitVerificationFailed(false);
    setPendingResumeDraft(null);
    setResumeModalOpen(false);
    setHasStoredSession(false);
    setApiError(null);
    router.replace("/");
  }, [router]);

  const clearDocument = useCallback(() => {
    setDocumentFile(null);
    setHasAffidavit(false);
    setAffidavitVerificationFailed(false);
    setApiError(null);
  }, []);

  const replaceDocument = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    step,
    form,
    errors,
    draftId,
    hasAffidavit,
    documentFile,
    previewUrl,
    busy,
    apiError,
    uploadingAffidavit,
    verifyingAffidavit,
    affidavitVerificationFailed,
    verifyingAffidavitDescription: AFFIDAVIT_VERIFYING_DESCRIPTION,
    resumeModalOpen,
    setResumeModalOpen,
    publishedNotice,
    publishedEmail,
    publishing,
    hasSavedState,
    fileInputRef,
    updateField,
    goNext,
    goBack,
    handlePay,
    handleStartAfresh,
    handleResumeChoice,
    handleFileAdd,
    handleReturnHome,
    clearDocument,
    replaceDocument,
  };
}