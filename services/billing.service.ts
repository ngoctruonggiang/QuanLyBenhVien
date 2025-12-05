import { Invoice, CreatePaymentRequest, Payment } from "@/interfaces/billing";
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

export const getInvoices = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return api.get("/api/billing/invoices", { params });
};

export const getInvoiceSummary = async (): Promise<InvoiceSummary> => {
  return api.get("/api/billing/invoices/summary");
};

export const getInvoice = async (id: string) => {
  return api.get(`/api/billing/invoices/${id}`);
};

export const getInvoicesByPatient = async (patientId: string) => {
  return api.get(`/api/billing/invoices/by-patient/${patientId}`);
};

export const createPayment = async (data: CreatePaymentRequest) => {
  return api.post("/api/billing/payments", data);
};

export const cancelInvoice = async (id: string, reason: string) => {
  return api.post(`/api/billing/invoices/${id}/cancel`, { reason });
};

export const getPayments = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return api.get("/api/billing/payments", { params });
};
