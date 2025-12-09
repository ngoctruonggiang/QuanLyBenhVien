import { test, expect } from "@playwright/test";

const APPOINTMENT_ID = process.env.PATIENT_APPOINTMENT_ID || "apt-001";

test.describe("Medical Exam - Patient view", () => {
  test("Patient views exam result or pending notice", async ({ page }) => {
    await page.goto(`/patient/appointments/${APPOINTMENT_ID}/exam`);

    const hasExam = await page
      .getByText(/Kết quả khám bệnh/i)
      .isVisible()
      .catch(() => false);
    if (hasExam) {
      await expect(
        page.getByText(/Đơn thuốc|Phác đồ điều trị|Chẩn đoán/i),
      ).toBeVisible();
    } else {
      await expect(page.getByText(/Exam not available yet/i)).toBeVisible();
    }
  });
});
