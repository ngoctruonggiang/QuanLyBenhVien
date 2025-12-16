"use client";

import { Medicine } from "@/interfaces/medicine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { StatsSummaryBar } from "@/components/ui/stats-summary-bar";
import { InfoItem, InfoGrid } from "@/components/ui/info-item";
import { AlertBanner } from "@/components/ui/alert-banner";
import {
  Pill,
  Package,
  Calendar,
  DollarSign,
  Tag,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  ArrowLeft,
  Beaker,
  Box,
} from "lucide-react";
import { format, isBefore } from "date-fns";
import { useState } from "react";
import Link from "next/link";

interface MedicineCardProps {
  medicine: Medicine;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
  variant?: "grid" | "detail";
}

export function MedicineCard({
  medicine,
  onDelete,
  isDeleting = false,
  variant = "grid",
}: MedicineCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VND";
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch {
      return date;
    }
  };

  const isExpired = medicine.expiresAt
    ? isBefore(new Date(medicine.expiresAt), new Date())
    : false;

  const isLowStock = medicine.quantity <= 10;

  if (variant === "detail") {
    return (
      <div className="space-y-6">
        {/* Teal Gradient Header */}
        <div className="relative rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white" />
          </div>
          
          <div className="relative flex items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Back button */}
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="text-white/90 hover:text-white hover:bg-white/20 shrink-0"
              >
                <Link href="/admin/medicines">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              
              {/* Icon */}
              <div className="h-16 w-16 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Pill className="h-8 w-8 text-white" />
              </div>
              
              {/* Title & Meta */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">{medicine.name}</h1>
                </div>
                <p className="text-white/80 text-sm font-medium">ID: {medicine.id.slice(0, 8)}</p>
                <div className="flex items-center gap-2 mt-1">
                  {medicine.categoryName && (
                    <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
                      {medicine.categoryName}
                    </Badge>
                  )}
                  <Badge className="bg-white/20 text-white border-0">
                    {medicine.unit}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Link href={`/admin/medicines/${medicine.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <StatsSummaryBar
          stats={[
            {
              label: "In Stock",
              value: medicine.quantity,
              icon: <Package className="h-5 w-5" />,
              color: isLowStock ? "amber" : "emerald",
            },
            {
              label: "Selling Price",
              value: formatPrice(medicine.sellingPrice),
              icon: <DollarSign className="h-5 w-5" />,
              color: "teal",
            },
            {
              label: "Purchase Price",
              value: formatPrice(medicine.purchasePrice),
              icon: <Tag className="h-5 w-5" />,
              color: "slate",
            },
            {
              label: "Expires",
              value: formatDate(medicine.expiresAt),
              icon: <Calendar className="h-5 w-5" />,
              color: isExpired ? "rose" : "sky",
            },
          ]}
        />

        {/* Alerts */}
        {isExpired && (
          <AlertBanner
            type="error"
            title="Expired Medicine"
            description="This medicine has expired and should not be dispensed to patients."
            icon={<AlertTriangle className="h-5 w-5" />}
          />
        )}
        {isLowStock && !isExpired && (
          <AlertBanner
            type="warning"
            title="Low Stock Alert"
            description={`Only ${medicine.quantity} ${medicine.unit} remaining. Consider restocking soon.`}
            icon={<AlertTriangle className="h-5 w-5" />}
          />
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="detail-section-card">
            <div className="detail-section-card-header">
              <Package className="h-4 w-4" />
              <h3>Product Details</h3>
            </div>
            <div className="detail-section-card-content">
              <InfoGrid columns={1}>
                <InfoItem
                  icon={<Beaker className="h-4 w-4" />}
                  label="Active Ingredient"
                  value={medicine.activeIngredient}
                  color="teal"
                />
                <InfoItem
                  icon={<Tag className="h-4 w-4" />}
                  label="Category"
                  value={medicine.categoryName}
                  color="violet"
                />
                <InfoItem
                  icon={<Box className="h-4 w-4" />}
                  label="Packaging"
                  value={medicine.packaging}
                  color="amber"
                />
              </InfoGrid>
              {medicine.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">Description</p>
                  <p className="text-sm text-slate-600">{medicine.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section-card">
            <div className="detail-section-card-header">
              <DollarSign className="h-4 w-4" />
              <h3>Stock & Pricing</h3>
            </div>
            <div className="detail-section-card-content">
              <InfoGrid columns={2}>
                <InfoItem
                  icon={<Package className="h-4 w-4" />}
                  label="Quantity"
                  value={<span className={isLowStock ? "text-amber-600" : ""}>{medicine.quantity}</span>}
                  color={isLowStock ? "amber" : "emerald"}
                />
                <InfoItem
                  icon={<Tag className="h-4 w-4" />}
                  label="Unit"
                  value={medicine.unit}
                  color="slate"
                />
                <InfoItem
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Purchase Price"
                  value={formatPrice(medicine.purchasePrice)}
                  color="slate"
                />
                <InfoItem
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Selling Price"
                  value={<span className="text-teal-600 font-semibold">{formatPrice(medicine.sellingPrice)}</span>}
                  color="teal"
                />
              </InfoGrid>
              <div className="mt-4 pt-4 border-t">
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Expiry Date"
                  value={
                    <span className={isExpired ? "text-red-600 font-semibold" : ""}>
                      {formatDate(medicine.expiresAt)}
                    </span>
                  }
                  color={isExpired ? "rose" : "sky"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{medicine.name}</strong>
                ? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => onDelete?.(medicine.id)}
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

  // Grid variant
  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <Link
              href={`/admin/medicines/${medicine.id}`}
              className="flex items-center gap-3 flex-1"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{medicine.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {medicine.categoryName || "No category"}
                </p>
              </div>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/medicines/${medicine.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/medicines/${medicine.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {medicine.quantity} {medicine.unit}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {formatPrice(medicine.sellingPrice)}
            </Badge>
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Expired
              </Badge>
            )}
            {isLowStock && !isExpired && (
              <Badge
                variant="outline"
                className="text-xs border-amber-500 text-amber-600"
              >
                Low Stock
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{medicine.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => onDelete?.(medicine.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
