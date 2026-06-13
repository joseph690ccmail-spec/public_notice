"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentView } from "@carbon/icons-react";
import { Button, Loading, Pagination, Tile } from "@carbon/react";
import { NoticeCertificateModal } from "@/components/notices/NoticeCertificateModal";
import { ButtonLabel } from "@/components/publish/wizard/ui/ButtonLabel";
import { NoticesPageHeader } from "@/components/site/NoticesPageHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  getNoticeByPnn,
  listNotices,
  PublishApiError,
  searchNotices,
} from "@/lib/api/client";
import { formatNoticeDate } from "@/lib/notices";
import type { PublicNoticeResponse } from "@/lib/notices/dto";

const PNN_PATTERN = /^PNN-[A-Z0-9]{6}$/i;

function NoticeBody({ notice }: { notice: PublicNoticeResponse }) {
  return (
    <p className="notice-card__body text-sm leading-relaxed tracking-[0.16px] text-[var(--color-ink)] md:text-base">
      I, formerly known as{" "}
      <strong className="font-semibold uppercase">{notice.formerName}</strong> now wish to
      be called and addressed as{" "}
      <strong className="font-semibold uppercase">{notice.newName}</strong>. All former
      documents remain valid. General public should please take note.
    </p>
  );
}

function NoticeCard({
  notice,
  onView,
}: {
  notice: PublicNoticeResponse;
  onView: (notice: PublicNoticeResponse) => void;
}) {
  return (
    <Tile className="notice-card h-full">
      <div className="notice-card__labels mb-4 flex flex-wrap items-center gap-2">
        <span className="notice-card__label text-xs font-semibold tracking-[0.32px] text-[var(--color-ink)]">
          PUBLIC NOTICE
        </span>
        <span className="hidden text-[var(--color-ink-subtle)] sm:inline" aria-hidden>
          ·
        </span>
        <span className="notice-card__label text-xs font-semibold tracking-[0.32px] text-[var(--color-primary)]">
          CHANGE OF NAME
        </span>
      </div>

      <NoticeBody notice={notice} />

      <div className="notice-card__meta mt-6 flex flex-col gap-4 border-t border-[var(--color-hairline)] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <span className="font-mono text-xs tracking-[0.16px] text-[var(--color-primary)] md:text-sm">
            {notice.pnn}
          </span>
          <span className="hidden text-[var(--color-hairline-strong)] sm:inline" aria-hidden>
            |
          </span>
          <span className="text-xs tracking-[0.16px] text-[var(--color-ink-muted)]">
            Published {formatNoticeDate(notice.publishedAt)}
          </span>
        </div>

        <Button
          kind="tertiary"
          size="sm"
          renderIcon={DocumentView}
          className="notice-card__action self-end sm:self-auto"
          onClick={() => onView(notice)}
        >
          View notice
        </Button>
      </div>
    </Tile>
  );
}

function RecentPublicationsPageContent() {
  const searchParams = useSearchParams();
  const appliedQueryParamRef = useRef<string | null>(null);
  const pnnFromUrl = searchParams.get("pnn")?.trim() ?? "";
  const hasPnnQuery = pnnFromUrl.length > 0;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState(hasPnnQuery ? pnnFromUrl.toUpperCase() : "");
  const [activeSearch, setActiveSearch] = useState<string | null>(null);
  const [items, setItems] = useState<PublicNoticeResponse[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(!hasPnnQuery);
  const [searchLoading, setSearchLoading] = useState(hasPnnQuery);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<PublicNoticeResponse | null>(null);
  const [certificateOpen, setCertificateOpen] = useState(false);

  const loadNotices = useCallback(async (nextPage: number, limit: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await listNotices(nextPage, limit);
      setItems(result.items);
      setTotalItems(result.pagination.total);
    } catch (err) {
      setItems([]);
      setTotalItems(0);
      setError(
        err instanceof PublishApiError
          ? err.message
          : "Could not load notices. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSearch) return;
    if (searchParams.get("pnn")?.trim()) return;
    void loadNotices(page, pageSize);
  }, [activeSearch, loadNotices, page, pageSize, searchParams]);

  const openCertificate = useCallback((notice: PublicNoticeResponse) => {
    setSelectedNotice(notice);
    setCertificateOpen(true);
  }, []);

  const runSearch = useCallback(
    async (rawQuery: string, options?: { openCertificateIfSingle?: boolean }) => {
      const trimmed = rawQuery.trim();

      if (!trimmed) {
        setActiveSearch(null);
        setPage(1);
        setError(null);
        return;
      }

      if (trimmed.length < 2) {
        setError("Enter at least 2 characters to search.");
        return;
      }

      setSearchLoading(true);
      setError(null);

      try {
        if (PNN_PATTERN.test(trimmed)) {
          const notice = await getNoticeByPnn(trimmed.toUpperCase());
          setActiveSearch(notice.pnn);
          setItems([notice]);
          setTotalItems(1);
          setPage(1);
          if (options?.openCertificateIfSingle) {
            openCertificate(notice);
          }
          return;
        }

        const result = await searchNotices(trimmed);
        setActiveSearch(result.query);
        setItems(result.items);
        setTotalItems(result.items.length);
        setPage(1);

        if (options?.openCertificateIfSingle && result.items.length === 1) {
          openCertificate(result.items[0]);
        }
      } catch (err) {
        setActiveSearch(null);
        setItems([]);
        setTotalItems(0);
        setError(
          err instanceof PublishApiError
            ? err.message
            : "Could not search notices. Please try again."
        );
      } finally {
        setSearchLoading(false);
      }
    },
    [openCertificate]
  );

  const handleSearch = useCallback(async () => {
    await runSearch(searchQuery);
  }, [runSearch, searchQuery]);

  useEffect(() => {
    const pnn = searchParams.get("pnn")?.trim();
    if (!pnn || appliedQueryParamRef.current === pnn) return;

    appliedQueryParamRef.current = pnn;
    const normalized = pnn.toUpperCase();
    setSearchQuery(normalized);
    setSearchLoading(true);
    void runSearch(normalized, { openCertificateIfSingle: true });
  }, [runSearch, searchParams]);

  const pageNotices = useMemo(() => {
    if (!activeSearch) return items;
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [activeSearch, items, page, pageSize]);

  const closeCertificate = () => {
    setCertificateOpen(false);
    setSelectedNotice(null);
  };

  const isLoading = loading || searchLoading;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans">
      <NoticesPageHeader />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-10">
          <div className="notices-search-bar mb-6 w-full border border-[var(--color-hairline)] bg-white px-4 py-3">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <input
                  id="notices-filter"
                  type="text"
                  placeholder="Search by name, PNN (e.g. PNN-78BGH1), or keyword..."
                  className="w-full border border-[var(--color-hairline)] bg-[var(--color-surface-1)] px-4 py-2.5 text-sm tracking-[0.16px] focus:border-[var(--color-primary)] focus:outline-none"
                  style={{ borderRadius: 0 }}
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    if (error) setError(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !isLoading) {
                      void handleSearch();
                    }
                  }}
                  disabled={isLoading}
                />
                {error && (
                  <p className="mt-1.5 text-sm text-[var(--color-error)]" role="alert">
                    {error}
                  </p>
                )}
              </div>
              <Button
                kind="primary"
                size="md"
                className="home-search__btn flex-shrink-0 self-end sm:mt-0 sm:self-start"
                disabled={isLoading || (searchQuery.trim().length > 0 && searchQuery.trim().length < 2)}
                onClick={() => void handleSearch()}
              >
                <ButtonLabel loading={searchLoading}>Search</ButtonLabel>
              </Button>
            </div>
          </div>

          {activeSearch && !error && (
            <p className="mb-4 text-sm text-[var(--color-ink-muted)]">
              {totalItems} {totalItems === 1 ? "result" : "results"} for &ldquo;{activeSearch}
              &rdquo;
            </p>
          )}

          {isLoading ? (
            <div className="flex min-h-[12rem] items-center justify-center border border-[var(--color-hairline)] bg-white">
              <Loading
                withOverlay={false}
                description={searchLoading ? "Finding notice…" : "Loading notices…"}
              />
            </div>
          ) : pageNotices.length === 0 ? (
            <Tile className="notice-card">
              <p className="py-6 text-center text-sm tracking-[0.16px] text-[var(--color-ink-muted)]">
                {activeSearch
                  ? `No notices match "${activeSearch}". Try a different name or PNN.`
                  : "No published notices yet."}
              </p>
            </Tile>
          ) : (
            <div className="notice-card-grid grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {pageNotices.map((notice) => (
                <NoticeCard key={notice.pnn} notice={notice} onView={openCertificate} />
              ))}
            </div>
          )}

          {!loading && totalItems > 0 && (
            <div className="mt-6 flex flex-col gap-4 border border-[var(--color-hairline)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <Pagination
                page={page}
                pageSize={pageSize}
                pageSizes={[5, 10, 20]}
                totalItems={totalItems}
                onChange={({ page: nextPage, pageSize: nextPageSize }) => {
                  setPage(nextPage);
                  setPageSize(nextPageSize);
                }}
                size="md"
              />
            </div>
          )}
        </section>
      </main>

      <SiteFooter />

      <NoticeCertificateModal
        notice={selectedNotice}
        open={certificateOpen}
        onClose={closeCertificate}
      />
    </div>
  );
}

function NoticesPageFallback() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans">
      <NoticesPageHeader />
      <main className="flex flex-1 items-center justify-center">
        <Loading withOverlay={false} description="Loading notices…" />
      </main>
      <SiteFooter />
    </div>
  );
}

export default function RecentPublicationsPage() {
  return (
    <Suspense fallback={<NoticesPageFallback />}>
      <RecentPublicationsPageContent />
    </Suspense>
  );
}