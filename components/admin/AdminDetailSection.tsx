import React from "react";

interface AdminDetailSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AdminDetailSection({ title, description, children }: AdminDetailSectionProps) {
  return (
    <section className="admin-detail-section">
      <div className="admin-detail-section__header">
        <h3 className="admin-detail-section__title">{title}</h3>
        {description ? (
          <p className="admin-detail-section__description">{description}</p>
        ) : null}
      </div>
      <div className="admin-detail-section__content">{children}</div>
    </section>
  );
}