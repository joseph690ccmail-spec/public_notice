import React from "react";
import { AppInlineSpinner } from "@/components/admin/AppInlineSpinner";

export default function AppLoading() {
  return (
    <div className="app-route-loading flex min-h-[50vh] flex-1 items-center justify-center bg-[var(--color-canvas)]">
      <AppInlineSpinner description="Loading page…" />
    </div>
  );
}