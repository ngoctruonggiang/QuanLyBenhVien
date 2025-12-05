import { test, expect } from "@playwright/test";

/**
 * E2E HR - Doctor Schedules
 * Giả định: doctorId từ localStorage fallback; mock/seed data sẵn.
 */

test.describe("HR - Doctor schedules", () => {
  test("Doctor xem lịch và filter", async ({ page }) => {
    await page.goto("/doctor/schedules");
    await expect(page.getByRole("heading", { name: /Lịch khám của bác sĩ/i })).toBeVisible();

    await page.getByText(/Date Range|Từ ngày/i).first().click();
    await page.getByText(/Hôm nay|Today/i).first().click();

    // Status filter nếu có
    const statusFilter = page.getByText(/Status/i).first();
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await expect(page.getByRole("option").first()).toBeVisible();
    }

    await expect(page.locator("table, [role='grid']")).toBeVisible();
  });
});
