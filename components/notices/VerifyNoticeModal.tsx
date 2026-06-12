"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckmarkFilled, Printer } from "@carbon/icons-react";
import {
  Button,
  ComposedModal,
  Loading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tag,
  TextInput,
} from "@carbon/react";
import { ButtonLabel } from "@/components/publish/wizard/ui/ButtonLabel";
import { FieldError } from "@/components/publish/wizard/ui/FieldError";
import { getNoticeByPnn, PublishApiError } from "@/lib/api/client";
import { formatNoticeDate, type ChangeOfNameNotice } from "@/lib/notices";
import { publicNoticeToCertificateNotice } from "@/lib/notices/mappers";
import { useCertificatePrint } from "@/lib/useCertificatePrint";
import { NoticeCertificate } from "./NoticeCertificate";

interface VerifyNoticeModalProps {
  open?: boolean;
  initialPnn?: string;
  preloadedNotice?: ChangeOfNameNotice | null;
  onClose: () => void;
}

export function VerifyNoticeModal({
  open = true,
  initialPnn,
  preloadedNotice,
  onClose,
}: VerifyNoticeModalProps) {
  const [pnn, setPnn] = useState("");
  const [verifiedNotice, setVerifiedNotice] = useState<ChangeOfNameNotice | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handlePrint = useCertificatePrint();

  const reset = useCallback(() => {
    setPnn("");
    setVerifiedNotice(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const verifyByPnn = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter a Public Notice Number (PNN) to verify.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const notice = await getNoticeByPnn(trimmed);
      setVerifiedNotice(publicNoticeToCertificateNotice(notice));
    } catch (err) {
      setVerifiedNotice(null);
      setError(
        err instanceof PublishApiError
          ? err.message
          : "Could not verify this notice. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    if (preloadedNotice) {
      setPnn(preloadedNotice.pnn);
      setVerifiedNotice(preloadedNotice);
      return;
    }

    if (!initialPnn?.trim()) return;
    setPnn(initialPnn.trim());
    void verifyByPnn(initialPnn);
  }, [open, initialPnn, preloadedNotice, verifyByPnn]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleVerify = useCallback(() => {
    void verifyByPnn(pnn);
  }, [pnn, verifyByPnn]);

  if (!open) return null;

  return (
    <>
      <ComposedModal
        open
        onClose={handleClose}
        size={verifiedNotice ? "md" : "sm"}
      >
        <ModalHeader
          className="bg-[var(--color-canvas)]"
          title="Verify a public notice"
          label="PNN"
          closeModal={handleClose}
        />
        <ModalBody
          hasScrollingContent
          className={`p-4 ${verifiedNotice ? "bg-[var(--color-surface-2)]" : "bg-[var(--cds-layer-01)]"}`}
        >
          {!verifiedNotice && (
            <>
              {loading && initialPnn ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <Loading withOverlay={false} description="Verifying notice…" />
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    Looking up {initialPnn.trim()} in the national registry.
                  </p>
                </div>
              ) : (
                <>
              <p className="mb-6 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                Enter the Public Notice Number (PNN) shown on the certificate, then
                click Verify to confirm the notice is registered and view the official
                publication record.
              </p>

              <TextInput
                id="verify-pnn-input"
                size="lg"
                labelText={
                  <span className="font-semibold text-[var(--color-ink)]">
                    Public Notice Number (PNN)
                  </span>
                }
                placeholder="e.g. PNN-78BGH1"
                value={pnn}
                onChange={(e) => {
                  setPnn(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    handleVerify();
                  }
                }}
                disabled={loading}
                invalid={Boolean(error)}
              />
              <FieldError message={error ?? undefined} />
                </>
              )}
            </>
          )}

          {verifiedNotice && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3">
                <Tag type="green" renderIcon={CheckmarkFilled}>
                  Verified
                </Tag>
                <div className="min-w-0 text-sm text-[var(--color-ink)]">
                  <span className="font-semibold">{verifiedNotice.pnn}</span>
                  <span className="text-[var(--color-ink-muted)]">
                    {" "}
                    · Published {formatNoticeDate(verifiedNotice.publishedAt)} ·
                    Change of Name
                  </span>
                </div>
              </div>

              <NoticeCertificate
                notice={verifiedNotice}
                id="notice-certificate-preview"
              />
            </div>
          )}
        </ModalBody>
        <ModalFooter className="bg-[var(--color-canvas)]">
          <Button kind="secondary" onClick={handleClose} disabled={loading}>
            Close
          </Button>
          {verifiedNotice ? (
            <Button kind="primary" renderIcon={Printer} onClick={handlePrint}>
              Print certificate
            </Button>
          ) : (
            <Button
              kind="primary"
              onClick={handleVerify}
              disabled={loading || !pnn.trim()}
              className="home-search__btn"
            >
              <ButtonLabel loading={loading}>Verify</ButtonLabel>
            </Button>
          )}
        </ModalFooter>
      </ComposedModal>

      {verifiedNotice &&
        typeof document !== "undefined" &&
        createPortal(
          <div data-certificate-print-portal className="hidden" aria-hidden="true">
            <NoticeCertificate notice={verifiedNotice} id="notice-certificate-print" />
          </div>,
          document.body
        )}
    </>
  );
}