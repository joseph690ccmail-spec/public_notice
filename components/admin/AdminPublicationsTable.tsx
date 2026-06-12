"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  DataTable,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@carbon/react";
import { AppInlineSpinner } from "@/components/admin/AppInlineSpinner";
import { AdminDetailOffcanvas } from "@/components/admin/AdminDetailOffcanvas";
import { AdminPublicationDetails } from "@/components/admin/AdminPublicationDetails";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { getAdminPublication, listAdminPublications } from "@/lib/api/admin-client";
import { PublishApiError } from "@/lib/api/client";
import type { AdminNoticeDetail } from "@/lib/admin/notices-dto";
import { formatNoticeDate } from "@/lib/notices";

const headers = [
  { key: "pnn", header: "PNN" },
  { key: "formerName", header: "Former name" },
  { key: "newName", header: "New name" },
  { key: "email", header: "Email" },
  { key: "publishedAt", header: "Published" },
  { key: "verified", header: "Verified" },
  { key: "actions", header: "" },
] as const;

const verifiedFilterOptions = [
  { id: "all", label: "All statuses" },
  { id: "yes", label: "Verified" },
  { id: "no", label: "Unverified" },
] as const;

export function AdminPublicationsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "yes" | "no">("all");
  const [items, setItems] = useState<
    Array<{
      id: string;
      pnn: string;
      formerName: string;
      newName: string;
      email: string;
      publishedAt: string;
      verified: string;
      actions: string;
    }>
  >([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<AdminNoticeDetail | null>(null);

  const loadPublications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listAdminPublications({
        page,
        limit: pageSize,
        search: activeSearch || undefined,
        verified: verifiedFilter,
      });
      setTotalItems(result.pagination.total);
      setItems(
        result.items.map((notice) => ({
          id: notice.pnn,
          pnn: notice.pnn,
          formerName: notice.formerName,
          newName: notice.newName,
          email: notice.email,
          publishedAt: formatNoticeDate(notice.publishedAt),
          verified: notice.verified ? "Yes" : "No",
          actions: notice.pnn,
        }))
      );
    } catch (err) {
      setError(
        err instanceof PublishApiError
          ? err.message
          : "Could not load publications. Please try again."
      );
      setItems([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [activeSearch, page, pageSize, verifiedFilter]);

  useEffect(() => {
    void loadPublications();
  }, [loadPublications]);

  const applyFilters = useCallback(() => {
    setPage(1);
    setActiveSearch(searchInput.trim());
  }, [searchInput]);

  const openDetails = useCallback(async (pnn: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setSelectedNotice(null);

    try {
      const notice = await getAdminPublication(pnn);
      setSelectedNotice(notice);
    } catch (err) {
      setDetailError(
        err instanceof PublishApiError
          ? err.message
          : "Could not load publication details."
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetails = useCallback(() => {
    setDetailOpen(false);
    setSelectedNotice(null);
    setDetailError(null);
  }, []);

  const tableDescription = useMemo(() => {
    if (error) return error;
    const filterParts = [];
    if (activeSearch) filterParts.push(`matching "${activeSearch}"`);
    if (verifiedFilter !== "all") {
      filterParts.push(verifiedFilter === "yes" ? "verified only" : "unverified only");
    }
    const suffix = filterParts.length > 0 ? ` (${filterParts.join(", ")})` : "";
    return `${totalItems} publication${totalItems === 1 ? "" : "s"}${suffix}.`;
  }, [activeSearch, error, totalItems, verifiedFilter]);

  return (
    <>
      <AdminTableToolbar
        searchLabel="Search publications"
        searchPlaceholder="Search by PNN, name, or email…"
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={applyFilters}
        searchLoading={loading}
        filterLabel="Verification"
        filterOptions={[...verifiedFilterOptions]}
        filterValue={verifiedFilter}
        onFilterChange={(value) => {
          setVerifiedFilter(value as "all" | "yes" | "no");
          setPage(1);
        }}
      />

      <div className="admin-data-table-wrap">
        {loading ? (
          <div className="admin-data-table__loading-overlay" aria-hidden>
            <AppInlineSpinner description="Loading publications…" />
          </div>
        ) : null}

        <DataTable rows={items} headers={[...headers]}>
          {({ rows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer
              title="Publications"
              description={loading ? "Loading publications…" : tableDescription}
              className="admin-data-table"
            >
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
                    {tableHeaders.map((header) => (
                      <TableHeader {...getHeaderProps({ header })} key={header.key}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={headers.length}>
                        <p className="py-4 text-sm text-[var(--color-ink-muted)]">
                          {error ?? "No publications found."}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow {...getRowProps({ row })} key={row.id}>
                        {row.cells.map((cell) => {
                          if (cell.info.header === "actions") {
                            return (
                              <TableCell key={cell.id}>
                                <Button
                                  kind="ghost"
                                  size="sm"
                                  className="admin-data-table__view-btn"
                                  onClick={() => void openDetails(cell.value)}
                                >
                                  View more
                                </Button>
                              </TableCell>
                            );
                          }

                          return <TableCell key={cell.id}>{cell.value}</TableCell>;
                        })}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
      </div>

      {!loading && totalItems > 0 && (
        <div className="admin-data-table__pagination">
          <Pagination
            page={page}
            pageSize={pageSize}
            pageSizes={[10, 20, 50]}
            totalItems={totalItems}
            onChange={({ page: nextPage, pageSize: nextPageSize }) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            }}
            size="md"
          />
        </div>
      )}

      <AdminDetailOffcanvas
        open={detailOpen}
        title={selectedNotice?.pnn ?? "Publication details"}
        subtitle={
          selectedNotice
            ? `${selectedNotice.formerName} → ${selectedNotice.newName}`
            : undefined
        }
        loading={detailLoading}
        onClose={closeDetails}
      >
        {detailError ? (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {detailError}
          </p>
        ) : selectedNotice ? (
          <AdminPublicationDetails notice={selectedNotice} />
        ) : null}
      </AdminDetailOffcanvas>
    </>
  );
}