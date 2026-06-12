"use client";

import React from "react";
import { Document, TrashCan, View } from "@carbon/icons-react";
import { Button, Loading } from "@carbon/react";
import { formatFileSize } from "@/lib/publish";

interface AffidavitPreviewProps {
  file: File;
  previewUrl: string;
  uploading?: boolean;
  uploaded?: boolean;
  onRemove: () => void;
  onReplace: () => void;
}

export function AffidavitPreview({
  file,
  previewUrl,
  uploading = false,
  uploaded = false,
  onRemove,
  onReplace,
}: AffidavitPreviewProps) {
  return (
    <div className="overflow-hidden border border-[var(--color-hairline)] bg-[var(--color-surface-1)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-hairline)] bg-[var(--color-surface-2)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center bg-[var(--color-primary)] text-white">
            <Document size={18} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--color-ink)]">{file.name}</p>
            <p className="text-xs text-[var(--color-ink-muted)]">
              {formatFileSize(file.size)}
              {uploaded ? " · Uploaded securely" : " · Ready to upload"}
            </p>
          </div>
        </div>
        {uploaded && (
          <span className="shrink-0 bg-[var(--color-primary)]/10 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
            Verified
          </span>
        )}
      </div>

      <div className="relative bg-[#e8eaed] p-4 md:p-6">
        <div className="relative mx-auto max-w-md overflow-hidden border border-[var(--color-hairline-strong)] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--color-primary)] via-[#f4c430] to-[#008751]"
            aria-hidden
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview of uploaded court affidavit"
            className="block h-auto max-h-[28rem] w-full object-contain"
          />
        </div>

        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--color-canvas)]/80 backdrop-blur-[1px]">
            <Loading withOverlay={false} small={false} description="Uploading affidavit…" />
            <p className="text-sm text-[var(--color-ink-muted)]">Securing your document…</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-[var(--color-hairline)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
          <View size={14} aria-hidden />
          Review the image above before continuing. Text must be legible.
        </p>
        <div className="flex gap-2">
          <Button kind="ghost" size="sm" onClick={onReplace} disabled={uploading}>
            Replace
          </Button>
          <Button
            kind="danger--ghost"
            size="sm"
            renderIcon={TrashCan}
            onClick={onRemove}
            disabled={uploading}
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}