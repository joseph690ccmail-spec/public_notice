"use client";

import React from "react";
import { BreadcrumbItem, type BreadcrumbItemProps } from "@carbon/react";
import { useAppNavigation } from "@/components/site/AppNavigationProvider";

type AppBreadcrumbItemProps = BreadcrumbItemProps & {
  href?: string;
};

export function AppBreadcrumbItem({
  href,
  onClick,
  isCurrentPage,
  children,
  ...props
}: AppBreadcrumbItemProps) {
  const { navigate } = useAppNavigation();

  if (isCurrentPage || !href) {
    return (
      <BreadcrumbItem isCurrentPage={isCurrentPage} {...props}>
        {children}
      </BreadcrumbItem>
    );
  }

  return (
    <BreadcrumbItem
      {...props}
      href={href}
      onClick={(event) => {
        if (href.startsWith("/")) {
          event.preventDefault();
          navigate(href);
        }
        onClick?.(event);
      }}
    >
      {children}
    </BreadcrumbItem>
  );
}