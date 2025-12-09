"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useInvoice, useCreatePayment } from "@/hooks/queries/useBilling";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentForm } from "@/app/admin/billing/_components/payment-form";
import { PaymentFormValues } from "@/lib/schemas/billing";
import { toast } from "sonner";

export default function PatientPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [patientId, setPatientId] = useState<string | null>(() => {
    const pid =
      typeof window !== "undefined" ? localStorage.getItem("patientId") : null;
    return pid || "p-1";
  });
  const { data: invoice, isLoading } = useInvoice(id);
  const { mutateAsync: createPayment, isPending } = useCreatePayment();

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      await createPayment({
        invoiceId: id,
        amount: data.amount,
        method: data.method,
        notes: data.notes,
        idempotencyKey: data.idempotencyKey,
      });
      toast.success("Thanh toán thành công");
      router.push(`/patient/billing/${id}`);
    } catch (error) {
      toast.error("Thanh toán thất bại");
      console.error(error);
    }
  };

  if (isLoading)
    return <p className="p-6 text-muted-foreground">Đang tải...</p>;
  if (!invoice) return <p className="p-6">Không tìm thấy hóa đơn</p>;
  if (patientId && invoice.patientId !== patientId)
    return (
      <div className="page-shell py-10 text-center space-y-2">
        <p className="text-lg font-semibold text-destructive">
          Bạn không có quyền thanh toán hóa đơn này (403)
        </p>
        <Button variant="link" onClick={() => router.push("/patient/billing")}>
          Về danh sách hóa đơn
        </Button>
      </div>
    );

  return (
    <div className="page-shell space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Thanh toán hóa đơn
          </h1>
          <p className="text-muted-foreground">
            Hóa đơn #{invoice.invoiceNumber} • Còn nợ{" "}
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(invoice.balance)}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin thanh toán</CardTitle>
          <CardDescription>
            Nhập số tiền và phương thức thanh toán. Bạn có thể thanh toán một
            phần.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentForm
            invoice={invoice}
            onSubmit={onSubmit}
            isSubmitting={isPending}
            defaultAmount={invoice.balance}
            maxAmount={invoice.balance}
          />
        </CardContent>
      </Card>
    </div>
  );
}
