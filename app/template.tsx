"use client";

import React from "react";

export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="app-page-enter min-h-full flex flex-1 flex-col">{children}</div>;
}