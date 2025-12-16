"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Plus,
  Pill,
  LayoutGrid,
  List,
  X,
  AlertTriangle,
  Package,
} from "lucide-react";
import { useMedicines, useDeleteMedicine } from "@/hooks/queries/useMedicine";
import { useCategories } from "@/hooks/queries/useCategory";
import { useDebounce } from "@/hooks/useDebounce";
import { MedicineCard } from "./medicine-card";
import { Medicine, MedicineListParams } from "@/interfaces/medicine";
import { format, isBefore } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableRowActions } from "@/components/ui/data-table-row-actions";
import { ListPageHeader } from "@/components/ui/list-page-header";
import { FilterPills } from "@/components/ui/filter-pills";
import { ListEmptyState } from "@/components/ui/list-empty-state";
import { ProgressCell } from "@/components/ui/progress-cell";

export function MedicineListPage() {
  const router = useRouter();
  const [view, setView] = useState<"table" | "grid">("table");
  const [params, setParams] = useState<MedicineListParams>({
    page: 1,
    size: 10,
    search: "",
    categoryId: undefined,
  });
  const [searchInput, setSearchInput] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<string>("all");

  const debouncedSearch = useDebounce(searchInput, 300);

  const { data, isLoading } = useMedicines({
    ...params,
    search: debouncedSearch,
  });
  const { data: categoriesData } = useCategories(); // Fetch list of categories
  const categories = categoriesData?.data?.content || [];
  const { mutate: deleteMedicine, isPending: isDeleting } = useDeleteMedicine();

  const medicines = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  const handleCategoryChange = useCallback((value: string) => {
    setParams((prev) => ({
      ...prev,
      categoryId: value === "all" ? undefined : value,
      page: 1,
    }));
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      deleteMedicine(id, {
        onSuccess: () => setDeleteId(null),
      });
    },
    [deleteMedicine]
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setParams({ page: 1, size: 10, search: "", categoryId: undefined });
  }, []);

  const hasActiveFilters = searchInput || params.categoryId;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch {
      return date;
    }
  };

  const isExpired = (date: string) => {
    return isBefore(new Date(date), new Date());
  };

  // Calculate stats
  const lowStockCount = useMemo(() => medicines.filter(m => m.quantity <= 10).length, [medicines]);
  const expiredCount = useMemo(() => medicines.filter(m => isExpired(m.expiresAt)).length, [medicines]);

  // Apply quick filter
  const filteredMedicines = useMemo(() => {
    if (quickFilter === "all") return medicines;
    if (quickFilter === "low-stock") return medicines.filter(m => m.quantity <= 10);
    if (quickFilter === "expired") return medicines.filter(m => isExpired(m.expiresAt));
    return medicines;
  }, [medicines, quickFilter]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <ListPageHeader
        title="Medicines"
        description="Manage medicine inventory and stock"
        theme="teal"
        icon={<Pill className="h-6 w-6 text-white" />}
        stats={[
          { label: "Total", value: totalElements },
          { label: "Low Stock", value: lowStockCount, trendValue: lowStockCount > 0 ? "Need attention" : undefined, trend: lowStockCount > 0 ? "down" : "neutral" },
          { label: "Expired", value: expiredCount, trendValue: expiredCount > 0 ? "Remove from stock" : undefined, trend: expiredCount > 0 ? "down" : "neutral" },
        ]}
        primaryAction={{
          label: "Add Medicine",
          href: "/admin/medicines/new",
          icon: <Package className="h-4 w-4 mr-2" />,
        }}
      />

      {/* Quick Filter Pills */}
      <FilterPills
        filters={[
          { id: "all", label: "All", count: totalElements },
          { id: "low-stock", label: "Low Stock", count: lowStockCount, countColor: lowStockCount > 0 ? "warning" : "default" },
          { id: "expired", label: "Expired", count: expiredCount, countColor: expiredCount > 0 ? "danger" : "default" },
        ]}
        activeFilter={quickFilter}
        onFilterChange={setQuickFilter}
      />

      {/* Filters Row - not inside Card */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search medicines..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-10"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={() => setSearchInput("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Select
          value={params.categoryId || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="h-10 w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10 px-3 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}

        <div className="flex border rounded-lg">
          <Button
            variant={view === "table" ? "secondary" : "ghost"}
            size="icon"
            className="h-10 w-10 rounded-r-none"
            onClick={() => setView("table")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-10 w-10 rounded-l-none"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-2 border-slate-200 shadow-md rounded-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" className="text-muted-foreground" />
            </div>
          ) : filteredMedicines.length === 0 ? (
            <ListEmptyState
              type="medicines"
              isSearchResult={!!hasActiveFilters || quickFilter !== "all"}
              searchQuery={searchInput}
              action={
                !hasActiveFilters && quickFilter === "all"
                  ? { label: "Add Medicine", href: "/admin/medicines/new" }
                  : undefined
              }
            />
          ) : view === "table" ? (
            <div className="overflow-hidden rounded-b-xl border-t">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Selling Price</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine) => (
                    <TableRow
                      key={medicine.id}
                      accent="teal"
                      className="cursor-pointer"
                      onClick={() => router.push(`/admin/medicines/${medicine.id}`)}
                    >
                      <TableCell>
                        <Link
                          href={`/admin/medicines/${medicine.id}`}
                          className="font-medium hover:underline"
                        >
                          {medicine.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {medicine.categoryName || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-start">
                            <span className={cn(
                              "font-medium tabular-nums",
                              medicine.quantity <= 10 && "text-rose-600",
                              medicine.quantity > 10 && medicine.quantity <= 30 && "text-amber-600"
                            )}>
                              {medicine.quantity}
                            </span>
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  medicine.quantity <= 10 && "bg-rose-500",
                                  medicine.quantity > 10 && medicine.quantity <= 30 && "bg-amber-500",
                                  medicine.quantity > 30 && "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min((medicine.quantity / 200) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {medicine.unit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(medicine.sellingPrice)} ₫
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            isExpired(medicine.expiresAt)
                              ? "text-destructive"
                              : ""
                          }
                        >
                          {formatDate(medicine.expiresAt)}
                        </span>
                        {isExpired(medicine.expiresAt) && (
                          <AlertTriangle className="h-3 w-3 inline ml-1 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DataTableRowActions
                          rowId={medicine.id}
                          actions={[
                            {
                              label: "View details",
                              href: `/admin/medicines/${medicine.id}`,
                            },
                            {
                              label: "Edit",
                              href: `/admin/medicines/${medicine.id}/edit`,
                            },
                            {
                              label: "Delete",
                              onClick: () => setDeleteId(medicine.id),
                              destructive: true,
                              separator: true,
                            },
                          ]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMedicines.map((medicine) => (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                  onDelete={() => setDeleteId(medicine.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {medicines.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <DataTablePagination
              currentPage={(params.page || 1) - 1} // Convert from 1-indexed to 0-indexed
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={params.size || 10}
              onPageChange={(page) =>
                setParams((prev) => ({ ...prev, page: page + 1 }))
              }
              showRowsPerPage={true}
              rowsPerPageOptions={[10, 20, 30, 50]}
              rowsPerPage={params.size || 10}
              onRowsPerPageChange={(newSize) =>
                setParams((prev) => ({
                  ...prev,
                  size: newSize,
                  page: 1,
                }))
              }
            />
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this medicine? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
