"use client";

import React from "react";
import { ComposedModal, ModalBody, ModalHeader } from "@carbon/react";
import { ServicePicker } from "./ServicePicker";

interface ServicePickerModalProps {
  onClose: () => void;
}

export function ServicePickerModal({ onClose }: ServicePickerModalProps) {
  return (
    <ComposedModal open onClose={onClose} size="md">
      <ModalHeader
        className="bg-[var(--color-canvas)]"
        title="Publish a public notice"
        label="PNN"
        closeModal={onClose}
      />
      <ModalBody className="bg-[var(--color-surface-2)] p-4 text-left">
        <p className="mb-5 text-sm leading-relaxed text-[var(--color-ink-muted)] tracking-[0.16px]">
          Choose the type of notice you want to publish. More services will be added
          over time.
        </p>

        <ServicePicker onSelect={onClose} />
      </ModalBody>
    </ComposedModal>
  );
}