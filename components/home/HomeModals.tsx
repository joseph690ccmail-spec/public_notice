"use client";

import React, { useEffect, useState } from "react";
import { NoticeSearchResultsModal } from "@/components/notices/NoticeSearchResultsModal";
import { ServicePickerModal } from "@/components/publish/ServicePickerModal";
import { VerifyNoticeModal } from "@/components/notices/VerifyNoticeModal";
import type { ChangeOfNameNotice } from "@/lib/notices";
import type { PublicNoticeResponse } from "@/lib/notices/dto";

interface HomeModalsProps {
  verifyOpen: boolean;
  verifyPnn?: string;
  verifyPreloadedNotice?: ChangeOfNameNotice | null;
  searchResultsOpen: boolean;
  searchResultsQuery: string;
  searchResultsItems: PublicNoticeResponse[];
  publishOpen: boolean;
  onVerifyClose: () => void;
  onSearchResultsClose: () => void;
  onSearchResultSelect: (pnn: string) => void;
  onPublishClose: () => void;
}

export function HomeModals({
  verifyOpen,
  verifyPnn,
  verifyPreloadedNotice,
  searchResultsOpen,
  searchResultsQuery,
  searchResultsItems,
  publishOpen,
  onVerifyClose,
  onSearchResultsClose,
  onSearchResultSelect,
  onPublishClose,
}: HomeModalsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {verifyOpen && (
        <VerifyNoticeModal
          open
          initialPnn={verifyPnn}
          preloadedNotice={verifyPreloadedNotice}
          onClose={onVerifyClose}
        />
      )}
      {searchResultsOpen && (
        <NoticeSearchResultsModal
          open
          query={searchResultsQuery}
          items={searchResultsItems}
          onClose={onSearchResultsClose}
          onSelect={onSearchResultSelect}
        />
      )}
      {publishOpen && <ServicePickerModal onClose={onPublishClose} />}
    </>
  );
}