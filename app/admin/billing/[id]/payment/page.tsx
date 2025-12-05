"use client";

import { useParams, useRouter } from "next/navigation";
import { useCreatePayment, useInvoice } from "@/hooks/queries/useBilling";
import { PaymentForm } from "../../_components/payment-form";
import { PaymentFormValues } from "@/lib/schemas/billing";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RecordPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: invoice, isLoading } = useInvoice(id);
  const { mutateAsync: createPayment, isPending } = useCreatePayment();

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      await createPayment({
        invoiceId: id,
        amount: data.amount,
        method: data.method,
        notes: data.notes,
      });
      toast.success("Payment recorded successfully");
      router.push(`/admin/billing/${id}`);
    } catch (error) {
      toast.error("Failed to record payment");
      console.error(error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Record Payment</h1>
          <p className="text-muted-foreground">
            Invoice #{invoice.id} • Balance Due:{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(invoice.balance)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Enter the payment amount and method. The remaining balance is{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(invoice.balance)}
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentForm
            onSubmit={onSubmit}
            isSubmitting={isPending}
            defaultAmount={invoice.balance}
          />
        </CardContent>
      </Card>
    </div>
  );
}
