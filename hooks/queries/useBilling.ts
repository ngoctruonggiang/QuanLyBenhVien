import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as billingService from "@/services/billing.service";
import {
  InvoiceListParams,
  PatientInvoiceParams,
  CreatePaymentRequest,
  GenerateInvoiceRequest,
} from "@/services/billing.service"; // Moved here

import { toast } from "sonner";

// ============ Query Keys ============

export const billingKeys = {
  all: ["billing"] as const,
  invoices: () => [...billingKeys.all, "invoices"] as const,
  invoiceList: (params: InvoiceListParams) =>
    [...billingKeys.invoices(), "list", params] as const,
  invoiceDetail: (id: string) =>
    [...billingKeys.invoices(), "detail", id] as const,
  invoiceByAppointment: (appointmentId: string) =>
    [...billingKeys.invoices(), "by-appointment", appointmentId] as const,
  patientInvoices: (patientId: string, params?: PatientInvoiceParams) =>
    [...billingKeys.invoices(), "by-patient", patientId, params] as const,
  payments: () => [...billingKeys.all, "payments"] as const,
  paymentDetail: (id: string) =>
    [...billingKeys.payments(), "detail", id] as const,
  paymentsByInvoice: (invoiceId: string) =>
    [...billingKeys.payments(), "by-invoice", invoiceId] as const,
  paymentSummaryCards: () => [...billingKeys.all, "paymentSummaryCards"] as const,
};

// ============ Invoice Hooks ============

// Get invoice list (admin)
export const useInvoiceList = (params: InvoiceListParams) => {
  return useQuery({
    queryKey: billingKeys.invoiceList(params),
    queryFn: () => billingService.getInvoiceList(params),
    select: (response) => response.data.data,
  });
};

// Get invoice by ID
export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: billingKeys.invoiceDetail(id),
    queryFn: () => billingService.getInvoiceById(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

// Get invoice by appointment
export const useInvoiceByAppointment = (appointmentId: string) => {
  return useQuery({
    queryKey: billingKeys.invoiceByAppointment(appointmentId),
    queryFn: () => billingService.getInvoiceByAppointment(appointmentId),
    select: (response) => response.data.data,
    enabled: !!appointmentId,
  });
};

// Get patient invoices
export const usePatientInvoices = (
  patientId: string,
  params?: PatientInvoiceParams
) => {
  return useQuery({
    queryKey: billingKeys.patientInvoices(patientId, params),
    queryFn: () => billingService.getPatientInvoices(patientId, params),
    select: (response) => response.data.data,
    enabled: !!patientId,
  });
};

// Generate invoice (mutation)
export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateInvoiceRequest) =>
      billingService.generateInvoice(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      toast.success("Invoice generated successfully");
      return response.data.data;
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = getBillingErrorMessage(errorCode);
      toast.error(errorMessage);
    },
  });
};

// ============ Payment Hooks ============

// Get payments by invoice
export const usePaymentsByInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: billingKeys.paymentsByInvoice(invoiceId),
    queryFn: () => billingService.getPaymentsByInvoice(invoiceId),
    select: (response) => response.data.data,
    enabled: !!invoiceId,
  });
};

// Get payment by ID
export const usePayment = (id: string) => {
  return useQuery({
    queryKey: billingKeys.paymentDetail(id),
    queryFn: () => billingService.getPaymentById(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

// Create payment (mutation)
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) =>
      billingService.createPayment(data),
    onSuccess: (response, variables) => {
      // Invalidate invoice detail to refresh payment history
      queryClient.invalidateQueries({
        queryKey: billingKeys.invoiceDetail(variables.invoiceId),
      });
      queryClient.invalidateQueries({
        queryKey: billingKeys.paymentsByInvoice(variables.invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      toast.success("Payment recorded successfully");
      return response.data.data;
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = getBillingErrorMessage(errorCode);
      toast.error(errorMessage);
    },
  });
};

// Cancel invoice (mutation) - inferred from usage in page files
export const useCancelInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      billingService.cancelInvoice(id, { cancelReason: reason }),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      queryClient.invalidateQueries({
        queryKey: billingKeys.invoiceDetail(variables.id),
      });
      toast.success("Invoice cancelled successfully");
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = getBillingErrorMessage(errorCode);
      toast.error(errorMessage);
    },
  });
};

// Get payment summary cards (inferred from usage in page files)
export const usePaymentSummaryCards = () => {
  return useQuery({
    queryKey: billingKeys.paymentSummaryCards(),
    queryFn: billingService.getPaymentSummaryCards,
    select: (response) => response.data.data,
  });
};

// Get payments list (inferred from usage in page files)
export const usePayments = (
  page: number,
  limit: number,
  search?: string,
  method?: string,
  startDate?: string,
  endDate?: string,
  sort?: string
) => {
  return useQuery({
    queryKey: billingKeys.payments(),
    queryFn: () =>
      billingService.getPayments({ page, limit, search, method, startDate, endDate, sort }),
    select: (response) => response.data.data,
  });
};

// ============ Error Message Mapping ============

function getBillingErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    // Validation errors
    VALIDATION_ERROR: "Please check your input and try again",

    // Invoice errors
    APPOINTMENT_NOT_FOUND: "Appointment not found",
    PRESCRIPTION_NOT_FOUND: "No prescription found for this appointment",
    INVOICE_NOT_FOUND: "Invoice not found",
    INVOICE_EXISTS: "Invoice already exists for this appointment",

    // Payment errors
    DUPLICATE_PAYMENT: "Payment already processed (duplicate request)",
    INVOICE_ALREADY_PAID: "Invoice is already fully paid",
    INVOICE_CANCELLED: "Cannot pay a cancelled invoice",
    PAYMENT_NOT_FOUND: "Payment not found",

    // Patient errors
    PATIENT_NOT_FOUND: "Patient not found",

    // Auth errors
    UNAUTHORIZED: "Please log in to continue",
    FORBIDDEN: "You do not have permission to perform this action",
  };

  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
}