// ==================== Status Types ====================
export type InvoiceStatus =
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";

export type PaymentGateway = "CASH" | "VNPAY" | "MOMO" | "BANK_TRANSFER";

// Legacy - for backward compatibility
export type PaymentMethod =
  | "CASH"
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "INSURANCE";

// ==================== Invoice Types ====================
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

export interface PatientInfo {
  id: string;
  fullName: string;
}

export interface AppointmentInfo {
  id: string;
  appointmentTime?: string;
}

export interface MedicalExamInfo {
  id: string;
}

export interface CancellationInfo {
  reason: string;
  cancelledAt: string;
  cancelledBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patient: PatientInfo;
  // Backward compatible fields (computed from nested objects)
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  medicalExamId?: string;
  appointment?: AppointmentInfo;
  medicalExam?: MedicalExamInfo;
  invoiceDate: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  balance?: number; // Alias for balanceDue
  status: InvoiceStatus;
  notes?: string;
  cancellation?: CancellationInfo;
  payments?: Payment[]; // Payment history
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateInvoiceRequest {
  appointmentId: string;
  notes?: string;
}

// ==================== Payment Types ====================
export interface PaymentInvoiceInfo {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  status: InvoiceStatus;
}

export interface Payment {
  id: string;
  invoice: PaymentInvoiceInfo;
  // Backward compatible fields
  invoiceId?: string;
  method?: PaymentMethod; // Alias for gateway
  txnRef: string;
  amount: number;
  gateway: PaymentGateway;
  status: PaymentStatus;
  vnpTransactionNo?: string;
  vnpBankCode?: string;
  vnpCardType?: string;
  vnpResponseCode?: string;
  orderInfo?: string;
  notes?: string;
  paymentDate?: string;
  expireAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== VNPay Payment Request/Response ====================
export interface PaymentInitRequest {
  invoiceId: string;
  returnUrl?: string;
  bankCode?: string;
  language?: "vn" | "en";
  orderInfo?: string;
  amount?: number; // Optional for partial payment
}

export interface PaymentInitResponse {
  paymentId: string;
  txnRef: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  paymentUrl: string; // VNPay redirect URL
  expireAt: string;
  status: string;
}

export interface PaymentsByInvoiceResponse {
  payments: Payment[];
  totalPaid: number;
  invoiceTotal: number;
  remainingBalance: number;
}

// ==================== Legacy Types (for backward compat) ====================
export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  idempotencyKey?: string;
}
