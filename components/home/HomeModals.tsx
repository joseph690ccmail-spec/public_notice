"use client";

import React, { useEffect, useState } from "react";
import { ServicePickerModal } from "@/components/publish/ServicePickerModal";
import { VerifyNoticeModal } from "@/components/notices/VerifyNoticeModal";

interface HomeModalsProps {
  verifyOpen: boolean;
  publishOpen: boolean;
  onVerifyClose: () => void;
  onPublishClose: () => void;
}

export function HomeModals({
  verifyOpen,
  publishOpen,
  onVerifyClose,
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
        <VerifyNoticeModal open onClose={onVerifyClose} />
      )}
      {publishOpen && <ServicePickerModal onClose={onPublishClose} />}
    </>
  );
}