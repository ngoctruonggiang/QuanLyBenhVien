import {
  Invoice,
  CreatePaymentRequest,
  Payment,
  GenerateInvoiceRequest,
} from "@/interfaces/billing";
import api from "@/config/axios";

export interface InvoiceSummary {
  totalInvoices: number;
  totalAmount: number;
  unpaidCount: number;
  unpaidAmount: number;
  overdueCount: number;
  overdueAmount: number;
  collectedThisMonth: number;
}

// ---- Invoice APIs ----
// Generate invoice (internal - triggered by prescription creation)
export const generateInvoice = async (data: GenerateInvoiceRequest) =>
  api.post<{ status: string; data: Invoice }>(
    `/api/billing/invoices/generate`,
    data,
  );

// Get invoice by ID
export const getInvoiceById = async (id: string) =>
  api.get<{ status: string; data: Invoice }>(`/api/billing/invoices/${id}`);

// Get invoice by appointment
export const getInvoiceByAppointment = async (appointmentId: string) =>
  api.get<{ status: string; data: Invoice }>(
    `/api/billing/invoices/by-appointment/${appointmentId}`,
  );

export type InvoiceListParams = {
  patientId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
};

// List invoices (admin)
export const getInvoiceList = async (params?: InvoiceListParams) => {
  return api.get("/api/billing/invoices", { params });
};

export type PatientInvoiceParams = {
  status?: string;
  page?: number;
  size?: number;
};

// Get patient invoices
export const getPatientInvoices = async (
  patientId: string,
  params?: PatientInvoiceParams,
) => {
  return api.get(`/api/billing/invoices/by-patient/${patientId}`, { params });
};

// ---- Payment APIs ----

// Create payment
export const createPayment = async (data: CreatePaymentRequest) =>
  api.post<{ status: string; data: Payment }>(`/api/billing/payments`, data);

// Get payment by ID
export const getPaymentById = async (id: string) =>
  api.get<{ status: string; data: Payment }>(`/api/billing/payments/${id}`);

// Get payments by invoice
export const getPaymentsByInvoice = async (invoiceId: string) =>
  api.get<{ status: string; data: Payment[] }>(
    `/api/billing/payments/by-invoice/${invoiceId}`,
  );

// Cancel invoice (PATCH method is more appropriate for partial updates)
export const cancelInvoice = async (
  id: string,
  data: { cancelReason: string },
) =>
  api.patch<{ status: string; data: Invoice }>(
    `/api/billing/invoices/${id}/cancel`,
    data,
  );

export interface PaymentSummaryCards {
  todayAmount: number;
  todayCount: number;
  thisWeekAmount: number;
  thisWeekCount: number;
  cashAmount: number;
  cashPercentage: number;
  cardAmount: number;
  cardPercentage: number;
}

export const getPayments = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
}) => {
  return api.get("/api/billing/payments", { params });
};

export const getPaymentSummaryCards =
  async (): Promise<PaymentSummaryCards> => {
    return api.get("/api/billing/payments/summary-cards");
  };
