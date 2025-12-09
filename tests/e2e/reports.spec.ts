import { test, expect } from "@playwright/test";

test.describe("Reports - Admin", () => {
  test("Dashboard cards & refresh", async ({ page }) => {
    await page.goto("/admin/reports");
    await expect(
      page.getByRole("heading", { name: /Reports|Dashboard/i }),
    ).toBeVisible();
    const cards = page.locator("[data-testid='metric-card']");
    await expect(cards).toHaveCountGreaterThan(0);
    const refresh = page.getByRole("button", {
      name: /Refresh|Clear Cache|Reload/i,
    });
    if (await refresh.isVisible()) {
      await refresh.click();
    }
  });

  test("Revenue report filters and charts", async ({ page }) => {
    await page.goto("/admin/reports/revenue");
    await expect(page.getByRole("heading", { name: /Revenue/i })).toBeVisible();
    await page.getByLabel(/Start|From/i).fill("2024-01-01");
    await page.getByLabel(/End|To/i).fill("2024-12-31");
    await page.getByText(/Department|Khoa/i).click();
    await page.keyboard.press("Escape");
    const chart = page.locator("canvas");
    await expect(chart.first()).toBeVisible();
  });

  test("Appointment stats with all charts", async ({ page }) => {
    await page.goto("/admin/reports/appointments");
    await expect(
      page.getByRole("heading", { name: /Appointment/i }),
    ).toBeVisible();
    const charts = page.locator("canvas");
    await expect(charts.nth(0)).toBeVisible();
    await expect(charts.nth(1)).toBeVisible();
    await expect(charts.nth(2)).toBeVisible();
    await expect(charts.nth(3)).toBeVisible();
  });

  test("Doctor performance table and modal", async ({ page }) => {
    await page.goto("/admin/reports/doctors/performance");
    await expect(
      page.getByRole("heading", { name: /Doctor Performance/i }),
    ).toBeVisible();
    const table = page.locator("table");
    await expect(table).toBeVisible();
    const firstRow = table.locator("tbody tr").first();
    if (await firstRow.count()) {
      await firstRow.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
    }
  });

  test("Patient activity demographics and trend", async ({ page }) => {
    await page.goto("/admin/reports/patients/activity");
    await expect(
      page.getByRole("heading", { name: /Patient Activity/i }),
    ).toBeVisible();
    const charts = page.locator("canvas");
    await expect(charts.first()).toBeVisible();
    await expect(charts.nth(1)).toBeVisible();
  });
});
