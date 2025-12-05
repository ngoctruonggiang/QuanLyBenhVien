export type InvoiceStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";
export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "BANK_TRANSFER"
  | "INSURANCE"
  | "OTHER";

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  type: "CONSULTATION" | "MEDICINE" | "TEST" | "PROCEDURE" | "OTHER";
  description: string;
  referenceId?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  paymentDate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName?: string; // Helper
  appointmentId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number; // Helper, might need calculation
  balance: number; // Helper
  status: InvoiceStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  items: InvoiceItem[];
  payments: Payment[];
}

export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}
