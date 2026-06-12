"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Search } from "@carbon/icons-react";
import { Button, ClickableTile } from "@carbon/react";
import { HomeModals } from "@/components/home/HomeModals";
import { SiteFooter } from "@/components/site/SiteFooter";
import { UtilityBar } from "@/components/site/UtilityBar";

function clearHash() {
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", `${pathname}${search}`);
}

export default function PublicNoticeSystem() {
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#publish") {
      setPublishOpen(true);
      clearHash();
    } else if (hash === "#verify") {
      setVerifyOpen(true);
      clearHash();
    }
  }, []);

  const closePublish = useCallback(() => setPublishOpen(false), []);
  const closeVerify = useCallback(() => setVerifyOpen(false), []);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans">
      <header className="w-full bg-[var(--color-primary)] text-white">
        <UtilityBar onVerifyClick={() => setVerifyOpen(true)} />

        <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12">
            <div className="flex-shrink-0">
              <Image
                src="/assets/img/seal.svg"
                alt="Ministry Logo"
                width={140}
                height={140}
                className="h-auto w-[90px] md:w-[130px] object-contain"
                priority
              />
            </div>

            <div className="flex-1 text-left">
              <div className="mb-1 text-xs tracking-[1.5px] font-medium opacity-90">
                FEDERAL MINISTRY OF INFORMATION AND NATIONAL ORIENTATION
              </div>

              <h1
                className="text-4xl md:text-5xl font-light tracking-[-0.4px] leading-[1.05] mb-3"
                style={{ fontFamily: "var(--font-plex-sans), system-ui" }}
              >
                PNN
              </h1>

              <p className="max-w-xl text-base md:text-lg text-white/60 tracking-[0.16px]">
                Official digital platform for publishing and verifying public notices
              </p>
            </div>
          </div>
        </div>
      </header>

      <section id="search" className="border-b border-[var(--color-hairline)] bg-[var(--color-surface-1)]">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <div className="md:w-2/5">
              <div className="font-medium tracking-tight">Search Public Notices</div>
              <div className="text-sm text-[var(--color-ink-muted)] mt-0.5">
                Find published notices by name, PNN or keyword.
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <input
                  type="text"
                  placeholder="Enter name, PNN (e.g. PNN-78BGH1), or keyword..."
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

      <section id="quick-actions" className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
        <div className="mb-8">
          <div className="text-xs tracking-[0.16px] text-[var(--color-ink-muted)] mb-1">
            QUICK ACTIONS
          </div>
          <h2
            className="text-3xl font-light tracking-[-0.3px]"
            style={{ fontFamily: "var(--font-plex-sans), system-ui" }}
          >
            What would you like to do?
          </h2>
          <p className="mt-2 max-w-md text-[var(--color-ink-muted)]">
            Access the core services of PNN.
          </p>
        </div>

        <div className="quick-actions-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div id="publish">
            <ClickableTile
              href="#publish"
              id="clickable-tile-publish"
            renderIcon={ArrowRight}
            title="Publish a Notice"
            onClick={(event) => {
              event.preventDefault();
              setPublishOpen(true);
            }}
          >
            <h3 className="text-xl font-medium tracking-tight mb-2 transition-colors">
              Publish a Notice
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Submit a public notice and receive your official PNN and certificate.
            </p>
            </ClickableTile>
          </div>

          <div id="verify">
            <ClickableTile
              href="#verify"
              id="clickable-tile-verify"
              renderIcon={ArrowRight}
              title="Verify a Notice"
              onClick={(event) => {
                event.preventDefault();
                setVerifyOpen(true);
              }}
            >
            <h3 className="text-xl font-medium tracking-tight mb-2 transition-colors">
              Verify a Notice
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Confirm a PNN is registered and view the official publication record.
            </p>
            </ClickableTile>
          </div>

          <ClickableTile
            href="/notices"
            id="clickable-tile-notices"
            renderIcon={ArrowRight}
            title="Recent Publications"
          >
            <h3 className="text-xl font-medium tracking-tight mb-2 transition-colors">
              Recent Publications
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Browse the most recently published public notices.
            </p>
          </ClickableTile>
        </div>
      </section>

      <SiteFooter />

      <HomeModals
        verifyOpen={verifyOpen}
        publishOpen={publishOpen}
        onVerifyClose={closeVerify}
        onPublishClose={closePublish}
      />
    </div>
  );
}