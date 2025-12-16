"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import MyDatePicker from "@/app/admin/_components/MyDatePicker";
import { Medicine } from "@/interfaces/medicine";
import { medicineFormSchema, MedicineFormValues } from "@/lib/schemas/medicine";
import { useCategories } from "@/hooks/queries/useCategory";
import { Spinner } from "@/components/ui/spinner";
import { Package2, DollarSign } from "lucide-react";

export { medicineFormSchema, type MedicineFormValues };

interface MedicineFormProps {
  initialData?: Medicine | null;
  onSubmit: (data: MedicineFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean; // Add isSubmitting prop
}

const unitOptions = [
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
  { value: "bottle", label: "Bottle" },
  { value: "tube", label: "Tube" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
  { value: "vial", label: "Vial" },
  { value: "ampule", label: "Ampule" },
];

export function MedicineForm({
  initialData,
  onSubmit,
  isSubmitting,
  onCancel,
  isLoading,
}: MedicineFormProps) {
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data?.content || [];
  const form = useForm<MedicineFormValues>({
    resolver: zodResolver(medicineFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      activeIngredient: initialData?.activeIngredient ?? "",
      unit: initialData?.unit ?? "",
      description: initialData?.description ?? "",
      quantity: String(initialData?.quantity ?? 0),
      packaging: initialData?.packaging ?? "",
      purchasePrice: String(initialData?.purchasePrice ?? 0),
      sellingPrice: String(initialData?.sellingPrice ?? 0),
      expiresAt: initialData?.expiresAt ?? "",
      categoryId: initialData?.categoryId ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="form-section-card">
          <div className="form-section-card-title">
            <Package2 className="h-5 w-5 text-teal-500" />
            Basic Information
          </div>
          <div className="space-y-4">
            <div className="form-grid">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label form-label-required">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter medicine name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activeIngredient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label">Active Ingredient</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter active ingredient" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="form-grid-3">
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label form-label-required">Unit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitOptions.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label form-label-required">Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="packaging"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label">Packaging</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Box of 10 strips" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="form-grid">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label form-label-required">Expiry Date</FormLabel>
                    <FormControl>
                      <MyDatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) =>
                          field.onChange(date?.toISOString().split("T")[0])
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="form-section-card">
          <div className="form-section-card-title">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Pricing
          </div>
          <div className="form-grid">
            <FormField
              control={form.control}
              name="purchasePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label form-label-required">Purchase Price (VND)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sellingPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label form-label-required">Selling Price (VND)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onCancel} className="px-6">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
          >
            {isLoading && <Spinner size="sm" className="mr-2" />}
            {initialData ? "Update Medicine" : "Create Medicine"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
