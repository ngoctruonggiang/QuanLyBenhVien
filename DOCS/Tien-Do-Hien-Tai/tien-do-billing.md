📋 Tổng kết tiến độ Billing Service theo fe-spec (Cập nhật)
✅ ĐÃ TRIỂN KHAI

1. Pages (Trang) - 7/7 ✅
   Route Component Trạng thái
   /admin/billing InvoiceListPage ✅ Đã có
   /admin/billing/{id} InvoiceDetailPage ✅ Đã có
   /admin/billing/{id}/payment PaymentFormPage ✅ Đã có
   /admin/billing/payments PaymentListPage ✅ Đã có
   /patient/billing PatientInvoiceListPage ✅ MỚI
   /patient/billing/{id} PatientInvoiceDetailPage ✅ MỚI
   /patient/billing/{id}/pay PatientPaymentPage ✅ MỚI
2. Shared Components - 8/9 ✅
   Component Trạng thái Ghi chú
   InvoiceStatusBadge ✅ 5 trạng thái, icons
   ItemTypeBadge ✅ CONSULTATION, MEDICINE, TEST, PROCEDURE, OTHER
   PaymentMethodBadge ✅ Inline trong payments page
   CancelInvoiceDialog ✅ Với validation reason
   PaymentForm ✅ Cải tiến với idempotencyKey, maxAmount
   CurrencyDisplay ✅ MỚI - billing
   InvoiceSummaryCard ✅ MỚI - billing
   PaymentHistoryTable ✅ MỚI - billing
   InvoiceCard (Patient) ⚠️ Inline trong PatientInvoiceListPage
3. Services & Hooks - Hoàn chỉnh ✅
   File Trạng thái Ghi chú
   billing.service.ts ✅ Đầy đủ CRUD mock
   useBilling.ts ✅ + usePatientInvoices MỚI
   billing.ts ✅ Cải tiến với paymentSchemaWithBalance, idempotencyKey
   billing.ts ✅ + idempotencyKey trong CreatePaymentRequest
   index.ts ✅ 3 invoices: UNPAID, PARTIALLY_PAID, PAID
4. Features Payment Form - Hoàn chỉnh ✅
   ✅ Amount validation: > 0 và <= balance due
   ✅ Idempotency key (UUID) tự động generate
   ✅ "Pay Full Balance" quick button
   ✅ Notes với max 1000 ký tự
5. Features Patient Portal - Hoàn chỉnh ✅
   ✅ Danh sách hóa đơn của bệnh nhân
   ✅ Bộ lọc theo status (ALL, UNPAID, PARTIALLY_PAID, PAID, OVERDUE)
   ✅ Chi tiết hóa đơn (read-only)
   ✅ Payment History Table
   ✅ Overdue warning banner
   ✅ Nút "Thanh toán" cho UNPAID/PARTIALLY_PAID/OVERDUE
   ✅ Nút "Tải biên lai" (stub) cho PAID
6. E2E Tests - Hoàn chỉnh ✅
   ✅ Admin: Danh sách hóa đơn với filters
   ✅ Admin: Bộ lọc trạng thái đầy đủ
   ✅ Admin: Chi tiết hóa đơn
   ✅ Admin: Cancel invoice dialog
   ✅ Admin: Form thanh toán với validation
   ✅ Patient: Danh sách hóa đơn
   ✅ Patient: Chi tiết hóa đơn
   ✅ Patient: Thanh toán với validation
   ⚠️ CẦN BỔ SUNG / CẢI THIỆN
7. Mock Data
   Thiếu Ghi chú
   ❌ Invoice OVERDUE Cần thêm 1 invoice quá hạn
   ❌ Invoice CANCELLED Cần thêm 1 invoice đã hủy
8. Patient Portal
   Thiếu Ghi chú
   ⚠️ Patient ID cứng Đang hardcode patientId = "p-1", cần lấy từ auth
   ⚠️ Access control Chưa có check 403 cho invoices của người khác
9. Các features khác
   Thiếu Ghi chú
   ❌ Print Invoice (PDF) Button có nhưng chưa implement
   ❌ Download Receipt (PDF) Button stub, chưa implement
   ⚠️ InvoiceSummaryCard lỗi syntax Có typo </CardContent} thay vì </CardContent>
   📊 Tiến độ tổng thể: ~90% ⬆️
   Hạng mục Hoàn thành
   Admin Pages 4/4 ✅
   Patient Pages 3/3 ✅
   Components 8/9 ✅
   Services/Hooks ✅
   Validation ✅
   Mock Data ⚠️ Thiếu OVERDUE, CANCELLED
   E2E Tests ✅
   🔧 Đề xuất tiếp theo (ưu tiên)
   Sửa lỗi syntax trong InvoiceSummaryCard.tsx (dòng 55: </CardContent} → </CardContent>)
   Thêm mock data cho OVERDUE và CANCELLED invoices
   Tích hợp auth để lấy patientId thực từ session
   Implement PDF cho Print Invoice / Download Receipt
