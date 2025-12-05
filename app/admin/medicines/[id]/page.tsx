"use client";

import { useParams, useRouter } from "next/navigation";
import { useMedicine, useDeleteMedicine } from "@/hooks/queries/useMedicine";
import { MedicineCard } from "../_components";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function MedicineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const medicineId = params.id as string;

  const { data: medicine, isLoading, error } = useMedicine(medicineId);
  const { mutate: deleteMedicine, isPending: isDeleting } = useDeleteMedicine();

  const handleDelete = (id: string) => {
    deleteMedicine(id, {
      onSuccess: () => {
        router.push("/admin/medicines");
      },
    });
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
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
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
          <h1 className="text-2xl font-semibold">Medicine Details</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium">Medicine not found</h3>
          <p className="text-muted-foreground mb-4">
            The medicine you are looking for does not exist or has been deleted.
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
      {/* Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/medicines">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Medicine Details</h1>
      </div>

      {/* Medicine Card (Detail Variant) */}
      <MedicineCard
        medicine={medicine}
        variant="detail"
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
