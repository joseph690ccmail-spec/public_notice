"use client";

import React, { useState } from "react";
import { Close, Menu } from "@carbon/icons-react";
import { IconButton } from "@carbon/react";

const utilityLinks = [
  { href: "/#search", label: "Search Registry" },
  { href: "/#verify", label: "Verify Notice", action: "verify" as const },
  { href: "/login", label: "Sign In" },
];

interface UtilityBarProps {
  onVerifyClick?: () => void;
}

export function UtilityBar({ onVerifyClick }: UtilityBarProps) {
  const [utilityMenuOpen, setUtilityMenuOpen] = useState(false);

  return (
    <div className="utility-bar bg-[var(--color-primary-dark)] text-sm text-white/75">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-2 md:px-6 text-xs tracking-[0.16px]">
        <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
          <span className="truncate text-white/80">FEDERAL REPUBLIC OF NIGERIA</span>
          <span className="hidden md:inline text-white/40">•</span>
          <span className="hidden md:inline text-white/65">Official Government Platform</span>
        </div>

        <div className="flex shrink-0 items-center justify-end">
          <nav
            className="hidden md:flex items-center justify-end gap-6"
            aria-label="Utility navigation"
          >
            {utilityLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/75 hover:text-white transition-colors whitespace-nowrap"
                onClick={
                  link.action === "verify" && onVerifyClick
                    ? (event) => {
                        event.preventDefault();
                        onVerifyClick();
                      }
                    : undefined
                }
              >
                {link.label}
              </a>
            ))}
          </nav>

          <IconButton
            className="utility-bar__menu-btn md:hidden"
            kind="ghost"
            size="sm"
            label={utilityMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setUtilityMenuOpen((open) => !open)}
          >
            {utilityMenuOpen ? <Close size={20} /> : <Menu size={20} />}
          </IconButton>
        </div>
      </div>

      {utilityMenuOpen && (
        <nav
          className="utility-bar__mobile-menu md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-3"
          aria-label="Utility navigation mobile"
        >
          {utilityLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white/80 hover:text-white py-1 transition-colors"
              onClick={(event) => {
                if (link.action === "verify" && onVerifyClick) {
                  event.preventDefault();
                  onVerifyClick();
                }
                setUtilityMenuOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}