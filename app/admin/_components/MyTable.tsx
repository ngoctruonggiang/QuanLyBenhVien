/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

export type Column<T> = {
  key: keyof T | string;
  label: React.ReactNode;
  render?: (row: T) => React.ReactNode;
};

type PaginationInfo = {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalItems: number;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];

  // Pagination từ server
  pagination: PaginationInfo;

  // React Query triggers
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (size: number) => void;

  // Loading từ React Query
  loading?: boolean;
};

// Skeleton row component
const TableRowSkeleton = ({ columnsLength }: { columnsLength: number }) => (
  <TableRow>
    {Array.from({ length: columnsLength }).map((_, i) => (
      <TableCell key={i}>
        <Skeleton className="h-6 w-full" />
      </TableCell>
    ))}
  </TableRow>
);

function getPaginationNumbers(current: number, total: number) {
  const pages: (number | string)[] = [];

  // Trang 1
  pages.push(1);

  // "..." trước khi tới currentPage-1
  if (current > 3) {
    pages.push("...");
  }

  // current-1
  if (current > 2) {
    pages.push(current - 1);
  }

  // current
  if (current !== 1 && current !== total) {
    pages.push(current);
  }

  // current+1
  if (current < total - 1) {
    pages.push(current + 1);
  }

  // "..." sau current+1
  if (current < total - 2) {
    pages.push("...");
  }

  // Trang cuối
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}

export function ReusableTable<T>({
  data,
  columns,
  pagination,
  onPageChange,
  onRowsPerPageChange,
  loading = false,
}: Props<T>) {
  const { currentPage, totalPages, rowsPerPage } = pagination;

  return (
    <div className="flex flex-col justify-between min-h-[500px] gap-5">
      <div className="border-app-azure-100 rounded-[10px] border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, idx) => (
                <TableHead key={idx}>{col.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Loading skeleton */}
            {loading ? (
              Array.from({ length: rowsPerPage }).map((_, i) => (
                <TableRowSkeleton key={i} columnsLength={columns.length} />
              ))
            ) : data.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-6"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              // Data rows
              data.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((col, idx) => (
                    <TableCell key={idx}>
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination UI giữ nguyên */}
      <div className="flex items-center justify-between ">
        {/* Rows per page */}
        <div className="flex items-center space-x-2 text-sm">
          <span>Rows per page</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(v) => onRowsPerPageChange(+v)}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Pagination */}
        <div className="flex items-center space-x-2">
          <Button
            size="icon"
            className="border-app-primary-blue-500 border"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex space-x-1">
            {getPaginationNumbers(currentPage, totalPages).map((p, idx) =>
              p === "..." ? (
                <span
                  key={idx}
                  className="flex items-center px-2 text-gray-500"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={idx}
                  size="icon"
                  variant={p === currentPage ? "default" : "outline"}
                  className={
                    p === currentPage
                      ? "border-app-primary-blue-500 border bg-white text-app-primary-blue-700"
                      : " border"
                  }
                  onClick={() => onPageChange(p as number)}
                >
                  {p}
                </Button>
              ),
            )}
          </div>

          <Button
            size="icon"
            className="border-app-primary-blue-500 border"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReusableTable;
