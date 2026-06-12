"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckmarkFilled, Printer } from "@carbon/icons-react";
import {
  Button,
  ComposedModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Tag,
  TextInput,
} from "@carbon/react";
import {
  formatNoticeDate,
  getSampleVerifiedNotice,
  type ChangeOfNameNotice,
} from "@/lib/notices";
import { useCertificatePrint } from "@/lib/useCertificatePrint";
import { NoticeCertificate } from "./NoticeCertificate";

interface VerifyNoticeModalProps {
  open: boolean;
  onClose: () => void;
}

export function VerifyNoticeModal({ open, onClose }: VerifyNoticeModalProps) {
  const [pnn, setPnn] = useState("");
  const [verifiedNotice, setVerifiedNotice] = useState<ChangeOfNameNotice | null>(
    null
  );
  const handlePrint = useCertificatePrint();

  const reset = useCallback(() => {
    setPnn("");
    setVerifiedNotice(null);
  }, []);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const handleVerify = useCallback(() => {
    setVerifiedNotice(getSampleVerifiedNotice(pnn));
  }, [pnn]);

  return (
    <>
      <ComposedModal
        open={open}
        onClose={handleClose}
        size={verifiedNotice ? "md" : "sm"}
      >
        <ModalHeader
          className="bg-canvas"
          title="Verify a public notice"
          label="Public Notice System"
          closeModal={handleClose}
        />
        <ModalBody
          hasScrollingContent
          className={`p-4 ${verifiedNotice ? "bg-surface-2" : "bg-canvas"}`}
        >
          {!verifiedNotice && (
            <>
              <p className="mb-6 text-sm leading-relaxed text-ink-muted">
                Enter the Public Notice Number (PNN) shown on the certificate, then
                click Verify to confirm the notice is registered and view the official
                publication record.
              </p>
              <TextInput
                id="verify-pnn-input"
                size="lg"
                labelText={
                  <span className="font-semibold text-ink">
                    Public Notice Number (PNN)
                  </span>
                }
                placeholder="e.g. PNN-78BGH1"
                value={pnn}
                onChange={(e) => setPnn(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleVerify();
                  }
                }}
              />
            </>
          )}

          {verifiedNotice && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 border border-hairline bg-canvas px-4 py-3">
                <Tag type="green" renderIcon={CheckmarkFilled}>
                  Verified
                </Tag>
                <div className="min-w-0 text-sm text-ink">
                  <span className="font-semibold">{verifiedNotice.pnn}</span>
                  <span className="text-ink-muted">
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
        <ModalFooter className="bg-canvas">
          <Button kind="secondary" onClick={handleClose}>
            Close
          </Button>
          {verifiedNotice ? (
            <Button kind="primary" renderIcon={Printer} onClick={handlePrint}>
              Print certificate
            </Button>
          ) : (
            <Button kind="primary" onClick={handleVerify}>
              Verify
            </Button>
          )}
        </ModalFooter>
      </ComposedModal>

      {open &&
        verifiedNotice &&
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