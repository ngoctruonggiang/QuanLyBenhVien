"use client";

import { useRouter } from "next/navigation";
import { useCreateMedicine } from "@/hooks/queries/useMedicine";
import { MedicineForm, MedicineFormValues } from "../_components";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pill } from "lucide-react";
import Link from "next/link";

export default function NewMedicinePage() {
  const router = useRouter();
  const { mutate: createMedicine, isPending } = useCreateMedicine();

  const handleSubmit = (data: MedicineFormValues) => {
    createMedicine(
      {
        name: data.name,
        activeIngredient: data.activeIngredient || undefined,
        unit: data.unit,
        description: data.description || undefined,
        quantity: data.quantity,
        packaging: data.packaging || undefined,
        purchasePrice: data.purchasePrice,
        sellingPrice: data.sellingPrice,
        expiresAt: data.expiresAt,
        categoryId: data.categoryId || undefined,
      },
      {
        onSuccess: () => {
          router.push("/admin/medicines");
        },
      },
    );
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/medicines">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Pill className="h-6 w-6" />
            New Medicine
          </h1>
          <p className="text-muted-foreground">
            Add a new medicine to the inventory
          </p>
        </div>
      </div>

      {/* Form */}
      <MedicineForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isPending}
      />
    </div>
  );
}
