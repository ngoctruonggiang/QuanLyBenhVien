import { http, HttpResponse } from "msw";

const invoices = [
  {
    id: "inv-1",
    invoiceNumber: "INV-001",
    patientId: "p-1",
    patientName: "Nguyen Van A",
    invoiceDate: "2025-12-04T00:00:00Z",
    dueDate: "2025-12-10T00:00:00Z",
    totalAmount: 500000,
    paidAmount: 0,
    balance: 500000,
    status: "UNPAID",
    items: [
      {
        id: "item-1",
        type: "CONSULTATION",
        description: "Khám tổng quát",
        referenceId: "svc-1",
        quantity: 1,
        unitPrice: 300000,
        amount: 300000,
      },
      {
        id: "item-2",
        type: "MEDICINE",
        description: "Thuốc A",
        referenceId: "med-1",
        quantity: 2,
        unitPrice: 100000,
        amount: 200000,
      },
    ],
    payments: [],
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-002",
    patientId: "p-2",
    patientName: "Tran Thi B",
    invoiceDate: "2025-12-03T00:00:00Z",
    dueDate: "2025-12-05T00:00:00Z",
    totalAmount: 1000000,
    paidAmount: 300000,
    balance: 700000,
    status: "PARTIALLY_PAID",
    items: [],
    payments: [
      {
        id: "pay-2-1",
        amount: 300000,
        method: "CASH",
        status: "COMPLETED",
        paymentDate: "2025-12-04T00:00:00Z",
        notes: "Deposit",
      },
      {
        id: "pay-2-2",
        amount: 200000,
        method: "BANK_TRANSFER",
        status: "COMPLETED",
        paymentDate: "2025-12-05T00:00:00Z",
        notes: "Transfer second installment",
      },
    ],
  },
  {
    id: "inv-3",
    invoiceNumber: "INV-003",
    patientId: "p-3",
    patientName: "Le Van C",
    invoiceDate: "2025-11-30T00:00:00Z",
    dueDate: "2025-12-02T00:00:00Z",
    totalAmount: 750000,
    paidAmount: 750000,
    balance: 0,
    status: "PAID",
    items: [],
    payments: [
      {
        id: "pay-3-1",
        amount: 750000,
        method: "CARD",
        status: "COMPLETED",
        paymentDate: "2025-12-01T00:00:00Z",
        notes: "Full payment",
      },
    ],
  },
  {
    id: "inv-4",
    invoiceNumber: "INV-004",
    patientId: "p-4",
    patientName: "Pham D",
    invoiceDate: "2025-11-25T00:00:00Z",
    dueDate: "2025-11-27T00:00:00Z",
    totalAmount: 1200000,
    paidAmount: 200000,
    balance: 1000000,
    status: "OVERDUE",
    items: [],
    payments: [
      {
        id: "pay-4-1",
        amount: 200000,
        method: "BANK_TRANSFER",
        status: "COMPLETED",
        paymentDate: "2025-11-26T00:00:00Z",
        notes: "Partial transfer",
      },
      {
        id: "pay-4-2",
        amount: 150000,
        method: "INSURANCE",
        status: "PENDING",
        paymentDate: "2025-12-05T00:00:00Z",
        notes: "Insurance claim pending",
      },
    ],
  },
  {
    id: "inv-5",
    invoiceNumber: "INV-005",
    patientId: "p-5",
    patientName: "Hoang E",
    invoiceDate: "2025-11-20T00:00:00Z",
    dueDate: "2025-11-22T00:00:00Z",
    totalAmount: 300000,
    paidAmount: 0,
    balance: 300000,
    status: "CANCELLED",
    items: [],
    payments: [],
  },
];

// Flatten payments with invoice context for list endpoints
const allPayments = () =>
  invoices.flatMap((inv) =>
    (inv.payments ?? []).map((p) => ({
      ...p,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      patientName: inv.patientName,
    }))
  );

export const billingHandlers = [
  http.get("**/api/billing/invoices", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const filtered =
      !status || status === "ALL"
        ? invoices
        : invoices.filter((inv) => inv.status === status);
    return HttpResponse.json({
      data: filtered,
      total: filtered.length,
      page: 1,
      size: filtered.length,
    });
  }),

  http.get("**/api/billing/invoices/summary", () => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const unpaid = invoices.filter(
      (inv) => inv.status === "UNPAID" || inv.status === "PARTIALLY_PAID"
    );
    const unpaidCount = unpaid.length;
    const unpaidAmount = unpaid.reduce((sum, inv) => sum + inv.balance, 0);
    const overdue = invoices.filter((inv) => inv.status === "OVERDUE");
    const overdueCount = overdue.length;
    const overdueAmount = overdue.reduce((sum, inv) => sum + inv.balance, 0);

    // Collected this month (COMPLETED payments)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const collectedThisMonth = allPayments().reduce((sum, p) => {
      const date = new Date(p.paymentDate);
      if (date >= startOfMonth && p.status === "COMPLETED") {
        return sum + p.amount;
      }
      return sum;
    }, 0);

    return HttpResponse.json({
      totalInvoices,
      totalAmount,
      unpaidCount,
      unpaidAmount,
      overdueCount,
      overdueAmount,
      collectedThisMonth,
    });
  }),

  http.get("**/api/billing/invoices/:id", ({ params }) => {
    const invoice = invoices.find((i) => i.id === params.id);
    if (!invoice) {
      return HttpResponse.json(
        {
          status: "error",
          error: { code: "INVOICE_NOT_FOUND", message: "Invoice not found" },
        },
        { status: 404 }
      );
    }
    return HttpResponse.json(invoice);
  }),

  http.get("**/api/billing/invoices/by-patient/:patientId", ({ params }) => {
    const filtered = invoices.filter((i) => i.patientId === params.patientId);
    return HttpResponse.json({
      data: filtered,
      total: filtered.length,
      page: 1,
      size: filtered.length,
    });
  }),

  http.get("**/api/billing/payments/by-invoice/:id", ({ params }) => {
    const invoice = invoices.find((i) => i.id === params.id);
    if (!invoice) {
      return HttpResponse.json(
        {
          status: "error",
          error: { code: "INVOICE_NOT_FOUND", message: "Invoice not found" },
        },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      payments: invoice.payments ?? [],
      totalPaid: invoice.paidAmount,
      invoiceTotal: invoice.totalAmount,
      remainingBalance: invoice.totalAmount - invoice.paidAmount,
    });
  }),

  http.get("**/api/billing/payments/:id", ({ params }) => {
    const payment = allPayments().find((p) => p.id === params.id);
    if (!payment) {
      return HttpResponse.json(
        {
          status: "error",
          error: { code: "PAYMENT_NOT_FOUND", message: "Payment not found" },
        },
        { status: 404 }
      );
    }
    return HttpResponse.json(payment);
  }),

  http.get("**/api/billing/payments", ({ request }) => {
    const url = new URL(request.url);
    const method = url.searchParams.get("method");
    const search = url.searchParams.get("search")?.toLowerCase();
    let payments = allPayments();

    if (method && method !== "ALL") {
      payments = payments.filter((p) => p.method === method);
    }
    if (search) {
      payments = payments.filter(
        (p) =>
          p.invoiceNumber.toLowerCase().includes(search) ||
          p.patientName.toLowerCase().includes(search)
      );
    }

    return HttpResponse.json({
      data: payments,
      total: payments.length,
      page: 1,
      size: payments.length,
    });
  }),

  http.post("**/api/billing/payments", async ({ request }) => {
    const body = await request.json();
    const invoice = invoices.find((i) => i.id === body.invoiceId);
    if (!invoice) {
      return HttpResponse.json(
        {
          status: "error",
          error: { code: "INVOICE_NOT_FOUND", message: "Invoice not found" },
        },
        { status: 404 }
      );
    }

    const remaining = invoice.totalAmount - invoice.paidAmount;
    if (body.amount > remaining) {
      return HttpResponse.json(
        {
          status: "error",
          error: {
            code: "AMOUNT_EXCEEDS_BALANCE",
            message: "Amount exceeds remaining balance",
          },
        },
        { status: 400 }
      );
    }

    invoice.paidAmount += body.amount;
    invoice.balance = invoice.totalAmount - invoice.paidAmount;
    invoice.status =
      invoice.paidAmount >= invoice.totalAmount
        ? "PAID"
        : invoice.status === "UNPAID"
        ? "PARTIALLY_PAID"
        : invoice.status;

    const payment = {
      id: `pay-${Date.now()}`,
      amount: body.amount,
      method: body.method,
      status: "COMPLETED",
      paymentDate: new Date().toISOString(),
      notes: body.notes,
    };
    invoice.payments = [...(invoice.payments ?? []), payment];

    return HttpResponse.json(payment, { status: 201 });
  }),

  http.post("**/api/billing/invoices/:id/cancel", async ({ params, request }) => {
    const invoice = invoices.find((i) => i.id === params.id);
    if (!invoice) {
      return HttpResponse.json(
        {
          status: "error",
          error: { code: "INVOICE_NOT_FOUND", message: "Invoice not found" },
        },
        { status: 404 }
      );
    }
    if (invoice.status !== "UNPAID" || (invoice.payments ?? []).length > 0) {
      return HttpResponse.json(
        {
          status: "error",
          error: {
            code: "INVOICE_NOT_CANCELLABLE",
            message: "Only unpaid invoices without payments can be cancelled",
          },
        },
        { status: 400 }
      );
    }
    const body = await request.json();
    invoice.status = "CANCELLED";
    invoice.notes = `Cancelled: ${body?.reason || ""}`;
    return HttpResponse.json(invoice);
  }),
];
