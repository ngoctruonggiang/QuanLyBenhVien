"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMyInvoices } from "@/hooks/queries/useBilling";
import { InvoiceStatusBadge } from "@/app/admin/billing/_components/invoice-status-badge";
import { InvoiceSummaryCard } from "@/components/billing/InvoiceSummaryCard";
import { Invoice } from "@/interfaces/billing";
import { Spinner } from "@/components/ui/spinner";

export default function PatientInvoiceListPage() {
  const [status, setStatus] = useState<string>("ALL");
  
  // useMyInvoices uses /invoices/my endpoint which automatically looks up patientId from JWT
  const { data: invoices = [], isLoading, isError, error } = useMyInvoices(
    { status: status === "ALL" ? undefined : status },
  );

  if (isLoading) {
    return (
      <div className="page-shell flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Show error message if API call failed
  if (isError) {
    const errorMessage = (error as any)?.response?.data?.message || "Không thể tải hóa đơn. Vui lòng thử lại.";
    return (
      <div className="page-shell">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {errorMessage}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hóa đơn của tôi</h1>
          <p className="text-muted-foreground">
            Xem và thanh toán các hóa đơn còn nợ
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["ALL", "UNPAID", "PARTIALLY_PAID", "PAID", "OVERDUE"].map((s) => (
          <Button
            key={s}
            variant={status === s ? "default" : "outline"}
            size="sm"
            onClick={() => setStatus(s)}
          >
            {s.replace("_", " ")}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Bạn chưa có hóa đơn nào.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {invoices.map((invoice: Invoice) => {
            const isOverdue = invoice.status === "OVERDUE";
            const isPayable =
              invoice.status === "UNPAID" ||
              invoice.status === "PARTIALLY_PAID" ||
              invoice.status === "OVERDUE";
            return (
              <Card
                key={invoice.id}
                className={isOverdue ? "border-destructive/50" : undefined}
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      Hóa đơn #{invoice.invoiceNumber}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.invoiceDate).toLocaleDateString(
                        "vi-VN",
                      )}
                      {invoice.dueDate &&
                        ` • Hạn: ${new Date(invoice.dueDate).toLocaleDateString(
                          "vi-VN",
                        )}`}
                    </p>
                  </div>
                  <InvoiceStatusBadge status={invoice.status} />
                </CardHeader>
                <CardContent className="space-y-3">
                  <InvoiceSummaryCard
                    invoice={{
                      invoiceNumber: invoice.invoiceNumber,
                      patientName: invoice.patientName,
                      totalAmount: invoice.totalAmount,
                      paidAmount: invoice.paidAmount || 0,
                    }}
                  />
                  <div className="flex gap-2 flex-wrap">
                    {isPayable && (
                      <Button size="sm" asChild>
                        <Link href={`/patient/billing/${invoice.id}/pay`}>
                          Thanh toán
                        </Link>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/patient/billing/${invoice.id}`}>
                        Chi tiết
                      </Link>
                    </Button>
                    {isOverdue && <Badge variant="destructive">Quá hạn</Badge>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
