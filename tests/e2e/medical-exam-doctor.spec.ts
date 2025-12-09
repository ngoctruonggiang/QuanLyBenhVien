import { test, expect } from "@playwright/test";

const APPOINTMENT_ID = process.env.DOCTOR_APPOINTMENT_ID || "apt-001";

test.describe("Medical Exam - Doctor flow", () => {
  test("Doctor creates exam from appointment", async ({ page }) => {
    await page.goto(`/doctor/appointments/${APPOINTMENT_ID}/exam`);
    await expect(page.getByText(/Khám bệnh/i)).toBeVisible();

    // Fill minimal required fields
    await page.getByLabel(/Triệu chứng/i).fill("Ho, sốt nhẹ");
    await page.getByLabel(/Chẩn đoán/i).fill("Cảm cúm");
    await page.getByLabel(/Phác đồ điều trị/i).fill("Nghỉ ngơi, uống nước");
    await page.getByRole("button", { name: /Lưu nháp/i }).click();

    // Expect no crash and remain on page or redirect
    await expect(page).toHaveURL(/exam/);
  });

  test("Doctor exams list shows entries", async ({ page }) => {
    await page.goto("/doctor/exams");
    await expect(
      page.getByRole("heading", { name: /Hồ sơ khám của tôi/i }),
    ).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
  });
});
