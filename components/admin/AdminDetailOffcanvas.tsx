"use client";

import React, { useEffect } from "react";
import { Close } from "@carbon/icons-react";
import { IconButton } from "@carbon/react";
import { AppInlineSpinner } from "@/components/admin/AppInlineSpinner";

interface AdminDetailOffcanvasProps {
  open: boolean;
  title: string;
  subtitle?: string;
  loading?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function AdminDetailOffcanvas({
  open,
  title,
  subtitle,
  loading = false,
  onClose,
  children,
}: AdminDetailOffcanvasProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="admin-offcanvas" role="presentation">
      <button
        type="button"
        className="admin-offcanvas__overlay"
        aria-label="Close details panel"
        onClick={onClose}
      />
      <aside
        className="admin-offcanvas__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-offcanvas-title"
      >
        <header className="admin-offcanvas__header">
          <div className="min-w-0 flex-1">
            <h2 id="admin-offcanvas-title" className="admin-offcanvas__title">
              {title}
            </h2>
            {subtitle ? <p className="admin-offcanvas__subtitle">{subtitle}</p> : null}
          </div>
          <IconButton
            kind="ghost"
            size="md"
            label="Close"
            onClick={onClose}
            className="admin-offcanvas__close"
          >
            <Close size={20} />
          </IconButton>
        </header>

        <div className="admin-offcanvas__body">
          {loading ? (
            <div className="admin-offcanvas__loading">
              <AppInlineSpinner description="Loading details…" />
            </div>
          ) : (
            children
          )}
        </div>
      </aside>
    </div>
  );
}