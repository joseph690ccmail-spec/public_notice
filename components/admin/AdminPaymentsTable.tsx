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
import { AdminDetailStatus } from "@/components/admin/AdminDetailStatus";
import { AdminPaymentDetails } from "@/components/admin/AdminPaymentDetails";
import { AdminTableToolbar } from "@/components/admin/AdminTableToolbar";
import { getAdminPayment, listAdminPayments } from "@/lib/api/admin-client";
import { PublishApiError } from "@/lib/api/client";
import type { AdminPaymentDetail } from "@/lib/admin/payments-dto";

const headers = [
  { key: "reference", header: "Reference" },
  { key: "amount", header: "Amount" },
  { key: "status", header: "Status" },
  { key: "draftEmail", header: "Draft email" },
  { key: "createdAt", header: "Created" },
  { key: "actions", header: "" },
] as const;

const statusFilterOptions = [
  { id: "all", label: "All statuses" },
  { id: "PENDING", label: "Pending" },
  { id: "SUCCESS", label: "Success" },
  { id: "FAILED", label: "Failed" },
] as const;

function formatStatus(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatAmount(kobo: number, currency: string): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(kobo / 100);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminPaymentsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "PENDING" | "SUCCESS" | "FAILED">(
    "all"
  );
  const [items, setItems] = useState<
    Array<{
      id: string;
      reference: string;
      amount: string;
      status: string;
      draftEmail: string;
      createdAt: string;
      actions: string;
    }>
  >([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentDetail | null>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await listAdminPayments({
        page,
        limit: pageSize,
        search: activeSearch || undefined,
        status: statusFilter,
      });
      setTotalItems(result.pagination.total);
      setItems(
        result.items.map((payment) => ({
          id: payment.reference,
          reference: payment.reference,
          amount: formatAmount(payment.amountKobo, payment.currency),
          status: formatStatus(payment.status),
          draftEmail: payment.draftEmail,
          createdAt: formatDateTime(payment.createdAt),
          actions: payment.reference,
        }))
      );
    } catch (err) {
      setError(
        err instanceof PublishApiError
          ? err.message
          : "Could not load payments. Please try again."
      );
      setItems([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [activeSearch, page, pageSize, statusFilter]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const applyFilters = useCallback(() => {
    setPage(1);
    setActiveSearch(searchInput.trim());
  }, [searchInput]);

  const openDetails = useCallback(async (reference: string) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setSelectedPayment(null);

    try {
      const payment = await getAdminPayment(reference);
      setSelectedPayment(payment);
    } catch (err) {
      setDetailError(
        err instanceof PublishApiError ? err.message : "Could not load payment details."
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetails = useCallback(() => {
    setDetailOpen(false);
    setSelectedPayment(null);
    setDetailError(null);
  }, []);

  const tableDescription = useMemo(() => {
    if (error) return error;
    const filterParts = [];
    if (activeSearch) filterParts.push(`matching "${activeSearch}"`);
    if (statusFilter !== "all") filterParts.push(formatStatus(statusFilter));
    const suffix = filterParts.length > 0 ? ` (${filterParts.join(", ")})` : "";
    return `${totalItems} payment record${totalItems === 1 ? "" : "s"}${suffix}.`;
  }, [activeSearch, error, statusFilter, totalItems]);

  return (
    <>
      <AdminTableToolbar
        searchLabel="Search payments"
        searchPlaceholder="Search by reference or email…"
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={applyFilters}
        searchLoading={loading}
        filterLabel="Status"
        filterOptions={[...statusFilterOptions]}
        filterValue={statusFilter}
        onFilterChange={(value) => {
          setStatusFilter(value as "all" | "PENDING" | "SUCCESS" | "FAILED");
          setPage(1);
        }}
      />

      <div className="admin-data-table-wrap">
        {loading ? (
          <div className="admin-data-table__loading-overlay" aria-hidden>
            <AppInlineSpinner description="Loading payments…" />
          </div>
        ) : null}

        <DataTable rows={items} headers={[...headers]}>
          {({ rows, headers: tableHeaders, getTableProps, getHeaderProps, getRowProps }) => (
            <TableContainer
              title="Payments"
              description={loading ? "Loading payments…" : tableDescription}
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
                          {error ?? "No payment records found."}
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

                          if (cell.info.header === "status") {
                            return (
                              <TableCell key={cell.id}>
                                <AdminDetailStatus label={cell.value} />
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
        title={selectedPayment?.reference ?? "Payment details"}
        subtitle={selectedPayment?.status}
        loading={detailLoading}
        onClose={closeDetails}
      >
        {detailError ? (
          <p className="text-sm text-[var(--color-error)]" role="alert">
            {detailError}
          </p>
        ) : selectedPayment ? (
          <AdminPaymentDetails payment={selectedPayment} />
        ) : null}
      </AdminDetailOffcanvas>
    </>
  );
}