"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  DocumentMultiple_02,
  IbmEloPublishing,
  IbmKnowledgeCatalogStandard,
} from "@carbon/icons-react";
import { Button, ClickableTile } from "@carbon/react";
import { HomeModals } from "@/components/home/HomeModals";
import { NavClickableTile } from "@/components/site/NavClickableTile";
import { ButtonLabel } from "@/components/publish/wizard/ui/ButtonLabel";
import { SiteFooter } from "@/components/site/SiteFooter";
import { UtilityBar } from "@/components/site/UtilityBar";
import { getNoticeByPnn, PublishApiError, searchNotices } from "@/lib/api/client";
import type { ChangeOfNameNotice } from "@/lib/notices";
import type { PublicNoticeResponse } from "@/lib/notices/dto";
import { publicNoticeToCertificateNotice } from "@/lib/notices/mappers";

const PNN_PATTERN = /^PNN-[A-Z0-9]{6}$/i;

function clearHash() {
  const { pathname, search } = window.location;
  window.history.replaceState(null, "", `${pathname}${search}`);
}

export default function PublicNoticeSystem() {
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyPnn, setVerifyPnn] = useState<string | undefined>();
  const [verifyPreloadedNotice, setVerifyPreloadedNotice] =
    useState<ChangeOfNameNotice | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResultsOpen, setSearchResultsOpen] = useState(false);
  const [searchResultsQuery, setSearchResultsQuery] = useState("");
  const [searchResultsItems, setSearchResultsItems] = useState<PublicNoticeResponse[]>(
    []
  );

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
  const closeVerify = useCallback(() => {
    setVerifyOpen(false);
    setVerifyPnn(undefined);
    setVerifyPreloadedNotice(null);
  }, []);

  const openVerify = useCallback((pnn?: string) => {
    setVerifyPreloadedNotice(null);
    setVerifyPnn(pnn);
    setVerifyOpen(true);
  }, []);

  const openVerifiedNotice = useCallback((notice: PublicNoticeResponse) => {
    setVerifyPreloadedNotice(publicNoticeToCertificateNotice(notice));
    setVerifyPnn(notice.pnn);
    setVerifyOpen(true);
  }, []);

  const closeSearchResults = useCallback(() => {
    setSearchResultsOpen(false);
    setSearchResultsItems([]);
    setSearchResultsQuery("");
  }, []);

  const handleSearchResultSelect = useCallback(
    (pnn: string) => {
      const match = searchResultsItems.find((item) => item.pnn === pnn);
      setSearchResultsOpen(false);
      if (match) {
        openVerifiedNotice(match);
      } else {
        openVerify(pnn);
      }
    },
    [openVerifiedNotice, openVerify, searchResultsItems]
  );

  const handleSearch = useCallback(async () => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchError("Enter at least 2 characters to search.");
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchResultsOpen(false);

    try {
      if (PNN_PATTERN.test(trimmed)) {
        const notice = await getNoticeByPnn(trimmed);
        openVerifiedNotice(notice);
        return;
      }

      const result = await searchNotices(trimmed);
      if (result.items.length === 0) {
        setSearchError(`No notices match "${trimmed}". Try a different name or PNN.`);
      } else if (result.items.length === 1) {
        openVerifiedNotice(result.items[0]);
      } else {
        setSearchResultsItems(result.items);
        setSearchResultsQuery(result.query);
        setSearchResultsOpen(true);
      }
    } catch (error) {
      setSearchError(
        error instanceof PublishApiError
          ? error.message
          : "Could not search notices. Please try again."
      );
    } finally {
      setSearchLoading(false);
    }
  }, [openVerifiedNotice, searchQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans">
      <header className="w-full bg-[var(--color-primary)] text-white">
        <UtilityBar onVerifyClick={() => openVerify()} />

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
                className="text-5xl md:text-6xl font-regular tracking-[-0.4px] leading-[1.05] mb-3"
                style={{ fontFamily: "var(--font-plex-sans), system-ui" }}
              >
                Public Notice System
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <label className="sr-only" htmlFor="home-notice-search">
                    Search by name or PNN
                  </label>
                  <input
                    id="home-notice-search"
                    type="text"
                    placeholder="Enter name, PNN (e.g. PNN-78BGH1), or keyword..."
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      if (searchError) setSearchError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !searchLoading) {
                        void handleSearch();
                      }
                    }}
                    className="w-full border border-[var(--color-hairline)] bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                    style={{ borderRadius: 0 }}
                    disabled={searchLoading}
                  />
                  {searchError && (
                    <p
                      className="mt-1.5 text-sm text-[var(--color-error)]"
                      role="alert"
                    >
                      {searchError}
                    </p>
                  )}
                </div>
                <Button
                  kind="primary"
                  size="md"
                  className="home-search__btn flex-shrink-0 self-end sm:mt-0 sm:self-start"
                  disabled={searchLoading || searchQuery.trim().length < 2}
                  onClick={() => void handleSearch()}
                >
                  <ButtonLabel loading={searchLoading}>Search</ButtonLabel>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="quick-actions" className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
        <div className="mb-8">
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
            <IbmEloPublishing
              size={32}
              aria-hidden
              className="mb-3 text-[var(--color-primary)]"
            />
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
                openVerify();
              }}
            >
            <IbmKnowledgeCatalogStandard
              size={32}
              aria-hidden
              className="mb-3 text-[var(--color-primary)]"
            />
            <h3 className="text-xl font-medium tracking-tight mb-2 transition-colors">
              Verify a Notice
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Confirm a PNN is registered and view the official publication record.
            </p>
            </ClickableTile>
          </div>

          <NavClickableTile
            href="/notices"
            id="clickable-tile-notices"
            renderIcon={ArrowRight}
            title="Recent Publications"
          >
            <DocumentMultiple_02
              size={32}
              aria-hidden
              className="mb-3 text-[var(--color-primary)]"
            />
            <h3 className="text-xl font-medium tracking-tight mb-2 transition-colors">
              View Notices
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              Browse the most recently published public notices.
            </p>
          </NavClickableTile>
        </div>
      </section>

      <SiteFooter />

      <HomeModals
        verifyOpen={verifyOpen}
        verifyPnn={verifyPnn}
        verifyPreloadedNotice={verifyPreloadedNotice}
        searchResultsOpen={searchResultsOpen}
        searchResultsQuery={searchResultsQuery}
        searchResultsItems={searchResultsItems}
        publishOpen={publishOpen}
        onVerifyClose={closeVerify}
        onSearchResultsClose={closeSearchResults}
        onSearchResultSelect={handleSearchResultSelect}
        onPublishClose={closePublish}
      />
    </div>
  );
}