"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PaymentFormValues,
  paymentSchemaWithBalance,
} from "@/lib/schemas/billing";
import { Invoice } from "@/interfaces/billing"; // Import Invoice interface
import { InvoiceSummaryCard } from "@/components/billing/InvoiceSummaryCard"; // Import InvoiceSummaryCard

interface PaymentFormProps {
  invoice: Invoice; // Add invoice prop
  defaultAmount?: number;
  onSubmit: (data: PaymentFormValues) => void;
  isSubmitting?: boolean;
  maxAmount?: number;
}

export function PaymentForm({
  invoice, // Destructure invoice prop
  defaultAmount,
  onSubmit,
  isSubmitting,
  maxAmount,
}: PaymentFormProps) {
  const [idempotencyKey] = useState(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback simple UUID v4-ish
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  });

  const schema = useMemo(
    () => paymentSchemaWithBalance(maxAmount ?? invoice.balance), // Use invoice.balance for schema
    [maxAmount, invoice.balance]
  );

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: defaultAmount || 0,
      method: "CASH",
      notes: "",
      idempotencyKey,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <InvoiceSummaryCard invoice={invoice} /> {/* Render InvoiceSummaryCard */}
        <input type="hidden" {...form.register("idempotencyKey")} />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
              {maxAmount !== undefined && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    form.setValue("amount", maxAmount, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  Pay full balance
                </Button>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="INSURANCE">Insurance</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Transaction ID, reference number, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Processing..." : "Record Payment"}
        </Button>
      </form>
    </Form>
  );
}
