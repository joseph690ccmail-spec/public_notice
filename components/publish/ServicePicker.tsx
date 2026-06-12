"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight } from "@carbon/icons-react";
import { Search, Tag, Tile } from "@carbon/react";
import { NavClickableTile } from "@/components/site/NavClickableTile";
import { useAppNavigation } from "@/components/site/AppNavigationProvider";
import { filterPublishServices, type PublishService } from "@/lib/services";

interface ServicePickerProps {
  onSelect?: () => void;
}

function ServiceCard({
  service,
  onSelect,
}: {
  service: PublishService;
  onSelect: (service: PublishService) => void;
}) {
  const isAvailable = service.available && service.href;

  const content = (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="text-base font-medium tracking-tight text-[var(--color-ink)]">
            {service.name}
          </h3>
          {!service.available && (
            <Tag type="cool-gray" size="sm">
              Coming soon
            </Tag>
          )}
        </div>
        <p className="text-sm leading-relaxed text-[var(--color-ink-muted)] tracking-[0.16px]">
          {service.description}
        </p>
      </div>
      {isAvailable && (
        <ArrowRight
          size={20}
          className="mt-1 shrink-0 text-[var(--color-primary)]"
          aria-hidden
        />
      )}
    </div>
  );

  if (isAvailable && service.href) {
    return (
      <NavClickableTile
        href={service.href}
        className="service-picker-card h-full text-left"
        title={service.name}
        onClick={(event) => {
          event.preventDefault();
          onSelect(service);
        }}
      >
        {content}
      </NavClickableTile>
    );
  }

  return <Tile className="service-picker-card service-picker-card--disabled h-full text-left">{content}</Tile>;
}

export function ServicePicker({ onSelect }: ServicePickerProps) {
  const { navigate } = useAppNavigation();
  const [query, setQuery] = useState("");

  const services = useMemo(() => filterPublishServices(query), [query]);

  const handleSelect = (service: PublishService) => {
    if (!service.href) return;
    onSelect?.();
    navigate(service.href);
  };

  return (
    <div className="space-y-4">
      <div className="service-picker__search w-full border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-4">
        <Search
          closeButtonLabelText="Clear search input"
          id="search-services"
          labelText="Search services"
          placeholder="e.g. change of name, marriage, documents…"
          size="md"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="service-picker__list border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16px] text-[var(--color-ink-muted)]">
          Available services
        </p>

        {services.length === 0 ? (
          <p className="py-4 text-sm text-[var(--color-ink-muted)] tracking-[0.16px]">
            No services match your search.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {services.map((service) => (
              <li key={service.id}>
                <ServiceCard service={service} onSelect={handleSelect} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}