"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Printer } from "@carbon/icons-react";
import {
  Button,
  ComposedModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@carbon/react";
import type { ChangeOfNameNotice } from "@/lib/notices";
import { useCertificatePrint } from "@/lib/useCertificatePrint";
import { NoticeCertificate } from "./NoticeCertificate";

interface NoticeCertificateModalProps {
  notice: ChangeOfNameNotice | null;
  open: boolean;
  onClose: () => void;
}

export function NoticeCertificateModal({
  notice,
  open,
  onClose,
}: NoticeCertificateModalProps) {
  const handlePrint = useCertificatePrint();

  if (!notice) return null;

  return (
    <>
      <ComposedModal
        open={open}
        onClose={onClose}
        size="lg"
      >
        <ModalHeader
          title="Certificate preview"
          label="Public Notice System"
          closeModal={onClose}
        />
        <ModalBody hasScrollingContent className="bg-surface-2 p-4">
          <NoticeCertificate notice={notice} id="notice-certificate-preview" />
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={onClose}>
            Close
          </Button>
          <Button kind="primary" renderIcon={Printer} onClick={handlePrint}>
            Print certificate
          </Button>
        </ModalFooter>
      </ComposedModal>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div data-certificate-print-portal className="hidden" aria-hidden="true">
            <NoticeCertificate notice={notice} id="notice-certificate-print" />
          </div>,
          document.body
        )}
    </>
  );
}