import React from "react";

interface AdminDetailFieldProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  fullWidth?: boolean;
}

export function AdminDetailField({
  label,
  value,
  mono = false,
  fullWidth = false,
}: AdminDetailFieldProps) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div
      className={[
        "admin-detail-field",
        mono ? "admin-detail-field--mono" : "",
        fullWidth ? "admin-detail-field--full" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <dt className="admin-detail-field__label">{label}</dt>
      <dd className="admin-detail-field__value">{value}</dd>
    </div>
  );
}