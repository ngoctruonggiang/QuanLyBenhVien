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

// Get invoice by ID - direct mock implementation
export const getInvoiceById = async (id: string) => {
  const { invoices } = await import("@/mocks/handlers/billing");
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const invoice = invoices.find((inv: any) => inv.id === id);
  if (!invoice) {
    throw new Error("Invoice not found");
  }
  return { data: { status: "success", data: invoice } };
};

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

// List invoices (admin) - direct mock implementation
export const getInvoiceList = async (params?: InvoiceListParams) => {
  // Import invoices directly for mock mode to ensure data sync
  const { invoices } = await import("@/mocks/handlers/billing");
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  let filtered = [...invoices];

  if (params?.status && params.status !== "ALL") {
    filtered = filtered.filter((inv) => inv.status === params.status);
  }

  if (params?.search) {
    const search = params.search.toLowerCase();
    filtered = filtered.filter(
      (inv: any) =>
        inv.patientName?.toLowerCase().includes(search) ||
        inv.invoiceNumber?.toLowerCase().includes(search)
    );
  }

  if (params?.startDate) {
    const start = new Date(params.startDate);
    filtered = filtered.filter((inv: any) => new Date(inv.invoiceDate) >= start);
  }

  if (params?.endDate) {
    const end = new Date(params.endDate);
    filtered = filtered.filter((inv: any) => new Date(inv.invoiceDate) <= end);
  }

  const sortParam = params?.sort || "invoiceDate,desc";
  const [sortKey, sortDir] = sortParam.split(",");
  filtered = filtered.sort((a: any, b: any) => {
    const direction = sortDir === "asc" ? 1 : -1;
    switch (sortKey) {
      case "totalAmount":
        return (a.totalAmount - b.totalAmount) * direction;
      case "status":
        return a.status.localeCompare(b.status) * direction;
      case "invoiceDate":
      default:
        return (
          (new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime()) *
          direction
        );
    }
  });

  const totalElements = filtered.length;
  const page = params?.page || 0;
  const size = params?.size || 10;
  const startIndex = page * size;
  const content = filtered.slice(startIndex, startIndex + size);
  const totalPages = size > 0 ? Math.ceil(totalElements / size) : 1;

  return {
    data: {
      content,
      page,
      size,
      totalElements,
      totalPages,
      last: page >= totalPages - 1,
    },
  };
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
  api.post<{ status: string; data: Invoice }>(
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
    const response = await api.get<{ data: PaymentSummaryCards }>(
      "/api/billing/payments/summary-cards",
    );
    return response.data.data;
  };
