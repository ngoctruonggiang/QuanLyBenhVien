"use client";

import { useState } from "react";
import { ReusableTable, Column } from "@/app/admin/_components/MyTable";
import { Input } from "@/components/ui/input";
import { usePayments } from "@/hooks/queries/useBilling";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Payment, PaymentMethod } from "@/interfaces/billing";

interface PaymentWithInvoice extends Payment {
  invoiceNumber: string;
  patientName: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const methodConfig: Record<PaymentMethod, { label: string; className: string }> = {
  CASH: {
    label: "Cash",
    className: "bg-green-100 text-green-800",
  },
  CARD: {
    label: "Card",
    className: "bg-blue-100 text-blue-800",
  },
  BANK_TRANSFER: {
    label: "Bank Transfer",
    className: "bg-purple-100 text-purple-800",
  },
  INSURANCE: {
    label: "Insurance",
    className: "bg-cyan-100 text-cyan-800",
  },
  OTHER: {
    label: "Other",
    className: "bg-gray-100 text-gray-800",
  },
};

const paymentColumns: Column<PaymentWithInvoice>[] = [
  {
    key: "id",
    label: "Payment ID",
  },
  {
    key: "invoiceNumber",
    label: "Invoice #",
    render: (row) => (
      <Link
        href={`/admin/billing/${row.invoiceId}`}
        className="text-primary hover:underline"
      >
        {row.invoiceNumber}
      </Link>
    ),
  },
  {
    key: "patientName",
    label: "Patient",
  },
  {
    key: "amount",
    label: "Amount",
    render: (row) => (
      <span className="font-medium">{formatCurrency(row.amount)}</span>
    ),
  },
  {
    key: "method",
    label: "Method",
    render: (row) => {
      const config = methodConfig[row.method];
      return (
        <Badge variant="outline" className={cn("border-0", config.className)}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    key: "paymentDate",
    label: "Date",
    render: (row) => new Date(row.paymentDate).toLocaleString(),
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <Badge
        variant={row.status === "COMPLETED" ? "default" : "outline"}
        className={
          row.status === "COMPLETED" ? "bg-green-100 text-green-800" : ""
        }
      >
        {row.status}
      </Badge>
    ),
  },
  {
    key: "notes",
    label: "Notes",
    render: (row) => (
      <span className="text-muted-foreground text-sm truncate max-w-[200px] block">
        {row.notes || "-"}
      </span>
    ),
  },
];

export default function PaymentHistoryPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("ALL");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = usePayments(
    page,
    limit,
    debouncedSearch,
    method,
    startDate?.toISOString(),
    endDate?.toISOString()
  );

  const clearFilters = () => {
    setSearch("");
    setMethod("ALL");
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const hasFilters = search || method !== "ALL" || startDate || endDate;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/billing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">
            View all recorded payments across invoices
          </p>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search by invoice # or patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Methods</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="CARD">Card</SelectItem>
            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
            <SelectItem value="INSURANCE">Insurance</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
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

      <ReusableTable
        data={(data?.data as PaymentWithInvoice[]) ?? []}
        columns={paymentColumns}
        loading={isLoading}
        pagination={{
          currentPage: data?.page ?? 1,
          totalPages: Math.ceil((data?.total ?? 0) / limit),
          rowsPerPage: limit,
          totalItems: data?.total ?? 0,
        }}
        onPageChange={setPage}
        onRowsPerPageChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
      />
    </div>
  );
}
