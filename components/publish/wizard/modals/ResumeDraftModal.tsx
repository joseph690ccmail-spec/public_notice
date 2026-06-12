import React from "react";
import { Modal } from "@carbon/react";

interface ResumeDraftModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onResume: () => void;
  onStartFresh: () => void;
}

export function ResumeDraftModal({
  open,
  email,
  onClose,
  onResume,
  onStartFresh,
}: ResumeDraftModalProps) {
  return (
    <Modal
      className="publish-resume-modal"
      open={open}
      size="sm"
      modalHeading="Continue your application?"
      primaryButtonText="Continue where I left off"
      secondaryButtonText="Start fresh"
      onRequestClose={onClose}
      onRequestSubmit={onResume}
      onSecondarySubmit={onStartFresh}
    >
      <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">
        We found an in-progress Change of Name application for{" "}
        <strong className="text-[var(--color-ink)]">{email}</strong>. You can pick up where you
        left off, or start a new application and discard the previous draft.
      </p>
    </Modal>
  );
}