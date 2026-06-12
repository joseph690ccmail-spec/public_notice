"use client";

import React from "react";
import { useAppNavigation } from "@/components/site/AppNavigationProvider";

type NavAnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

export function NavAnchor({ href, onClick, ...props }: NavAnchorProps) {
  const { navigate } = useAppNavigation();

  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        if (href.startsWith("/")) {
          event.preventDefault();
          navigate(href);
        }
        onClick?.(event);
      }}
    />
  );
}