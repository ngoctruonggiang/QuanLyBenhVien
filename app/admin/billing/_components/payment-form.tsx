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
import { Invoice } from "@/interfaces/billing";
import { InvoiceSummaryCard } from "@/components/billing/InvoiceSummaryCard";
import { CreditCard } from "lucide-react";

interface PaymentFormProps {
  invoice: Invoice;
  defaultAmount?: number;
  onSubmit: (data: PaymentFormValues) => void;
  isSubmitting?: boolean;
  maxAmount?: number;
  hideCashOption?: boolean; // Hide cash option for patients (they can only use VNPay)
}

export function PaymentForm({
  invoice,
  defaultAmount,
  onSubmit,
  isSubmitting,
  maxAmount,
  hideCashOption = false,
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
    [maxAmount, invoice.balance],
  );

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: defaultAmount || 0,
      method: hideCashOption ? "VNPAY" : "CASH", // Default to VNPay if cash is hidden
      notes: "",
      idempotencyKey,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <InvoiceSummaryCard invoice={invoice} />
        
        <div className="form-section-card">
          <div className="form-section-card-title">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            Payment Details
          </div>
          <div className="space-y-4">
            <input type="hidden" {...form.register("idempotencyKey")} />
            <div className="form-grid">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label form-label-required">Payment Amount</FormLabel>
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
                        className="mt-2 text-emerald-600 hover:text-emerald-700"
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
                    <FormLabel className="form-label form-label-required">Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {!hideCashOption && (
                          <SelectItem value="CASH">💵 Cash</SelectItem>
                        )}
                        <SelectItem value="VNPAY">💳 Card / Online (VNPay)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {field.value === "VNPAY" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        You will be redirected to VNPay to complete payment
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Notes (Optional)</FormLabel>
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
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Record Payment"}
        </Button>
      </form>
    </Form>
  );
}
