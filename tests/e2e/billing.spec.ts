import { test, expect } from "@playwright/test";

/**
 * E2E Tests cho Billing Service
 * Dựa trên: DOCS/dac-ta-giao-dien/fe-spec-billing-service.vi.md
 *
 * Ghi chú:
 * - Cần seed dữ liệu invoice (UNPAID/PARTIALLY_PAID/PAID/OVERDUE/CANCELLED).
 * - Cung cấp env BILLING_INVOICE_ID (admin) và BILLING_PATIENT_INVOICE_ID (patient) để test chi tiết/thu tiền.
 * - Yêu cầu đã login sẵn hoặc bypass auth tương ứng môi trường của bạn.
 */

const ADMIN_INVOICE_ID =
  process.env.BILLING_INVOICE_ID || process.env.ADMIN_INVOICE_ID || "inv-1";
const PATIENT_INVOICE_ID =
  process.env.BILLING_PATIENT_INVOICE_ID || process.env.PATIENT_INVOICE_ID || "inv-1";

test.describe("Billing - Admin", () => {
  test("Danh sách hóa đơn hiển thị bộ lọc & bảng", async ({ page }) => {
    await page.goto("/admin/billing");

    await expect(page.getByRole("heading", { name: /Billing & Invoices/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search by patient or invoice ID/i)).toBeVisible();
    await expect(page.getByText(/All Statuses/i)).toBeVisible();

    // Bộ lọc ngày bắt đầu/kết thúc
    await expect(page.getByRole("button", { name: /Start Date/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /End Date/i })).toBeVisible();

    // Link tới Payment History
    await expect(page.getByRole("link", { name: /Payment History/i })).toBeVisible();

    // Bảng dữ liệu
    await expect(page.locator("table")).toBeVisible();
  });

  test("Bộ lọc trạng thái hiển thị đủ tùy chọn", async ({ page }) => {
    await page.goto("/admin/billing");
    await page.getByText(/All Statuses/i).click();

    await expect(page.getByRole("option", { name: /Unpaid/i })).toBeVisible();
    await expect(page.getByRole("option", { name: /Partially Paid/i })).toBeVisible();
    await expect(page.getByRole("option", { name: /Paid/i })).toBeVisible();
    await expect(page.getByRole("option", { name: /Overdue/i })).toBeVisible();
    await expect(page.getByRole("option", { name: /Cancelled/i })).toBeVisible();
  });

  test.describe("Chi tiết hóa đơn", () => {
    test("Hiển thị chi tiết & hành động theo trạng thái", async ({ page }) => {
      await page.goto(`/admin/billing/${ADMIN_INVOICE_ID}`);

      await expect(page.getByRole("heading", { name: /Invoice Details/i })).toBeVisible();
      await expect(page.getByText(/Invoice #/i)).toBeVisible();
      await expect(page.getByText(/Record Payment/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /Print/i })).toBeVisible();

      // Banner overdue (nếu có)
      // Không bắt buộc, chỉ xác minh không crash
    });

    test("Hủy hóa đơn UNPAID hiển thị dialog", async ({ page }) => {
      await page.goto(`/admin/billing/${ADMIN_INVOICE_ID}`);

      const cancelButton = page.getByRole("button", { name: /Cancel Invoice/i });
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await expect(page.getByText(/Cancellation Reason/i)).toBeVisible();
      } else {
        test.skip("Không ở trạng thái UNPAID hoặc không có nút hủy");
      }
    });
  });

  test.describe("Ghi nhận thanh toán", () => {
    test("Form thanh toán có Amount/Method/Notes và submit", async ({ page }) => {
      await page.goto(`/admin/billing/${ADMIN_INVOICE_ID}/payment`);

      await expect(page.getByRole("heading", { name: /Record Payment/i })).toBeVisible();
      await expect(page.getByLabel(/Payment Amount/i)).toBeVisible();
      await expect(page.getByLabel(/Payment Method/i)).toBeVisible();
      await expect(page.getByLabel(/Notes/i)).toBeVisible();

      // Không submit thật nếu môi trường không mock; chỉ kiểm tra validation rỗng
      await page.getByRole("button", { name: /Record Payment/i }).click();
      await expect(page.getByText(/Amount must be greater than 0/i)).toBeVisible();
    });
  });
});

test.describe("Billing - Patient", () => {
  test("Patient xem danh sách hóa đơn của mình", async ({ page }) => {
    await page.goto(`/patient/billing`);
    await expect(page.getByRole("heading", { name: /Hóa đơn của tôi/i })).toBeVisible();
    await expect(page.getByText(/Hóa đơn #/i).first()).toBeVisible();
  });

  test("Patient xem chi tiết hóa đơn của mình", async ({ page }) => {
    await page.goto(`/patient/billing/${PATIENT_INVOICE_ID}`);

    await expect(page.getByRole("heading", { name: /Hóa đơn #/i })).toBeVisible();
    await expect(page.getByText(/Thanh toán|Tải biên lai|Quá hạn/i)).toBeVisible();
  });

  test("Patient thanh toán", async ({ page }) => {
    await page.goto(`/patient/billing/${PATIENT_INVOICE_ID}/pay`);

    await expect(page.getByRole("heading", { name: /Thanh toán hóa đơn/i })).toBeVisible();
    await expect(page.getByLabel(/Payment Amount/i)).toBeVisible();
    await expect(page.getByLabel(/Payment Method/i)).toBeVisible();

    // Validation amount > 0 enforced; here just check submit without crashing
    await page.getByRole("button", { name: /Record Payment|Thanh toán/i }).click();
    await expect(page.getByText(/Amount must be greater than 0/i)).toBeVisible();
  });
});
