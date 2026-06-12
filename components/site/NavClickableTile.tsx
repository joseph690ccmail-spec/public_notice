"use client";

import React from "react";
import { ClickableTile, type ClickableTileProps } from "@carbon/react";
import { useAppNavigation } from "@/components/site/AppNavigationProvider";

type NavClickableTileProps = ClickableTileProps & {
  href: string;
};

export function NavClickableTile({
  href,
  onClick,
  className,
  ...props
}: NavClickableTileProps) {
  const { navigate, isPending } = useAppNavigation();
  const isInternalRoute = href.startsWith("/");

  return (
    <ClickableTile
      {...props}
      href={href}
      className={[className, isPending ? "nav-clickable-tile--pending" : ""]
        .filter(Boolean)
        .join(" ")}
      onClick={(event) => {
        if (onClick) {
          onClick(event);
          return;
        }

        if (isInternalRoute) {
          event.preventDefault();
          navigate(href);
        }
      }}
    />
  );
}