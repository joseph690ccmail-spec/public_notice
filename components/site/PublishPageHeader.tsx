"use client";

import React from "react";
import { ArrowLeft } from "@carbon/icons-react";
import { Breadcrumb } from "@carbon/react";
import { AppBreadcrumbItem } from "@/components/site/AppBreadcrumbItem";
import { NavAnchor } from "@/components/site/NavAnchor";
import { UtilityBar } from "./UtilityBar";

interface PublishPageHeaderProps {
  title?: string;
  description?: string;
  currentCrumb?: string;
}

export function PublishPageHeader({
  title = "Change of Name",
  description = "Complete the steps below to submit your Change of Name notice for digital publication. No account required for guest publishing.",
  currentCrumb = "Change of Name",
}: PublishPageHeaderProps) {
  return (
    <header className="publish-page-header w-full border-b border-[var(--color-hairline)] bg-[var(--color-page-header-surface)]">
      <UtilityBar />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <Breadcrumb className="publish-page-header__breadcrumb mb-4" noTrailingSlash>
          <AppBreadcrumbItem href="/">Home</AppBreadcrumbItem>
          <AppBreadcrumbItem href="/#publish">Publish notice</AppBreadcrumbItem>
          <AppBreadcrumbItem isCurrentPage>{currentCrumb}</AppBreadcrumbItem>
        </Breadcrumb>
        
        <h1
          className="text-3xl font-light tracking-[-0.2px] text-[var(--color-ink)] md:text-[2rem] leading-tight"
          style={{ fontFamily: "var(--font-plex-sans), system-ui" }}
        >
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm tracking-[0.16px] text-[var(--color-ink-muted)] md:text-base">
          {description}
        </p>
        <NavAnchor
          href="/#publish"
          className="mt-4 inline-flex items-center gap-2 text-sm tracking-[0.16px] text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]"
        >
          <ArrowLeft size={16} aria-hidden />
          Change service
        </NavAnchor>
      </div>
    </header>
  );
}