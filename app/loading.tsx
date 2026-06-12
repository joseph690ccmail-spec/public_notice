import React from "react";
import { Loading } from "@carbon/react";

export default function AppLoading() {
  return (
    <div className="app-route-loading flex min-h-[50vh] flex-1 items-center justify-center">
      <Loading withOverlay={false} description="Loading page…" />
    </div>
  );
}