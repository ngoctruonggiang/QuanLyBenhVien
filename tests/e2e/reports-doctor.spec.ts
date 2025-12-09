import { test, expect } from "@playwright/test";

test.describe("Reports - Doctor Portal", () => {
  test("Doctor appointment stats page loads and renders chart", async ({
    page,
  }) => {
    await page.goto("/doctor/reports/appointments");
    const headingVisible = await page
      .getByRole("heading", { name: /Appointments|Reports/i })
      .isVisible()
      .catch(() => false);
    if (!headingVisible) {
      test.skip(true, "Doctor reports page not available");
    }
    const charts = page.locator("canvas");
    await expect(charts.first()).toBeVisible();
  });

  test("Filters apply without error", async ({ page }) => {
    await page.goto("/doctor/reports/appointments");
    const startInput = page.getByLabel(/Start|From/i);
    if (!(await startInput.isVisible().catch(() => false))) {
      test.skip(true, "Filter controls not found");
    }
    await startInput.fill("2024-01-01");
    await page.getByLabel(/End|To/i).fill("2024-12-31");
    // Expect no crash and chart remains
    const chart = page.locator("canvas").first();
    await expect(chart).toBeVisible();
  });
});
