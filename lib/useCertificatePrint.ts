"use client";

import { useCallback, useEffect } from "react";

export function useCertificatePrint() {
  useEffect(() => {
    const cleanup = () => {
      document.body.classList.remove("printing-certificate");
    };

    window.addEventListener("afterprint", cleanup);
    return () => {
      window.removeEventListener("afterprint", cleanup);
      cleanup();
    };
  }, []);

  return useCallback(() => {
    document.body.classList.add("printing-certificate");
    requestAnimationFrame(() => {
      window.print();
    });
  }, []);
}