"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CurrencyDisplay } from "./CurrencyDisplay";

interface InvoiceSummaryCardProps {
  invoice: {
    invoiceNumber: string;
    patientName?: string;
    totalAmount: number;
    paidAmount: number;
  };
}

export function InvoiceSummaryCard({ invoice }: InvoiceSummaryCardProps) {
  const balance = invoice.totalAmount - invoice.paidAmount;

  return (
    <Card className="bg-muted/40">
      <CardContent className="p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Invoice</span>
          <span className="font-medium">#{invoice.invoiceNumber}</span>
        </div>
        {invoice.patientName && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Patient</span>
            <span className="font-medium">{invoice.patientName}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total</span>
          <CurrencyDisplay
            amount={invoice.totalAmount}
            className="font-medium"
          />
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Paid</span>
          <CurrencyDisplay
            amount={invoice.paidAmount}
            className="font-medium text-green-600"
          />
        </div>
        <div className="flex justify-between border-t pt-2">
          <span className="font-semibold">Balance</span>
          <CurrencyDisplay
            amount={balance}
            className={`font-semibold ${
              balance > 0 ? "text-destructive" : "text-primary"
            }`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
