"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CurrencyDisplay } from "./CurrencyDisplay";
import { Payment } from "@/interfaces/billing";

interface PaymentHistoryTableProps {
  payments: Payment[];
  totalPaid?: number;
  remainingBalance?: number;
}

export function PaymentHistoryTable({
  payments,
  totalPaid,
  remainingBalance,
}: PaymentHistoryTableProps) {
  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có thanh toán nào.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Phương thức</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {new Date(p.paymentDate).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell>
                  <CurrencyDisplay amount={p.amount} className="font-medium" />
                </TableCell>
                <TableCell>{p.method}</TableCell>
                <TableCell>
                  <Badge>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {p.notes || "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {(totalPaid !== undefined || remainingBalance !== undefined) && (
        <div className="flex justify-end gap-6 border-t pt-3 text-sm">
          {totalPaid !== undefined && (
            <div>
              <span className="text-muted-foreground">Đã thanh toán: </span>
              <CurrencyDisplay
                amount={totalPaid}
                className="font-semibold text-green-600"
              />
            </div>
          )}
          {remainingBalance !== undefined && (
            <div>
              <span className="text-muted-foreground">Còn nợ: </span>
              <CurrencyDisplay
                amount={remainingBalance}
                className={`font-semibold ${
                  remainingBalance > 0 ? "text-destructive" : "text-primary"
                }`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
