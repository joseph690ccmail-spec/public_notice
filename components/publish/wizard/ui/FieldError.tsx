import React from "react";

export function FieldError({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  if (!message) return null;
  return (
    <p className={["mt-1 text-xs text-[var(--color-error)]", className].filter(Boolean).join(" ")}>
      {message}
    </p>
  );
}