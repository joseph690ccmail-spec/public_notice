import React from "react";

interface AdminDetailGridProps {
  children: React.ReactNode;
}

export function AdminDetailGrid({ children }: AdminDetailGridProps) {
  return <dl className="admin-detail-grid">{children}</dl>;
}