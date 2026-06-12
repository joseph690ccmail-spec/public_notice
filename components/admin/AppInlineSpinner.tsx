import React from "react";
import { Loading } from "@carbon/react";

interface AppInlineSpinnerProps {
  description?: string;
}

export function AppInlineSpinner({ description = "Loading" }: AppInlineSpinnerProps) {
  return (
    <Loading
      small
      withOverlay={false}
      description={description}
      className="app-inline-spinner"
    />
  );
}