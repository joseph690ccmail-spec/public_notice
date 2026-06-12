"use client";

import React from "react";
import { DocumentView } from "@carbon/icons-react";
import {
  Button,
  ComposedModal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@carbon/react";
import { formatNoticeDate } from "@/lib/notices";
import type { PublicNoticeResponse } from "@/lib/notices/dto";

interface NoticeSearchResultsModalProps {
  open: boolean;
  query: string;
  items: PublicNoticeResponse[];
  onClose: () => void;
  onSelect: (pnn: string) => void;
}

export function NoticeSearchResultsModal({
  open,
  query,
  items,
  onClose,
  onSelect,
}: NoticeSearchResultsModalProps) {
  if (!open) return null;

  return (
    <ComposedModal open onClose={onClose} size="md">
      <ModalHeader
        className="bg-[var(--color-canvas)]"
        title="Search results"
        label="PNN"
        closeModal={onClose}
      />
      <ModalBody hasScrollingContent className="bg-[var(--cds-layer-01)] p-4">
        <p className="mb-4 text-sm text-[var(--color-ink-muted)]">
          {items.length} results for &ldquo;{query}&rdquo;. Select a notice to view the
          official certificate.
        </p>
        <ul className="space-y-3">
          {items.map((notice) => (
            <li
              key={notice.pnn}
              className="border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-4"
            >
              <p className="text-sm leading-relaxed text-[var(--color-ink)]">
                <span className="font-semibold uppercase">{notice.formerName}</span>
                <span className="text-[var(--color-ink-muted)]"> → </span>
                <span className="font-semibold uppercase">{notice.newName}</span>
              </p>
              <div className="mt-3 flex flex-col gap-3 border-t border-[var(--color-hairline)] pt-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-xs tracking-[0.16px] text-[var(--color-ink-muted)]">
                  <span className="font-mono text-[var(--color-primary)]">{notice.pnn}</span>
                  <span aria-hidden>·</span>
                  <span>Published {formatNoticeDate(notice.publishedAt)}</span>
                </div>
                <Button
                  kind="tertiary"
                  size="sm"
                  renderIcon={DocumentView}
                  className="self-end sm:self-auto"
                  onClick={() => onSelect(notice.pnn)}
                >
                  View certificate
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </ModalBody>
      <ModalFooter className="bg-[var(--color-canvas)]">
        <Button kind="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
}