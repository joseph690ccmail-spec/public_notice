"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Close, Menu, Search } from "@carbon/icons-react";
import { Button, ClickableTile, IconButton } from "@carbon/react";

const utilityLinks = [
  { href: "#search", label: "Search Registry" },
  { href: "#verify", label: "Verify Notice" },
  { href: "/login", label: "Sign In" },
];

export default function PublicNoticeSystem() {
  const [utilityMenuOpen, setUtilityMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans">
      {/* Major Header - Nigerian Government */}
      <header className="w-full bg-[var(--color-primary)] text-white">
        {/* Utility / Top bar (Carbon style) */}
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
                  onClick={() => setUtilityMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
        </div>

        {/* Main Header: Logo (left) + Title contents (right) - left aligned */}
        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
            {/* Logo on the left */}
            <div className="flex-shrink-0">
              <Image
                src="/assets/img/icon.png"
                alt="Ministry Logo"
                width={110}
                height={110}
                className="h-auto w-[90px] md:w-[110px] object-contain"
                priority
              />
            </div>

            {/* Text title contents on the right - left aligned */}
            <div className="flex-1 text-left">
              <div className="mb-1 text-xs tracking-[1.5px] font-medium opacity-90">
                FEDERAL REPUBLIC OF NIGERIA
              </div>

              <h1 
                className="text-4xl md:text-5xl font-light tracking-[-0.4px] leading-[1.05] mb-3" 
                style={{ fontFamily: 'var(--font-plex-sans), system-ui' }}
              >
                Public Notice System
              </h1>

              <p className="max-w-xl text-base md:text-lg text-white/90 tracking-[0.16px]">
                Official digital platform for publishing and verifying public notices
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Search Notices - right after title section, shorter height, side-by-side */}
      <section id="search" className="border-b border-[var(--color-hairline)] bg-[var(--color-surface-1)]">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            {/* Text on the left */}
            <div className="md:w-2/5">
              <div className="font-medium tracking-tight">Search Public Notices</div>
              <div className="text-sm text-[var(--color-ink-muted)] mt-0.5">
                Find published notices by name, PNN or keyword. No login required.
              </div>
            </div>

            {/* Search form on the right */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <input 
                  type="text" 
                  placeholder="Enter name, PNN (e.g. PNS/CON/2026/000123), or keyword..." 
                  className="w-full flex-1 border border-[var(--color-hairline)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  style={{ borderRadius: 0 }}
                />
                <Button
                  kind="primary"
                  renderIcon={Search}
                  size="md"
                  className="flex-shrink-0 self-end sm:self-auto"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section (Carbon style cards) */}
      <section id="quick-actions" className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
        <div className="mb-8">
          <div className="text-xs tracking-[0.16px] text-[var(--color-ink-muted)] mb-1">QUICK ACTIONS</div>
          <h2 
            className="text-3xl font-light tracking-[-0.3px]"
            style={{ fontFamily: 'var(--font-plex-sans), system-ui' }}
          >
            What would you like to do?
          </h2>
          <p className="mt-2 max-w-md text-[var(--color-ink-muted)]">
            Access the core services of the Public Notice System. All actions follow official government processes.
          </p>
        </div>

        {/* Quick Action Tiles using ClickableTile (Carbon design) */}
        <div className="quick-actions-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Tile 1: Publish Notice */}
          <ClickableTile
            href="/publish"
            id="clickable-tile-publish"
            renderIcon={ArrowRight}
            title="Publish a Notice"
          >
            <h3 className="text-xl font-medium tracking-tight mb-2 transition-colors">Publish a Notice</h3>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Submit a Change of Name notice and receive your official PNN and certificate.
            </p>
          </ClickableTile>

          {/* Tile 2: Search Registry */}
          <ClickableTile
            href="#search"
            id="clickable-tile-search"
            renderIcon={ArrowRight}
            title="Search the Registry"
          >
            <h3 className="text-xl font-medium tracking-tight mb-2 transition-colors">Search the Registry</h3>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Search the public database of published notices by name, PNN, or date.
            </p>
          </ClickableTile>

          {/* Tile 3: Recent Publications */}
          <ClickableTile
            href="/notices"
            id="clickable-tile-notices"
            renderIcon={ArrowRight}
            title="Recent Publications"
          >
            <h3 className="text-xl font-medium tracking-tight mb-2 transition-colors">Recent Publications</h3>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Browse the most recently published public notices.
            </p>
          </ClickableTile>
        </div>
      </section>

      {/* Minimal Footer - one row */}
      <footer className="mt-auto bg-[var(--color-inverse-canvas)] text-[var(--color-inverse-surface-1)] border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs tracking-[0.16px]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-y-2 text-[var(--color-ink-subtle)]">
            <div>
              © {new Date().getFullYear()} Federal Republic of Nigeria — Public Notice System
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms of Use</a>
              <a href="#" className="hover:text-white">Accessibility</a>
              <a href="#" className="hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
