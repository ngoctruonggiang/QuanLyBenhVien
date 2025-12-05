# Billing Service - Đặc tả Frontend (Bản dịch tiếng Việt)

**Dự án:** Hospital Management System  
**Service:** Billing Service (Quản lý Hóa đơn & Thanh toán)  
**Phiên bản:** 1.0  
**Cập nhật:** 4/12/2025  
**Người dùng mục tiêu:** ADMIN (toàn quyền), PATIENT (chỉ hóa đơn của mình)

---

## 1. Tổng quan & Danh mục màn hình

### 1.1 Phạm vi Service
Billing Service quản lý hóa đơn và xử lý thanh toán cho bệnh nhân. Bao gồm:
- Sinh hóa đơn (tự động khi tạo đơn thuốc/prescription)
- Danh sách hóa đơn với bộ lọc (bệnh nhân, trạng thái, khoảng ngày)
- Xem chi tiết hóa đơn (hạng mục, lịch sử thanh toán)
- Ghi nhận thanh toán (Tiền mặt, Thẻ, Chuyển khoản, Bảo hiểm)
- Theo dõi lịch sử thanh toán
- Cổng hóa đơn cho bệnh nhân (xem hóa đơn của mình, thanh toán)

### 1.2 Backend liên quan
| Trường | Giá trị |
| --- | --- |
| **Service** | billing-service |
| **Port** | 8087 |
| **Base Path** | `/api/billing` |
| **Database** | `billing_db` |
| **Tables** | `invoices`, `invoice_items`, `payments` |

### 1.3 Phụ thuộc liên service
| Service | Mục đích | Endpoint dùng |
| --- | --- | --- |
| **Appointment Service** | Tham chiếu lịch hẹn | `GET /api/appointments/{id}` |
| **Patient Service** | Tra cứu bệnh nhân | `GET /api/patients`, `GET /api/patients/{id}` |
| **Medical Exam Service** | Tham chiếu đơn thuốc | `GET /api/exams/{examId}/prescription` |

### 1.4 Danh sách màn hình
| Route | Tên màn | Component | Quyền | Ưu tiên |
| --- | --- | --- | --- | --- |
| `/admin/billing` | Danh sách hóa đơn (Admin) | `InvoiceListPage` | ADMIN | P0 |
| `/admin/billing/{id}` | Chi tiết hóa đơn | `InvoiceDetailPage` | ADMIN | P0 |
| `/admin/billing/{id}/payment` | Ghi nhận thanh toán | `PaymentFormPage` | ADMIN | P0 |
| `/admin/billing/payments` | Lịch sử thanh toán | `PaymentListPage` | ADMIN | P1 |
| `/patient/billing` | Hóa đơn của tôi | `PatientInvoiceListPage` | PATIENT | P0 |
| `/patient/billing/{id}` | Chi tiết hóa đơn (Patient) | `InvoiceDetailPage` | PATIENT | P0 |
| `/patient/billing/{id}/pay` | Thanh toán | `PatientPaymentPage` | PATIENT | P1 |

### 1.5 Cây màn hình
```
/admin/billing
├─ (list tất cả hóa đơn + filter)
├─ /{id} (chi tiết + line items & payments)
├─ /{id}/payment (form ghi nhận thanh toán)
└─ /payments (lịch sử thanh toán)

/patient/billing
├─ (list hóa đơn của chính bệnh nhân)
├─ /{id} (chi tiết chỉ đọc)
└─ /{id}/pay (luồng thanh toán online)
```

### 1.6 Luồng trạng thái hóa đơn
```
UNPAID (tạo từ prescription) 
  ↓ thanh toán một phần
PARTIALLY_PAID
  ↓ thanh toán đủ
PAID (trạng thái cuối, không đổi)

Nhánh khác:
OVERDUE (quá hạn dueDate & chưa PAID, tự cập nhật)
CANCELLED (Admin hủy – hiếm, cần lý do)
```

---

## 2. Luồng người dùng & Tiêu chí chấp nhận

### 2.1 Xem danh sách hóa đơn (Admin)
Flow: vào `/admin/billing` → tải danh sách phân trang → tìm kiếm, lọc trạng thái/ngày, sắp xếp → click dòng để xem chi tiết hoặc “Record Payment”.

Tiêu chí:
- [ ] Tải trang ≤ 2s; skeleton khi loading.
- [ ] Bảng: Invoice #, Patient, Date, Total, Paid, Balance, Status, Actions.
- [ ] Tìm kiếm theo tên bệnh nhân (debounce 300ms).
- [ ] Lọc trạng thái: UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED, All.
- [ ] Lọc ngày: start/end.
- [ ] Phân trang: 10/20/50; Sort: Date (desc mặc định), Total, Status.
- [ ] Empty state khi không có kết quả.
- [ ] Badge trạng thái màu khác biệt.
- [ ] Cột Balance = totalAmount - paidAmount.
- [ ] Quick action “Record Payment” cho UNPAID/PARTIALLY_PAID.

### 2.2 Xem chi tiết hóa đơn (Admin)
Flow: click dòng hoặc `/admin/billing/{id}` → GET invoice → nếu 404 hiển thị trang 404 → hiển thị thông tin → hành động theo trạng thái.

Tiêu chí:
- [ ] Header: Invoice #, Date, Due Date, Status.
- [ ] Thông tin bệnh nhân.
- [ ] Bảng line items: Type, Description, Qty, Unit Price, Amount.
- [ ] Tổng hợp: Subtotal, Discount, Tax (10%), Total.
- [ ] Tổng quan thanh toán: Total, Paid, Balance.
- [ ] Lịch sử thanh toán (nếu có).
- [ ] Nút “Record Payment” cho UNPAID/PARTIALLY_PAID.
- [ ] Nút “Cancel Invoice” cho UNPAID (modal + lý do).
- [ ] “Print Invoice” cho mọi trạng thái.
- [ ] Link đến appointment/exam liên quan.
- [ ] OVERDUE hiển thị banner cảnh báo số ngày trễ.

### 2.3 Ghi nhận thanh toán (Admin)
Flow: click “Record Payment” → `/admin/billing/{id}/payment` → form + tóm tắt hóa đơn → nhập Amount/Method/Notes → submit → sinh idempotencyKey → POST `/api/billing/payments` → toast thành công hoặc lỗi.

Tiêu chí:
- [ ] Tóm tắt hóa đơn: Patient, Total, Paid, Balance.
- [ ] Amount mặc định = Balance, cho sửa; >0 và ≤ Balance.
- [ ] Phương thức: CASH, CREDIT_CARD, BANK_TRANSFER, INSURANCE (radio).
- [ ] Notes optional, ≤1000 ký tự.
- [ ] Sinh UUID idempotency key khi load form.
- [ ] Nút “Full Payment” set amount = balance.
- [ ] Success: toast “Payment recorded successfully”, redirect chi tiết.
- [ ] Lỗi 409 DUPLICATE_PAYMENT: “Payment already processed”.
- [ ] Lỗi 409 INVOICE_ALREADY_PAID: “Invoice is already fully paid”.
- [ ] Lỗi 409 INVOICE_CANCELLED: “Cannot pay a cancelled invoice”.
- [ ] Lỗi amount > balance: “Amount exceeds remaining balance”.
- [ ] Nút Cancel quay lại chi tiết, không lưu.

### 2.4 Xem hóa đơn của tôi (Patient)
Flow: `/patient/billing` → load hóa đơn của bệnh nhân đăng nhập → hiển thị card (ưu tiên Unpaid) → filter trạng thái → click card xem chi tiết.

Tiêu chí:
- [ ] Tự lọc theo patient hiện tại.
- [ ] Unpaid/Partially Paid hiển thị trước, được nhấn mạnh.
- [ ] Card: Invoice #, Date, Total, Status, Balance.
- [ ] Filter trạng thái: All, Unpaid, Paid.
- [ ] OVERDUE có cảnh báo.
- [ ] “Pay Now” nhanh nếu bật thanh toán online.
- [ ] Empty: “No invoices found”.

### 2.5 Chi tiết hóa đơn (Patient)
Flow: click card hoặc `/patient/billing/{id}` → kiểm tra quyền sở hữu → hiển thị chi tiết → hành động tùy trạng thái.

Tiêu chí:
- [ ] Chỉ xem hóa đơn của mình (403 nếu không phải).
- [ ] Chi tiết giống admin nhưng read-only.
- [ ] Lịch sử thanh toán.
- [ ] Nút “Pay Now” cho UNPAID/PARTIALLY_PAID (đi trang pay).
- [ ] “Download Receipt” cho PAID (PDF).
- [ ] Không có cancel/edit cho patient.

### 2.6 Thanh toán (Patient)
Flow: “Pay Now” → `/patient/billing/{id}/pay` → form + tóm tắt → nhập Amount/Method → submit → nếu online chuyển gateway, nếu “Pay at Counter” hiển thị hướng dẫn → xử lý callback.

Tiêu chí:
- [ ] Tóm tắt: Total, Balance.
- [ ] Amount mặc định = Balance, cho phép trả một phần.
- [ ] Phương thức: Credit Card, Bank Transfer (online), Pay at Counter (offline hướng dẫn).
- [ ] Sinh idempotency key.
- [ ] Success: xác nhận + cập nhật trạng thái.
- [ ] Lỗi giống luồng admin.
- [ ] Biên lai hiển thị/gửi email.

### 2.7 Lịch sử thanh toán (Admin)
Flow: `/admin/billing/payments` → list phân trang → filter method, date range, search invoice → click dòng mở hóa đơn.

Tiêu chí:
- [ ] Bảng: Payment ID, Invoice #, Patient, Amount, Method, Date, Status.
- [ ] Lọc method: All, CASH, CREDIT_CARD, BANK_TRANSFER, INSURANCE.
- [ ] Lọc ngày; search theo invoice number.
- [ ] Sort: Date (desc), Amount.
- [ ] Click dòng → chi tiết hóa đơn.
- [ ] Thống kê tổng hợp ngày/tuần.

### 2.8 Hủy hóa đơn (Admin)
Flow: click “Cancel Invoice” trên UNPAID → modal + lý do bắt buộc → xác nhận → PATCH/logic hủy → toast kết quả; lỗi hiển thị.

Tiêu chí:
- [ ] Chỉ UNPAID được hủy.
- [ ] Lý do bắt buộc, copy cảnh báo.
- [ ] Lỗi INVOICE_NOT_CANCELLABLE: không hủy được (đã trả/đã hủy).
- [ ] Lỗi INVOICE_ALREADY_PAID: không hủy hóa đơn đã thanh toán.

### 2.9 Tự động cập nhật trạng thái
- OVERDUE: hệ thống đánh dấu khi quá dueDate và chưa PAID.
- Sau thanh toán: cập nhật UNPAID → PARTIALLY_PAID → PAID; nếu partial nhiều lần, cuối cùng PAID khi balance = 0.

---

## 3. API & Validation

### 3.1 Định dạng lỗi chuẩn
```typescript
interface ApiErrorResponse {
  status: "error";
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
```

### 3.2 Mã lỗi chính
#### Xác thực/Phân quyền
| HTTP | Mã | Mô tả | UI |
| --- | --- | --- | --- |
| 401 | UNAUTHORIZED | Thiếu/sai token | Redirect /login, clear auth |
| 403 | FORBIDDEN | Không đủ quyền | Toast “Bạn không có quyền” |
| 403 | FORBIDDEN | Patient chỉ xem hóa đơn của mình | Trang 403 |
| 403 | FORBIDDEN | Patient chỉ trả hóa đơn của mình | Toast lỗi |

#### Validation (400 VALIDATION_ERROR)
**Create Payment:**
| Field | Rule | Thông báo |
| --- | --- | --- |
| invoiceId | Required | "invoiceId is required" |
| idempotencyKey | Required | "idempotencyKey is required" |
| idempotencyKey | UUID hợp lệ | "idempotencyKey must be valid UUID format" |
| amount | Required, >0 | "amount must be positive (> 0)" |
| amount | ≤ balance | "amount cannot exceed invoice remaining balance" |
| method | Required, enum | "method must be one of [CASH, CREDIT_CARD, BANK_TRANSFER, INSURANCE]" |
| notes | Max 1000 | "notes exceeds maximum length (1000 characters)" |

**Query list:**
| Param | Rule | Thông báo |
| --- | --- | --- |
| page | ≥0 | "page must be >= 0" |
| size | 1–100 | "size must be between 1 and 100" |
| startDate/endDate | ISO date | "startDate/endDate must be valid ISO 8601 date" |
| range | start ≤ end | "startDate cannot be after endDate" |
| status | Enum | "status must be one of [UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED]" |

#### Business
| HTTP | Mã | Mô tả | Khi xảy ra | UI |
| --- | --- | --- | --- | --- |
| 400 | PRESCRIPTION_NOT_FOUND | Không có prescription cho appointment | Sinh invoice từ appointment không có đơn thuốc | Toast lỗi |
| 409 | INVOICE_EXISTS | Hóa đơn đã tồn tại | Sinh trùng | Toast info, chuyển đến hóa đơn cũ |
| 409 | DUPLICATE_PAYMENT | Idempotency trùng | Retry cùng key | Trả về payment đã xử lý |
| 409 | INVOICE_ALREADY_PAID | Đã trả đủ | Thanh toán hóa đơn đã PAID | Toast info |
| 409 | INVOICE_CANCELLED | Hóa đơn đã hủy | Thanh toán hóa đơn hủy | Toast lỗi |

#### Not Found (404)
| Mã | Mô tả | Khi | UI |
| --- | --- | --- | --- |
| INVOICE_NOT_FOUND | Không tìm thấy hóa đơn | Get/Pay ID sai | Trang 404 |
| APPOINTMENT_NOT_FOUND | Không có appointment | Sinh invoice từ appointment sai | Toast lỗi |
| PATIENT_NOT_FOUND | Không có bệnh nhân | Lấy hóa đơn bệnh nhân ID sai | Trang 404 |
| PAYMENT_NOT_FOUND | Không có payment | Lấy payment ID sai | Trang 404 |

### 3.3 Validation client (Zod)
```typescript
import { z } from "zod";

export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  idempotencyKey: z.string().uuid("Invalid idempotency key format"),
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.enum(["CASH", "CREDIT_CARD", "BANK_TRANSFER", "INSURANCE"], {
    required_error: "Please select a payment method",
  }),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

export const createPaymentSchemaWithBalance = (balanceDue: number) =>
  createPaymentSchema.extend({
    amount: z
      .number()
      .positive("Amount must be greater than 0")
      .max(balanceDue, "Amount cannot exceed remaining balance"),
  });

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
```

### 3.4 Tiện ích hiển thị lỗi
```typescript
// utils/billingErrors.ts
export function handleBillingError(error: any, defaultMessage = "An error occurred") {
  const errorCode = error.response?.data?.error?.code;
  const errorMessage = error.response?.data?.error?.message;

  const errorMessages: Record<string, string> = {
    UNAUTHORIZED: "Please log in to continue",
    FORBIDDEN: "You do not have permission to perform this action",
    VALIDATION_ERROR: errorMessage || "Please check your input",
    INVOICE_NOT_FOUND: "Invoice not found",
    APPOINTMENT_NOT_FOUND: "Appointment not found",
    PRESCRIPTION_NOT_FOUND: "No prescription found for this appointment",
    PATIENT_NOT_FOUND: "Patient not found",
    PAYMENT_NOT_FOUND: "Payment not found",
    INVOICE_EXISTS: "Invoice already exists for this appointment",
    DUPLICATE_PAYMENT: "Payment already processed",
    INVOICE_ALREADY_PAID: "Invoice is already fully paid",
    INVOICE_CANCELLED: "Cannot process payment for cancelled invoice",
  };

  const message = errorMessages[errorCode] || errorMessage || defaultMessage;
  if (["DUPLICATE_PAYMENT", "INVOICE_ALREADY_PAID"].includes(errorCode)) {
    toast.info(message);
  } else {
    toast.error(message);
  }
  return message;
}
```

### 3.5 Loading & Empty states
**Loading:**
| Trạng thái | UI |
| --- | --- |
| Initial load | Skeleton cho table/cards |
| Form submit | Disable + spinner “Processing…” |
| Payment processing | Overlay toàn màn “Processing payment…” |
| Refetch | Chỉ indicator nhẹ (không skeleton toàn phần) |

**Empty:**
| Ngữ cảnh | Thông điệp | Hành động |
| --- | --- | --- |
| Admin không có hóa đơn | "No invoices found" | "Adjust filters" |
| Patient không có hóa đơn | "You don't have any invoices yet" | - |
| Patient không có hóa đơn nợ | "All caught up! No outstanding bills" | - |
| Hóa đơn chưa có thanh toán | "No payments recorded yet" | Nút "Record Payment" |

---

## 4. Thành phần UI (Components) – trích lược chính

> Lưu ý: Code block giữ nguyên tiếng Anh để tránh sai cú pháp.

### 4.1 Badge trạng thái hóa đơn
```typescript
// components/billing/InvoiceStatusBadge.tsx
type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
const statusConfig = { /* ...class + label theo trạng thái... */ };
```

### 4.2 Badge loại hạng mục (ItemType)
```typescript
// components/billing/ItemTypeBadge.tsx
type ItemType = "CONSULTATION" | "MEDICINE" | "TEST" | "OTHER";
```

### 4.3 Badge phương thức thanh toán
```typescript
// components/billing/PaymentMethodBadge.tsx
type PaymentMethod = "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "INSURANCE";
```

### 4.4 Badge trạng thái thanh toán
```typescript
// components/billing/PaymentStatusBadge.tsx
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
```

### 4.5 CurrencyDisplay
```typescript
// components/billing/CurrencyDisplay.tsx
// Hiển thị tiền tệ, mặc định VND locale vi-VN
```

### 4.6 InvoiceSummaryCard
```typescript
// components/billing/InvoiceSummaryCard.tsx
// Tóm tắt invoice: số hóa đơn, bệnh nhân, tổng, đã trả, còn nợ
```

### 4.7 PaymentHistoryTable
```typescript
// components/billing/PaymentHistoryTable.tsx
// Bảng lịch sử thanh toán + tổng đã trả + còn nợ
```

### 4.8 Hook IdempotencyKeyProvider
```typescript
// hooks/useIdempotencyKey.ts
// Sinh và reset UUID để phòng double submit payment
```

### 4.9 InvoiceCard (Patient view)
```typescript
// components/billing/InvoiceCard.tsx
// Card cho patient: badge trạng thái, View/Pay Now nếu cần
```

---

## 5. Xử lý lỗi & Validation (tiếp)

### 5.1 Định dạng lỗi API
*(Đã nêu ở 3.1; nhắc lại để tiện tra cứu.)*

### 5.2 Mã lỗi đầy đủ
- AUTHZ: UNAUTHORIZED, FORBIDDEN.
- VALIDATION_ERROR: theo bảng 3.2.
- BUSINESS: PRESCRIPTION_NOT_FOUND, INVOICE_EXISTS, DUPLICATE_PAYMENT, INVOICE_ALREADY_PAID, INVOICE_CANCELLED.
- NOT FOUND: INVOICE_NOT_FOUND, APPOINTMENT_NOT_FOUND, PATIENT_NOT_FOUND, PAYMENT_NOT_FOUND.

### 5.3 Schema Zod (createPayment)  
*(Đã liệt kê ở 3.3, giữ nguyên code block.)*

### 5.4 Tiện ích hiển thị lỗi  
*(Đã liệt kê ở 3.4.)*

### 5.5 Loading/Empty  
*(Đã liệt kê ở 3.5.)*

---

## Phụ lục A: Interface TypeScript
```typescript
// interfaces/billing.ts
export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
export type ItemType = "CONSULTATION" | "MEDICINE" | "TEST" | "OTHER";
export type PaymentMethod = "CASH" | "CREDIT_CARD" | "BANK_TRANSFER" | "INSURANCE";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface PatientSummary { id: string; fullName: string; }
export interface AppointmentSummary { id: string; appointmentTime: string; }
export interface InvoiceSummary { id: string; invoiceNumber: string; totalAmount: number; }

export interface InvoiceItem {
  id: string;
  type: ItemType;
  description: string;
  referenceId: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patient: PatientSummary;
  appointment: AppointmentSummary | null;
  invoiceDate: string;
  dueDate: string | null;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  patient: PatientSummary;
  invoiceDate: string;
  dueDate: string | null;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
}

export interface Payment {
  id: string;
  invoice: InvoiceSummary;
  idempotencyKey: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  paymentDate: string;
  createdAt: string;
}

export interface PaymentListItem {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
}

export interface PaymentsByInvoice {
  payments: PaymentListItem[];
  totalPaid: number;
  invoiceTotal: number;
  remainingBalance: number;
}

export interface GenerateInvoiceRequest { appointmentId: string; }
export interface CreatePaymentRequest {
  invoiceId: string;
  idempotencyKey: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

export interface InvoiceListParams {
  patientId?: string;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PatientInvoiceParams {
  status?: InvoiceStatus;
  page?: number;
  size?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

---

## Phụ lục B: Checklist triển khai

### B.1 Pages
- [ ] `/admin/billing` - InvoiceListPage  
- [ ] `/admin/billing/{id}` - InvoiceDetailPage  
- [ ] `/admin/billing/{id}/payment` - PaymentFormPage  
- [ ] `/admin/billing/payments` - PaymentListPage  
- [ ] `/patient/billing` - PatientInvoiceListPage  
- [ ] `/patient/billing/{id}` - InvoiceDetailPage (patient context)  
- [ ] `/patient/billing/{id}/pay` - PatientPaymentPage  

### B.2 Components
- [ ] InvoiceStatusBadge
- [ ] ItemTypeBadge
- [ ] PaymentMethodBadge
- [ ] PaymentStatusBadge
- [ ] InvoiceCard
- [ ] InvoiceSummaryCard
- [ ] PaymentHistoryTable
- [ ] CurrencyDisplay
- [ ] InvoiceItemsTable

### B.3 Services & Hooks
- [ ] billing.service.ts
- [ ] useBilling.ts (React Query)
- [ ] useIdempotencyKey.ts

### B.4 API cần tích hợp
**Invoice:**
- [ ] POST `/api/billing/invoices/generate` (internal)
- [ ] GET `/api/billing/invoices/{id}`
- [ ] GET `/api/billing/invoices/by-appointment/{appointmentId}`
- [ ] GET `/api/billing/invoices` (admin list)
- [ ] GET `/api/billing/invoices/by-patient/{patientId}`

**Payment:**
- [ ] POST `/api/billing/payments`
- [ ] GET `/api/billing/payments/{id}`
- [ ] GET `/api/billing/payments/by-invoice/{invoiceId}`

### B.5 Tích hợp liên service
- [ ] GET `/api/appointments/{id}`
- [ ] GET `/api/patients/{id}`
- [ ] GET `/api/exams/{examId}/prescription`

### B.6 Kịch bản kiểm thử
**Happy Path:**
- [ ] Xem list hóa đơn + filter
- [ ] Xem chi tiết + line items
- [ ] Ghi nhận full payment (UNPAID → PAID)
- [ ] Ghi nhận partial (UNPAID → PARTIALLY_PAID)
- [ ] Thanh toán lần 2 (PARTIALLY_PAID → PAID)
- [ ] Patient xem list/chi tiết hóa đơn của mình
- [ ] In/tải hóa đơn

**Error:**
- [ ] Hiển thị lỗi validation
- [ ] Xử lý DUPLICATE_PAYMENT (idempotency)
- [ ] Xử lý INVOICE_ALREADY_PAID
- [ ] Xử lý INVOICE_CANCELLED
- [ ] Kiểm tra amount > balance
- [ ] FORBIDDEN, 404

**Edge:**
- [ ] Patient chỉ xem/trả hóa đơn của mình
- [ ] Idempotency key chống double payment
- [ ] Độ chính xác tính Balance
- [ ] Auto-update trạng thái sau thanh toán
- [ ] OVERDUE hiển thị cảnh báo
- [ ] Định dạng tiền tệ nhất quán

---

*Kết thúc đặc tả Billing Service (FE) – Bản dịch tiếng Việt. Bản gốc tiếng Anh nằm tại `DOCS/fe-specs/fe-spec-billing-service.md`.*
