"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CurrencyDisplay } from "@/components/billing/CurrencyDisplay";
import { PaymentMethodBadge } from "@/components/billing/PaymentMethodBadge";
import { PaymentStatusBadge } from "@/components/billing/PaymentStatusBadge";
import { format } from "date-fns";
import { Payment, PaymentMethod, PaymentGateway } from "@/interfaces/billing";

interface Props {
  payments: Payment[];
  totalPaid: number;
  remainingBalance: number;
}

const formatDate = (date: string) =>
  format(new Date(date), "MMM d, yyyy, h:mm a");

// Map gateway to legacy method for display
const gatewayToMethod = (gateway?: PaymentGateway, method?: PaymentMethod): PaymentMethod => {
  if (method) return method;
  if (!gateway) return "CASH";
  switch (gateway) {
    case "VNPAY": return "CREDIT_CARD";
    case "MOMO": return "CREDIT_CARD";
    case "BANK_TRANSFER": return "BANK_TRANSFER";
    default: return "CASH";
  }
};

export function PaymentHistoryTable({
  payments,
  totalPaid,
  remainingBalance,
}: Props) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl mb-2 block">🧾</span>
        No payments recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.paymentDate ? formatDate(payment.paymentDate) : "-"}</TableCell>
              <TableCell>
                <CurrencyDisplay
                  amount={payment.amount}
                  className="font-medium"
                />
              </TableCell>
              <TableCell>
                <PaymentMethodBadge method={gatewayToMethod(payment.gateway, payment.method)} />
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={payment.status} />
              </TableCell>
              <TableCell className="text-gray-500 text-sm">
                {payment.notes || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end gap-8 pt-4 border-t">
        <div>
          <span className="text-gray-600">Total Paid:</span>
          <CurrencyDisplay
            amount={totalPaid}
            className="ml-2 font-semibold text-green-600"
          />
        </div>
        <div>
          <span className="text-gray-600">Remaining:</span>
          <CurrencyDisplay
            amount={remainingBalance}
            className={`ml-2 font-semibold ${
              remainingBalance > 0 ? "text-red-600" : "text-green-600"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
