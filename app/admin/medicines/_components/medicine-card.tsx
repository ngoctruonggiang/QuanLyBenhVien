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
        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Pill className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">{medicine.name}</h1>
                  <p className="text-muted-foreground">
                    ID: {medicine.id.slice(0, 8)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {medicine.categoryName && (
                      <Badge variant="secondary">{medicine.categoryName}</Badge>
                    )}
                    <Badge variant="outline">{medicine.unit}</Badge>
                    {isExpired && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expired
                      </Badge>
                    )}
                    {isLowStock && !isExpired && (
                      <Badge
                        variant="outline"
                        className="border-amber-500 text-amber-600"
                      >
                        Low Stock
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={`/admin/medicines/${medicine.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                {onDelete && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Active Ingredient
                </p>
                <p className="font-medium">
                  {medicine.activeIngredient || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{medicine.description || "No description"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Packaging</p>
                <p>{medicine.packaging || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Stock & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium text-lg">{medicine.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit</p>
                  <p className="font-medium">{medicine.unit}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Purchase Price
                  </p>
                  <p className="font-medium">
                    {formatPrice(medicine.purchasePrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Selling Price</p>
                  <p className="font-medium text-primary">
                    {formatPrice(medicine.sellingPrice)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Expiry Date
                </p>
                <p className={isExpired ? "text-destructive font-medium" : ""}>
                  {formatDate(medicine.expiresAt)}
                </p>
              </div>
            </CardContent>
          </Card>
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
