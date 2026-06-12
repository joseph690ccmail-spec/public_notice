"use client";

import React from "react";
import { Breadcrumb } from "@carbon/react";
import { AppBreadcrumbItem } from "@/components/site/AppBreadcrumbItem";
import { UtilityBar } from "./UtilityBar";

export function NoticesPageHeader() {
  return (
    <header className="notices-page-header w-full border-b border-[var(--color-hairline)] bg-[var(--color-page-header-surface)]">
      <UtilityBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <Breadcrumb className="notices-page-header__breadcrumb mb-4" noTrailingSlash>
          <AppBreadcrumbItem href="/">Home</AppBreadcrumbItem>
          <AppBreadcrumbItem isCurrentPage>Notice registry</AppBreadcrumbItem>
        </Breadcrumb>
        
        <h1
          className="text-2xl font-light tracking-[-0.2px] text-[var(--color-ink)] md:text-[2rem] leading-tight"
          style={{ fontFamily: "var(--font-plex-sans), system-ui" }}
        >
          All Public Notices
        </h1>
        <p className="mt-3 max-w-2xl text-sm tracking-[0.16px] text-[var(--color-ink-muted)] md:text-base">
          Official digital publications from the national registry. Search by name or
          PNN. 
        </p>
      </div>
    </header>
  );
}