import React from "react";
import { AppInlineSpinner } from "@/components/admin/AppInlineSpinner";

export function AdminLoadingModal() {
  return (
    <div className="admin-route-fallback" aria-busy="true" aria-live="polite">
      <div className="admin-route-fallback__panel" role="status" aria-label="Loading">
        <AppInlineSpinner />
      </div>
    </div>
  );
}