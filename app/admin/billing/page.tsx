"use client";

import { useState, useMemo } from "react";
import { ReusableTable } from "@/app/admin/_components/MyTable";
import { Input } from "@/components/ui/input";
import {
  useInvoiceList,
  usePaymentSummaryCards,
  useCancelInvoice,
} from "@/hooks/queries/useBilling";
import { getInvoiceColumns } from "./columns";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  FileText,
  AlertCircle,
  Clock,
  Wallet,
  X,
  CreditCard,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CancelInvoiceDialog } from "@/app/admin/billing/_components/cancel-invoice-dialog";
import { Invoice } from "@/interfaces/billing";
import { ListPageHeader } from "@/components/ui/list-page-header";
import { FilterPills } from "@/components/ui/filter-pills";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export default function InvoiceListPage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [sort, setSort] = useState("invoiceDate,desc");
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = useInvoiceList({
    page,
    size: limit,
    search: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : status,
    startDate: startDate?.toISOString(),
    endDate: endDate?.toISOString(),
    sort,
  });

  const { data: summary, isLoading: summaryLoading } = usePaymentSummaryCards();

  const clearFilters = () => {
    setSearch("");
    setStatus("ALL");
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(0);
  };

  const hasFilters = search || status !== "ALL" || startDate || endDate;

  const router = useRouter();
  const { mutateAsync: cancelInvoiceMutation, isPending: isCanceling } =
    useCancelInvoice();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedInvoiceToCancel, setSelectedInvoiceToCancel] =
    useState<Invoice | null>(null);

  const handleOpenCancelDialog = (invoice: Invoice) => {
    setSelectedInvoiceToCancel(invoice);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!selectedInvoiceToCancel) return;
    await cancelInvoiceMutation({
      id: selectedInvoiceToCancel.id,
      reason,
    });
    setCancelDialogOpen(false);
    setSelectedInvoiceToCancel(null);
  };

  const handleCancelClose = () => {
    setCancelDialogOpen(false);
    setSelectedInvoiceToCancel(null);
  };

  const columns = getInvoiceColumns({
    onViewDetails: (invoice) => router.push(`/admin/billing/${invoice.id}`),
    onRecordPayment: (invoice) =>
      router.push(`/admin/billing/${invoice.id}/payment`),
    onCancelInvoice: handleOpenCancelDialog,
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <ListPageHeader
        title="Billing & Invoices"
        description="Manage patient invoices and payment records"
        theme="emerald"
        icon={<Receipt className="h-6 w-6 text-white" />}
        stats={[
          { label: "Today", value: formatCurrency(summary?.todayAmount || 0) },
          { label: "This Week", value: formatCurrency(summary?.thisWeekAmount || 0) },
          { label: "Total Invoices", value: data?.totalElements || 0 },
        ]}
        secondaryActions={
          <Button asChild variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            <Link href="/admin/billing/payments">
              <CreditCard className="mr-2 h-4 w-4" />
              Payment History
            </Link>
          </Button>
        }
      />

      {/* Quick Filter Pills */}
      <FilterPills
        filters={[
          { id: "ALL", label: "All Invoices", count: data?.totalElements || 0 },
          { id: "UNPAID", label: "Unpaid", countColor: "warning" },
          { id: "PAID", label: "Paid", countColor: "success" },
          { id: "OVERDUE", label: "Overdue", countColor: "danger" },
          { id: "CANCELLED", label: "Cancelled" },
        ]}
        activeFilter={status}
        onFilterChange={(id) => {
          setStatus(id);
          setPage(0);
        }}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-sky-400/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Today&apos;s Collections
            </CardTitle>
            <div className="p-2 bg-sky-50 rounded-lg">
              <FileText className="h-4 w-4 text-sky-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {summaryLoading
                ? "..."
                : formatCurrency(summary?.todayAmount || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary?.todayCount || 0} payments
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              This Week&apos;s Collections
            </CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {summaryLoading
                ? "..."
                : formatCurrency(summary?.thisWeekAmount || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary?.thisWeekCount || 0} payments
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-400/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Cash Payments</CardTitle>
            <div className="p-2 bg-rose-50 rounded-lg">
              <Wallet className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {summaryLoading
                ? "..."
                : formatCurrency(summary?.cashAmount || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary?.cashPercentage?.toFixed(1) || 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Card Payments</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CreditCard className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {summaryLoading
                ? "..."
                : formatCurrency(summary?.cardAmount || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary?.cardPercentage?.toFixed(1) || 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search by patient name or invoice ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="UNPAID">Unpaid</SelectItem>
            <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="invoiceDate,desc">Date (newest)</SelectItem>
            <SelectItem value="invoiceDate,asc">Date (oldest)</SelectItem>
            <SelectItem value="totalAmount,desc">
              Total Amount (high to low)
            </SelectItem>
            <SelectItem value="status,asc">Status (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {/* Start Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "MMM d, yyyy") : "Start Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* End Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[150px] justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "MMM d, yyyy") : "End Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <Card className="border-2 border-slate-200 shadow-md rounded-xl overflow-hidden">
        <ReusableTable
          data={data?.content ?? []}
          columns={columns}
          loading={isLoading}
          pagination={{
            currentPage: (data?.page ?? 0) + 1,
            totalPages: data?.totalPages ?? 1,
            rowsPerPage: limit,
            totalItems: data?.totalElements ?? 0,
          }}
          onPageChange={setPage}
          onRowsPerPageChange={(size) => {
            setLimit(size);
            setPage(0);
          }}
          onRowClick={(invoice) => router.push(`/admin/billing/${invoice.id}`)}
          hidePagination
        />
      </Card>

      {/* Pagination - in separate Card like patient page */}
      {(data?.content?.length ?? 0) > 0 && (
        <Card className="border-2 border-slate-200 shadow-sm rounded-xl">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(data?.page ?? 0) * limit + 1}</span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(((data?.page ?? 0) + 1) * limit, data?.totalElements ?? 0)}
              </span>{" "}
              of <span className="font-medium">{data?.totalElements ?? 0}</span> invoices
            </p>
            <DataTablePagination
              currentPage={data?.page ?? 0}
              totalPages={data?.totalPages ?? 1}
              totalElements={data?.totalElements ?? 0}
              pageSize={limit}
              onPageChange={setPage}
              showRowsPerPage={true}
              rowsPerPageOptions={[10, 20, 50]}
              rowsPerPage={limit}
              onRowsPerPageChange={(size) => {
                setLimit(size);
                setPage(0);
              }}
            />
          </CardContent>
        </Card>
      )}

      <CancelInvoiceDialog
        open={cancelDialogOpen}
        onOpenChange={handleCancelClose}
        invoiceNumber={selectedInvoiceToCancel?.invoiceNumber ?? ""}
        onConfirm={handleCancelConfirm}
        isLoading={isCanceling}
      />
    </div>
  );
}
