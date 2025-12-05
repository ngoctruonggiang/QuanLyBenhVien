import {
  Invoice,
  CreatePaymentRequest,
  Payment,
  InvoiceStatus,
} from "@/interfaces/billing";
import { mockInvoices as seedInvoices } from "@/lib/mocks";
import { USE_MOCK } from "@/lib/mocks/toggle";

let mockInvoices: Invoice[] = [...seedInvoices];
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  if (!USE_MOCK) {
    throw new Error("Billing API not implemented");
  }
  await delay(500);
  let filtered = [...mockInvoices];

  if (params?.search) {
    const lowerSearch = params.search.toLowerCase();
    filtered = filtered.filter(
      (inv) =>
        (inv.patientName &&
          inv.patientName.toLowerCase().includes(lowerSearch)) ||
        inv.invoiceNumber.toLowerCase().includes(lowerSearch)
    );
  }

  if (params?.status && params.status !== "ALL") {
    filtered = filtered.filter((inv) => inv.status === params.status);
  }

  if (params?.startDate) {
    const start = new Date(params.startDate);
    filtered = filtered.filter((inv) => new Date(inv.invoiceDate) >= start);
  }

  if (params?.endDate) {
    const end = new Date(params.endDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter((inv) => new Date(inv.invoiceDate) <= end);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return {
    data: paginatedData,
    total: filtered.length,
    page,
    limit,
  };
};

export const getInvoiceSummary = async (): Promise<InvoiceSummary> => {
  if (!USE_MOCK) {
    throw new Error("Billing API not implemented");
  }
  await delay(300);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const unpaidStatuses: InvoiceStatus[] = ["UNPAID", "PARTIALLY_PAID"];

  const totalInvoices = mockInvoices.length;
  const totalAmount = mockInvoices.reduce(
    (sum, inv) => sum + inv.totalAmount,
    0
  );

  const unpaidInvoices = mockInvoices.filter((inv) =>
    unpaidStatuses.includes(inv.status)
  );
  const unpaidCount = unpaidInvoices.length;
  const unpaidAmount = unpaidInvoices.reduce(
    (sum, inv) => sum + inv.balance,
    0
  );

  const overdueInvoices = mockInvoices.filter(
    (inv) => inv.status === "OVERDUE"
  );
  const overdueCount = overdueInvoices.length;
  const overdueAmount = overdueInvoices.reduce(
    (sum, inv) => sum + inv.balance,
    0
  );

  // Calculate collected this month from payments
  const collectedThisMonth = mockInvoices.reduce((sum, inv) => {
    return (
      sum +
      inv.payments
        .filter(
          (p) =>
            new Date(p.paymentDate) >= startOfMonth && p.status === "COMPLETED"
        )
        .reduce((pSum, p) => pSum + p.amount, 0)
    );
  }, 0);

  return {
    totalInvoices,
    totalAmount,
    unpaidCount,
    unpaidAmount,
    overdueCount,
    overdueAmount,
    collectedThisMonth,
  };
};

export const getInvoice = async (id: string) => {
  if (!USE_MOCK) {
    throw new Error("Billing API not implemented");
  }
  await delay(300);
  return mockInvoices.find((inv) => inv.id === id);
};

export const getInvoicesByPatient = async (patientId: string) => {
  if (!USE_MOCK) {
    throw new Error("Billing API not implemented");
  }
  await delay(300);
  return mockInvoices.filter((inv) => inv.patientId === patientId);
};

export const createPayment = async (data: CreatePaymentRequest) => {
  if (!USE_MOCK) {
    throw new Error("Billing API not implemented");
  }
  await delay(500);
  const invoiceIndex = mockInvoices.findIndex(
    (inv) => inv.id === data.invoiceId
  );
  if (invoiceIndex === -1) throw new Error("Invoice not found");

  const invoice = mockInvoices[invoiceIndex];

  const newPayment: Payment = {
    id: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    invoiceId: data.invoiceId,
    amount: data.amount,
    method: data.method,
    status: "COMPLETED",
    paymentDate: new Date().toISOString(),
    notes: data.notes,
  };

  invoice.payments.push(newPayment);
  invoice.paidAmount += data.amount;
  invoice.balance = invoice.totalAmount - invoice.paidAmount;

  if (invoice.balance <= 0) {
    invoice.status = "PAID";
    invoice.balance = 0; // Prevent negative balance
  } else {
    invoice.status = "PARTIALLY_PAID";
  }

  return newPayment;
};

export const cancelInvoice = async (id: string, reason: string) => {
  if (!USE_MOCK) {
    throw new Error("Billing API not implemented");
  }
  await delay(500);
  const invoiceIndex = mockInvoices.findIndex((inv) => inv.id === id);
  if (invoiceIndex === -1) throw new Error("Invoice not found");

  const invoice = mockInvoices[invoiceIndex];

  if (invoice.status !== "UNPAID") {
    throw new Error("Only UNPAID invoices can be cancelled");
  }

  if (invoice.payments.length > 0) {
    throw new Error("Cannot cancel invoice with recorded payments");
  }

  invoice.status = "CANCELLED";
  invoice.notes = `Cancelled: ${reason}`;
  invoice.updatedAt = new Date().toISOString();

  return invoice;
};

export const getPayments = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}) => {
  if (!USE_MOCK) {
    throw new Error("Billing API not implemented");
  }
  await delay(500);

  // Collect all payments from all invoices
  let allPayments: (Payment & {
    invoiceNumber: string;
    patientName: string;
  })[] = [];

  mockInvoices.forEach((inv) => {
    inv.payments.forEach((payment) => {
      allPayments.push({
        ...payment,
        invoiceNumber: inv.invoiceNumber,
        patientName: inv.patientName || "Unknown",
      });
    });
  });

  // Sort by date descending
  allPayments.sort(
    (a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  // Apply filters
  if (params?.search) {
    const lowerSearch = params.search.toLowerCase();
    allPayments = allPayments.filter(
      (p) =>
        p.invoiceNumber.toLowerCase().includes(lowerSearch) ||
        p.patientName.toLowerCase().includes(lowerSearch)
    );
  }

  if (params?.method && params.method !== "ALL") {
    allPayments = allPayments.filter((p) => p.method === params.method);
  }

  if (params?.startDate) {
    const start = new Date(params.startDate);
    allPayments = allPayments.filter((p) => new Date(p.paymentDate) >= start);
  }

  if (params?.endDate) {
    const end = new Date(params.endDate);
    end.setHours(23, 59, 59, 999);
    allPayments = allPayments.filter((p) => new Date(p.paymentDate) <= end);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const startIndex = (page - 1) * limit;
  const paginatedData = allPayments.slice(startIndex, startIndex + limit);

  return {
    data: paginatedData,
    total: allPayments.length,
    page,
    limit,
  };
};
