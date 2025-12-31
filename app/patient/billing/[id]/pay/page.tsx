"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useInvoice, useCreateCashPayment, useInitPayment } from "@/hooks/queries/useBilling";
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
import { Spinner } from "@/components/ui/spinner";

export default function PatientPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: invoice, isLoading, isError, error } = useInvoice(id);
  const { mutateAsync: createCashPayment, isPending: isCashPending } = useCreateCashPayment();
  const { mutateAsync: initVNPayPayment, isPending: isVNPayPending } = useInitPayment();

  const isPending = isCashPending || isVNPayPending;

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      if (data.method === "VNPAY") {
        // VNPay payment - redirect to payment gateway
        await initVNPayPayment({
          invoiceId: id,
          amount: data.amount,
          returnUrl: `${window.location.origin}/payment/result`,
        });
        // User will be redirected to VNPay
      } else {
        // Cash payment - record immediately
        await createCashPayment({
          invoiceId: id,
          amount: data.amount,
          notes: data.notes,
        });
        toast.success("Thanh toán thành công");
        router.push(`/patient/billing/${id}`);
      }
    } catch (error) {
      toast.error("Thanh toán thất bại");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="page-shell flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show error from API (including 403 Forbidden from backend)
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message || "Không thể tải hóa đơn.";
    const statusCode = (error as any)?.response?.status;
    return (
      <div className="page-shell py-10 text-center space-y-2">
        <p className="text-lg font-semibold text-destructive">
          {statusCode === 403 
            ? "Bạn không có quyền thanh toán hóa đơn này" 
            : statusCode === 404 
            ? "Không tìm thấy hóa đơn" 
            : errorMessage}
        </p>
        <Button variant="link" onClick={() => router.push("/patient/billing")}>
          Về danh sách hóa đơn
        </Button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="page-shell py-10 text-center">
        <p className="text-lg font-medium">Không tìm thấy hóa đơn</p>
        <Button variant="link" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  // Backend validates access via JWT - if we got here, user has permission

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
            }).format(invoice.balance ?? invoice.balanceDue ?? 0)}
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
            defaultAmount={invoice.balance ?? invoice.balanceDue ?? 0}
            maxAmount={invoice.balance ?? invoice.balanceDue ?? 0}
            hideCashOption={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
