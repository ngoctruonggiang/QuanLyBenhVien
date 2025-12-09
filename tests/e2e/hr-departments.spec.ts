import { test, expect } from "@playwright/test";

/**
 * E2E HR - Departments (Admin)
 * Giả định: mock/seed data sẵn; bypass auth admin.
 */

test.describe("HR - Departments", () => {
  test("Danh sách + filter + search + pagination", async ({ page }) => {
    await page.goto("/admin/hr/departments");
    await expect(
      page.getByRole("heading", { name: /Departments/i }),
    ).toBeVisible();

    await expect(page.getByPlaceholder(/Search/i)).toBeVisible();
    await page.getByPlaceholder(/Search/i).fill("Cardio");
    await page.waitForTimeout(300);
    await expect(page.locator("table")).toBeVisible();

    await page.getByText(/Status/i).click();
    await expect(page.getByRole("option", { name: /ACTIVE/i })).toBeVisible();

    await expect(page.getByText(/Next/i).first()).toBeVisible(); // pagination controls
  });

  test("Tạo mới department (validate rỗng)", async ({ page }) => {
    await page.goto("/admin/hr/departments");
    await page.getByRole("button", { name: /Add Department/i }).click();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test("Edit department", async ({ page }) => {
    await page.goto("/admin/hr/departments");
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();
    await expect(page.getByRole("button", { name: /Save/i })).toBeVisible();
  });

  test("Delete department (happy path hoặc error)", async ({ page }) => {
    await page.goto("/admin/hr/departments");
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
