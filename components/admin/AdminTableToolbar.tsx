"use client";

import React from "react";
import { Button, Dropdown, Search } from "@carbon/react";
import { ButtonLabel } from "@/components/publish/wizard/ui/ButtonLabel";

export interface AdminFilterOption {
  id: string;
  label: string;
}

interface AdminTableToolbarProps {
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  searchLoading?: boolean;
  filterLabel: string;
  filterOptions: AdminFilterOption[];
  filterValue: string;
  onFilterChange: (value: string) => void;
  secondaryFilterLabel?: string;
  secondaryFilterOptions?: AdminFilterOption[];
  secondaryFilterValue?: string;
  onSecondaryFilterChange?: (value: string) => void;
}

export function AdminTableToolbar({
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchLoading = false,
  filterLabel,
  filterOptions,
  filterValue,
  onFilterChange,
  secondaryFilterLabel,
  secondaryFilterOptions,
  secondaryFilterValue,
  onSecondaryFilterChange,
}: AdminTableToolbarProps) {
  const selectedFilter =
    filterOptions.find((option) => option.id === filterValue) ?? filterOptions[0];
  const selectedSecondaryFilter =
    secondaryFilterOptions?.find((option) => option.id === secondaryFilterValue) ??
    secondaryFilterOptions?.[0];

  return (
    <div className="admin-table-toolbar border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <Search
            closeButtonLabelText="Clear search"
            id={`${searchLabel.replace(/\s+/g, "-").toLowerCase()}-search`}
            labelText={searchLabel}
            placeholder={searchPlaceholder}
            size="md"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !searchLoading) {
                onSearchSubmit();
              }
            }}
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="admin-table-toolbar__filter min-w-[12rem]">
            <Dropdown
              id={`${filterLabel.replace(/\s+/g, "-").toLowerCase()}-filter`}
              titleText={filterLabel}
              label={selectedFilter?.label ?? "All"}
              items={filterOptions}
              itemToString={(item) => (item ? item.label : "")}
              selectedItem={selectedFilter}
              onChange={({ selectedItem }) => {
                if (selectedItem) onFilterChange(selectedItem.id);
              }}
            />
          </div>

          {secondaryFilterOptions && secondaryFilterLabel && onSecondaryFilterChange ? (
            <div className="admin-table-toolbar__filter min-w-[12rem]">
              <Dropdown
                id={`${secondaryFilterLabel.replace(/\s+/g, "-").toLowerCase()}-filter`}
                titleText={secondaryFilterLabel}
                label={selectedSecondaryFilter?.label ?? "All"}
                items={secondaryFilterOptions}
                itemToString={(item) => (item ? item.label : "")}
                selectedItem={selectedSecondaryFilter}
                onChange={({ selectedItem }) => {
                  if (selectedItem) onSecondaryFilterChange(selectedItem.id);
                }}
              />
            </div>
          ) : null}

          <Button
            kind="primary"
            size="md"
            className="home-search__btn admin-table-toolbar__search-btn"
            disabled={searchLoading}
            onClick={onSearchSubmit}
          >
            <ButtonLabel loading={searchLoading}>Apply</ButtonLabel>
          </Button>
        </div>
      </div>
    </div>
  );
}