"use client";

import React, { useMemo, useState } from "react";
import { DocumentView, Search } from "@carbon/icons-react";
import { Button, Pagination, Tag, Tile } from "@carbon/react";
import { NoticeCertificateModal } from "@/components/notices/NoticeCertificateModal";
import { NoticesPageHeader } from "@/components/site/NoticesPageHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  buildNoticeText,
  formatNoticeDate,
  recentNotices,
  type ChangeOfNameNotice,
} from "@/lib/notices";

function NoticeBody({ notice }: { notice: ChangeOfNameNotice }) {
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
  notice: ChangeOfNameNotice;
  onView: (notice: ChangeOfNameNotice) => void;
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

export default function RecentPublicationsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<ChangeOfNameNotice | null>(null);
  const [certificateOpen, setCertificateOpen] = useState(false);

  const filteredNotices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return recentNotices;

    return recentNotices.filter((notice) => {
      const body = buildNoticeText(notice).toLowerCase();
      return (
        notice.pnn.toLowerCase().includes(query) ||
        notice.formerName.toLowerCase().includes(query) ||
        notice.newName.toLowerCase().includes(query) ||
        body.includes(query)
      );
    });
  }, [searchQuery]);

  const pageStart = (page - 1) * pageSize;
  const pageNotices = filteredNotices.slice(pageStart, pageStart + pageSize);

  const openCertificate = (notice: ChangeOfNameNotice) => {
    setSelectedNotice(notice);
    setCertificateOpen(true);
  };

  const closeCertificate = () => {
    setCertificateOpen(false);
    setSelectedNotice(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-sans">
      <NoticesPageHeader />

      <main className="flex-1">

        <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-10">
          <div className="notices-search-bar mb-6 w-full border border-[var(--color-hairline)] bg-white px-4 py-3">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
              <input
                id="notices-filter"
                type="text"
                placeholder="Search by name, PNN (e.g. PNN-78BGH1), or keyword..."
                className="w-full flex-1 border border-[var(--color-hairline)] bg-[var(--color-surface-1)] px-4 py-2.5 text-sm tracking-[0.16px] focus:border-[var(--color-primary)] focus:outline-none"
                style={{ borderRadius: 0 }}
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
              />
              <Button
                kind="primary"
                renderIcon={Search}
                size="md"
                className="flex-shrink-0 self-end sm:self-auto"
                onClick={() => setPage(1)}
              >
                Search
              </Button>
            </div>
          </div>

          {pageNotices.length === 0 ? (
            <Tile className="notice-card">
              <p className="py-6 text-center text-sm tracking-[0.16px] text-[var(--color-ink-muted)]">
                No notices match your search. Try a different name or PNN.
              </p>
            </Tile>
          ) : (
            <div className="notice-card-grid grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {pageNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onView={openCertificate}
                />
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-4 border border-[var(--color-hairline)] bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Pagination
              page={page}
              pageSize={pageSize}
              pageSizes={[5, 10, 20]}
              totalItems={filteredNotices.length}
              onChange={({ page: nextPage, pageSize: nextPageSize }) => {
                setPage(nextPage);
                setPageSize(nextPageSize);
              }}
              size="md"
            />
          </div>
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