"use client";

import { useParams, useRouter } from "next/navigation";
import { useMedicine, useUpdateMedicine } from "@/hooks/queries/useMedicine";
import { MedicineForm, MedicineFormValues } from "../../_components";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Edit, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EditMedicinePage() {
  const params = useParams();
  const router = useRouter();
  const medicineId = params.id as string;

  const { data: medicine, isLoading, error } = useMedicine(medicineId);
  const { mutate: updateMedicine, isPending } = useUpdateMedicine(medicineId);

  const handleSubmit = (data: MedicineFormValues) => {
    updateMedicine(
      {
        name: data.name,
        activeIngredient: data.activeIngredient || null,
        unit: data.unit,
        description: data.description || null,
        quantity: data.quantity,
        packaging: data.packaging || null,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        expiresAt: data.expiresAt,
        categoryId: data.categoryId || null,
      },
      {
        onSuccess: () => {
          router.push(`/admin/medicines/${medicineId}`);
        },
      },
    );
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/medicines">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Edit Medicine</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium">Medicine not found</h3>
          <p className="text-muted-foreground mb-4">
            The medicine you are trying to edit does not exist or has been
            deleted.
          </p>
          <Button asChild>
            <Link href="/admin/medicines">Back to Medicines</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/medicines/${medicineId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Edit className="h-6 w-6" />
            Edit Medicine
          </h1>
          <p className="text-muted-foreground">
            Update information for {medicine.name}
          </p>
        </div>
      </div>

      {/* Form */}
      <MedicineForm
        initialData={medicine}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isPending}
      />
    </div>
  );
}
