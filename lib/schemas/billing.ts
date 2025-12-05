import { z } from "zod";

export const paymentSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "INSURANCE", "OTHER"], {
    message: "Please select a payment method",
  }),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
