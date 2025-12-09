import { z } from "zod";

// Medicine form validation schema
export const medicineFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  activeIngredient: z
    .string()
    .max(200, "Active ingredient must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  unit: z.string().min(1, "Unit is required"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  // FIXME: Using z.any() as a workaround for a persistent build error.
  // The zodResolver is incorrectly inferring these as `unknown` instead of `number`.
  // Type coercion and parsing should be handled manually in the form component.
  quantity: z.any(),
  packaging: z.string().optional().or(z.literal("")),
  purchasePrice: z.any(),
  sellingPrice: z.any(),
  expiresAt: z.string().min(1, "Expiry date is required"),
  categoryId: z.string().optional().or(z.literal("")),
});

export type MedicineFormValues = z.infer<typeof medicineFormSchema>;

// Medicine search/filter schema
export const medicineSearchSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  size: z.number().min(1).max(100).optional().default(10),
  sort: z.string().optional(),
});

export type MedicineSearchValues = z.infer<typeof medicineSearchSchema>;
