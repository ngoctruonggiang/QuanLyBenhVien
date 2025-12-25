import { z } from "zod";

const basePaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.enum(["CASH", "VNPAY"], {
    message: "Please select a payment method",
  }),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
  idempotencyKey: z.string().uuid("Idempotency key must be a valid UUID"),
});

export const paymentSchema = basePaymentSchema;

export const paymentSchemaWithBalance = (maxAmount?: number) =>
  maxAmount && maxAmount > 0
    ? basePaymentSchema.extend({
        amount: z
          .number()
          .positive("Amount must be greater than 0")
          .max(maxAmount, "Amount cannot exceed remaining balance"),
      })
    : basePaymentSchema;

export type PaymentFormValues = z.infer<typeof paymentSchema>;
