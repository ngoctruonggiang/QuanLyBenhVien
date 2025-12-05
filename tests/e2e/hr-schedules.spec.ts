import { test, expect } from "@playwright/test";

/**
 * E2E HR - Schedules (Admin)
 * Giả định: mock/seed data; calendar week/month view.
 */

test.describe("HR - Schedules", () => {
  test("View calendar week/month và filter", async ({ page }) => {
    await page.goto("/admin/hr/schedules");
    await expect(page.getByRole("heading", { name: /Schedules/i })).toBeVisible();

    await page.getByRole("button", { name: /Week/i }).click();
    await expect(page.getByText(/Mon|Tue|Wed/i).first()).toBeVisible();

    await page.getByRole("button", { name: /Month/i }).click();
    await expect(page.getByText(/1|2|3/).first()).toBeVisible();

    await page.getByText(/Department/i).click();
    await expect(page.getByRole("option").first()).toBeVisible();

    await page.getByText(/Employee/i).click();
    await expect(page.getByRole("option").first()).toBeVisible();
  });

  test("Create schedule (validate rỗng)", async ({ page }) => {
    await page.goto("/admin/hr/schedules");
    await page.getByRole("button", { name: /New Schedule/i }).click();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test("Edit/Delete schedule (tùy availability)", async ({ page }) => {
    await page.goto("/admin/hr/schedules");
    const editBtn = page.getByRole("button", { name: /Edit/i }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await expect(page.getByRole("button", { name: /Save/i })).toBeVisible();
    }

    const deleteBtn = page.getByRole("button", { name: /Delete/i }).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      const confirm = page.getByRole("button", { name: /Confirm|Yes/i });
      if (await confirm.isVisible()) {
        await confirm.click();
      }
    }
  });
});
