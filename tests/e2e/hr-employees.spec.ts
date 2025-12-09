import { test, expect } from "@playwright/test";

/**
 * E2E HR - Employees (Admin)
 * Giả định: mock/seed data sẵn; bypass auth admin.
 */

test.describe("HR - Employees", () => {
  test("Danh sách + search + filter dept/role/status", async ({ page }) => {
    await page.goto("/admin/hr/employees");
    await expect(
      page.getByRole("heading", { name: /Employees/i }),
    ).toBeVisible();

    await page.getByPlaceholder(/Search/i).fill("Nguyen");
    await page.waitForTimeout(300);

    await page.getByText(/Department/i).click();
    await expect(page.getByRole("option").first()).toBeVisible();

    await page.getByText(/Role/i).click();
    await expect(page.getByRole("option", { name: /DOCTOR/i })).toBeVisible();

    await page.getByText(/Status/i).click();
    await expect(page.getByRole("option", { name: /ACTIVE/i })).toBeVisible();
  });

  test("Create employee (validate rỗng)", async ({ page }) => {
    await page.goto("/admin/hr/employees");
    await page.getByRole("button", { name: /Add Employee/i }).click();
    await page.getByRole("button", { name: /Save/i }).click();
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test("Edit employee", async ({ page }) => {
    await page.goto("/admin/hr/employees");
    await page.locator("tbody tr").first().click();
    await expect(page.getByRole("button", { name: /Save/i })).toBeVisible();
  });

  test("Delete employee (happy path hoặc error)", async ({ page }) => {
    await page.goto("/admin/hr/employees");
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
