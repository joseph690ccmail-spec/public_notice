import React from "react";

type AdminDetailStatusTone = "success" | "warning" | "error" | "neutral" | "info";

interface AdminDetailStatusProps {
  label: string;
  tone?: AdminDetailStatusTone;
}

function resolveTone(value: string): AdminDetailStatusTone {
  const normalized = value.trim().toUpperCase();

  if (["SUCCESS", "YES", "VERIFIED", "GENUINE", "PUBLISHED"].includes(normalized)) {
    return "success";
  }

  if (["PENDING", "UNCERTAIN", "IN_PROGRESS"].includes(normalized)) {
    return "warning";
  }

  if (["FAILED", "REJECTED", "NO"].includes(normalized)) {
    return "error";
  }

  return "neutral";
}

export function AdminDetailStatus({
  label,
  tone = resolveTone(label),
}: AdminDetailStatusProps) {
  return (
    <span className={`admin-detail-status admin-detail-status--${tone}`}>{label}</span>
  );
}