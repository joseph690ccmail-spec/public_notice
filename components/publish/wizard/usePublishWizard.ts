"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  abandonDraftByEmail,
  discardDraft,
  initDraft,
  initializePayment,
  patchDraft,
  pollForPublishedNotice,
  PublishApiError,
  sendSaveForLaterLink,
  uploadAffidavit,
  verifyPayment,
} from "@/lib/api/client";
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

export function usePublishWizard() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [pendingResumeDraft, setPendingResumeDraft] = useState<DraftResponse | null>(null);
  const [saveLinkSent, setSaveLinkSent] = useState(false);
  const [saveLinkBusy, setSaveLinkBusy] = useState(false);
  const [publishedNotice, setPublishedNotice] = useState<PublicNoticeResponse | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [hasStoredSession, setHasStoredSession] = useState(false);

  const hasSavedState = Boolean(draftId || hasStoredSession);

  const applyDraft = useCallback((draft: DraftResponse, resumed = false) => {
    setDraftId(draft.draftId);
    setForm(draftToForm(draft));
    setHasAffidavit(draft.hasAffidavit);
    saveDraftSession({ draftId: draft.draftId, email: draft.email });
    setHasStoredSession(true);
    if (resumed) {
      setStep(inferStepFromDraft(draft));
    }
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

  useEffect(() => {
    const stored = loadDraftSession();
    if (stored?.email) {
      setHasStoredSession(true);
      setForm((prev) => (prev.email ? prev : { ...prev, email: stored.email }));
    }
  }, []);

  useEffect(() => {
    if (!documentFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(documentFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [documentFile]);

  const handlePaymentReturn = useCallback(async () => {
    const reference =
      searchParams.get("reference")?.trim() ||
      searchParams.get("trxref")?.trim() ||
      "";

    if (!reference) {
      setApiError("Payment reference missing. Contact support if you were charged.");
      setStep(4);
      return;
    }

    setPublishing(true);
    setApiError(null);

    try {
      const verification = await verifyPayment(reference);
      if (!verification.paid) {
        setApiError("Payment was not completed. You can try again below.");
        setStep(4);
        return;
      }

      const notice = await pollForPublishedNotice(form.newName);
      if (notice) {
        setPublishedNotice(notice);
        clearDraftSession();
      } else {
        setApiError(
          "Payment received. Your notice is being published — check your email shortly for your PNN."
        );
      }
    } catch (error) {
      setApiError(
        error instanceof PublishApiError
          ? error.message
          : "Could not verify payment. Please try again."
      );
      setStep(4);
    } finally {
      setPublishing(false);
    }
  }, [form.newName, searchParams]);

  useEffect(() => {
    if (searchParams.get("payment") !== "return") return;
    handlePaymentReturn();
  }, [handlePaymentReturn, searchParams]);

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
    setSaveLinkSent(false);
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
        applyDraft(draft, true);
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
      if (documentFile && !hasAffidavit) {
        setUploadingAffidavit(true);
        try {
          const updated = await uploadAffidavit(draftId, documentFile);
          setHasAffidavit(updated.hasAffidavit);
        } catch (error) {
          setApiError(
            error instanceof PublishApiError ? error.message : "Could not upload your affidavit."
          );
          return;
        } finally {
          setUploadingAffidavit(false);
        }
      }
      setStep(3);
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
    hasAffidavit,
    step,
    syncDraftFields,
    validateCurrentStep,
  ]);

  const goBack = useCallback(() => {
    setErrors({});
    setApiError(null);
    setStep((current) => Math.max(current - 1, 0));
  }, []);

  const handlePay = useCallback(async () => {
    if (!validateCurrentStep() || !draftId) return;
    setBusy(true);
    setApiError(null);
    try {
      await syncDraftFields(draftId, { ...form, consentGiven: true });
      const payment = await initializePayment(draftId);
      window.location.href = payment.authorizationUrl;
    } catch (error) {
      setApiError(
        error instanceof PublishApiError ? error.message : "Could not start payment."
      );
      setBusy(false);
    }
  }, [draftId, form, syncDraftFields, validateCurrentStep]);

  const handleSaveForLater = useCallback(async () => {
    if (!draftId) return;
    setSaveLinkBusy(true);
    setApiError(null);
    try {
      await sendSaveForLaterLink(draftId);
      setSaveLinkSent(true);
    } catch (error) {
      setApiError(
        error instanceof PublishApiError ? error.message : "Could not send resume link."
      );
    } finally {
      setSaveLinkBusy(false);
    }
  }, [draftId]);

  const clearDocument = useCallback(() => {
    setDocumentFile(null);
    setHasAffidavit(false);
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
    resumeModalOpen,
    setResumeModalOpen,
    saveLinkSent,
    saveLinkBusy,
    publishedNotice,
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
    handleSaveForLater,
    clearDocument,
    replaceDocument,
  };
}