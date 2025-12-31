"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatusBadge } from "@/app/admin/billing/_components/invoice-status-badge";
import { useInvoice } from "@/hooks/queries/useBilling";
import { CurrencyDisplay } from "@/components/billing/CurrencyDisplay";
import { PaymentHistoryTable } from "@/components/billing/PaymentHistoryTable";
import { Spinner } from "@/components/ui/spinner";

export default function PatientInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: invoice, isLoading, isError, error } = useInvoice(id);

  if (isLoading) {
    return (
      <div className="page-shell flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show error from API (including 403 Forbidden from backend)
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message || "Không thể tải hóa đơn. Vui lòng thử lại.";
    const statusCode = (error as any)?.response?.status;
    return (
      <div className="page-shell py-10 text-center space-y-2">
        <p className="text-lg font-semibold text-destructive">
          {statusCode === 403 
            ? "Bạn không có quyền xem hóa đơn này" 
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
  const isPayable =
    invoice.status === "UNPAID" ||
    invoice.status === "PARTIALLY_PAID" ||
    invoice.status === "OVERDUE";

  const isOverdue = invoice.status === "OVERDUE";

  return (
    <div className="page-shell space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Hóa đơn #{invoice.invoiceNumber}
          </h1>
          <p className="text-muted-foreground">
            Ngày: {new Date(invoice.invoiceDate).toLocaleDateString("vi-VN")}
            {invoice.dueDate &&
              ` • Hạn: ${new Date(invoice.dueDate).toLocaleDateString("vi-VN")}`}
          </p>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      {isOverdue && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-4 text-destructive">
            Hóa đơn đã quá hạn, vui lòng thanh toán sớm.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tổng quan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Tổng</span>
            <CurrencyDisplay
              amount={invoice.totalAmount}
              className="font-medium"
            />
          </div>
          <div className="flex justify-between">
            <span>Đã thanh toán</span>
            <CurrencyDisplay
              amount={invoice.paidAmount || 0}
              className="text-green-600"
            />
          </div>
          <div className="flex justify-between">
            <span>Còn nợ</span>
            <CurrencyDisplay
              amount={invoice.balance ?? invoice.balanceDue ?? 0}
              className={
                (invoice.balance ?? invoice.balanceDue ?? 0) > 0 ? "text-destructive" : "text-primary"
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistoryTable
            payments={invoice.payments ?? []}
            totalPaid={invoice.paidAmount}
            remainingBalance={invoice.balance ?? invoice.balanceDue ?? 0}
          />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {isPayable && (
          <Button asChild>
            <Link href={`/patient/billing/${invoice.id}/pay`}>Thanh toán</Link>
          </Button>
        )}
        {invoice.status === "PAID" && (
          <Button variant="outline">Tải biên lai (stub)</Button>
        )}
      </div>
    </div>
  );
}
