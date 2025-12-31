import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as billingService from "@/services/billing.service";
import {
  GenerateInvoiceRequest,
} from "@/interfaces/billing";

import { toast } from "sonner";

// Local type for patient invoice params
export type PatientInvoiceParams = {
  status?: string;
  page?: number;
  size?: number;
};

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
  paymentsList: (params?: {
    page: number;
    limit: number;
    search?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
  }) => [...billingKeys.payments(), "list", params] as const,
  payments: () => [...billingKeys.all, "payments"] as const,
  paymentDetail: (id: string) =>
    [...billingKeys.payments(), "detail", id] as const,
  paymentsByInvoice: (invoiceId: string) =>
    [...billingKeys.payments(), "by-invoice", invoiceId] as const,
  paymentSummaryCards: () =>
    [...billingKeys.all, "paymentSummaryCards"] as const,
};

// ============ Invoice Hooks ============

// Get invoice list (admin)
export const useInvoiceList = (params: InvoiceListParams) => {
  return useQuery({
    queryKey: billingKeys.invoiceList(params),
    queryFn: () => billingService.getInvoiceList(params),
    select: (response) => response.data.data, // Unwrap ApiResponse { code, data: PageResponse }
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

// Get my invoices (patient self-service - uses JWT to lookup patientId automatically)
export const useMyInvoices = (
  params?: { status?: string },
) => {
  return useQuery({
    queryKey: [...billingKeys.invoices(), "my", params],
    queryFn: () => billingService.getMyInvoices(params),
    select: (response) => response.data.data,
  });
};

// Get patient invoices (admin/staff use)
export const usePatientInvoices = (
  patientId: string,
  params?: PatientInvoiceParams,
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

// Initialize VNPay payment (mutation) - returns redirect URL
export const useInitPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { invoiceId: string; amount?: number; returnUrl?: string }) =>
      billingService.initPayment({
        invoiceId: data.invoiceId,
        amount: data.amount,
        returnUrl: data.returnUrl || `${window.location.origin}/payment/result`,
      }),
    onSuccess: (response) => {
      // Redirect to VNPay
      const paymentUrl = response.data.data.paymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      }
      return response.data.data;
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message || getBillingErrorMessage(String(errorCode));
      toast.error(errorMessage);
    },
  });
};

// Create cash payment (mutation)
export const useCreateCashPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { invoiceId: string; amount?: number; notes?: string }) =>
      billingService.createCashPayment(data.invoiceId, data.amount, data.notes),
    onSuccess: (response, variables) => {
      // Invalidate invoice detail to refresh payment history
      queryClient.invalidateQueries({
        queryKey: billingKeys.invoiceDetail(variables.invoiceId),
      });
      queryClient.invalidateQueries({
        queryKey: billingKeys.paymentsByInvoice(variables.invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      toast.success("Thanh toán tiền mặt thành công");
      return response.data.data;
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.code;
      const errorMessage = error.response?.data?.message || getBillingErrorMessage(String(errorCode));
      toast.error(errorMessage);
    },
  });
};

// Alias for backward compatibility - existing pages use useCreatePayment
export const useCreatePayment = useCreateCashPayment;

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
  });
};

// Get payments list - Returns mock data until BE endpoint is implemented
export const usePayments = (
  page: number,
  limit: number,
  search?: string,
  method?: string,
  startDate?: string,
  endDate?: string,
  sort?: string,
) => {
  const params = { page, limit, search, method, startDate, endDate, sort };
  return useQuery({
    queryKey: billingKeys.paymentsList(params),
    // Mock data until BE endpoint is ready
    queryFn: async () => ({
      data: [],
      page: 0,
      total: 0,
      totalPages: 0,
    }),
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
