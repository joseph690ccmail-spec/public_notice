import React from "react";
import Image from "next/image";
import { Breadcrumb, BreadcrumbItem } from "@carbon/react";
import { UtilityBar } from "./UtilityBar";

interface PageBannerProps {
  eyebrow?: string;
  title: string;
  description: string;
  attribution?: string;
}

export function PageBanner({
  eyebrow = "FEDERAL REPUBLIC OF NIGERIA",
  title,
  description,
  attribution,
}: PageBannerProps) {
  return (
    <header className="w-full bg-[var(--color-primary)] text-white">
      <UtilityBar />
      <div className="mx-auto max-w-7xl px-6 py-8 md:py-10">
        <Breadcrumb className="page-banner__breadcrumb mb-5" noTrailingSlash>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>{title}</BreadcrumbItem>
        </Breadcrumb>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
          <div className="flex-shrink-0">
            <Image
              src="/assets/img/seal.svg"
              alt="Federal Republic of Nigeria seal"
              width={88}
              height={88}
              className="h-auto w-[72px] md:w-[88px] object-contain opacity-95"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="mb-1 text-xs tracking-[1.5px] font-medium text-white/80">
              {eyebrow}
            </p>
            <h1
              className="text-3xl md:text-4xl font-light tracking-[-0.3px] leading-[1.1] mb-2"
              style={{ fontFamily: "var(--font-plex-sans), system-ui" }}
            >
              {title}
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-white/90 tracking-[0.16px]">
              {description}
            </p>
            {attribution && (
              <p className="mt-2 max-w-2xl text-xs tracking-[0.16px] text-white/50">
                {attribution}
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}