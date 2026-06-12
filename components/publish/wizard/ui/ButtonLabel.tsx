import React from "react";
import { Loading } from "@carbon/react";

export function ButtonLabel({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      {loading && (
        <Loading small withOverlay={false} className="publish-wizard__btn-spinner" />
      )}
      {children}
    </span>
  );
}