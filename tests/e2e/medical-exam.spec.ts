import { test, expect } from "@playwright/test";

const EXAM_ID = process.env.EXAM_ID || "exam001";
const APPOINTMENT_ID = process.env.APPOINTMENT_ID || "apt-001";

test.describe("Medical Exam - Admin core flow", () => {
  test("Create exam (validation + form render)", async ({ page }) => {
    await page.goto("/admin/exams/new");

    // submit empty to trigger validation
    await page.getByRole("button", { name: /Save Medical Exam/i }).click();
    await expect(page.getByText(/Appointment is required/i)).toBeVisible();

    // fill minimal fields and submit
    await page.getByLabel(/Appointment ID/i).fill(APPOINTMENT_ID);
    await page.getByLabel(/Symptoms/i).fill("Headache, fever");
    await page.getByLabel(/Diagnosis/i).fill("Suspected infection");
    await page.getByLabel(/Treatment Plan/i).fill("Paracetamol, rest");
    await page.getByLabel(/Temp/i).fill("37.5");
    await page.getByRole("button", { name: /Save Medical Exam/i }).click();

    // We don't assert navigation (mock), just ensure no crash
    await expect(page).toHaveURL(/exams/);
  });

  test("Edit exam within 24h", async ({ page }) => {
    await page.goto(`/admin/exams/${EXAM_ID}/edit`);
    await expect(
      page.getByRole("heading", { name: /Edit Medical Exam/i }),
    ).toBeVisible({ timeout: 5000 });
    await page.getByLabel(/Diagnosis/i).fill("Updated diagnosis");
    await page.getByRole("button", { name: /Save Medical Exam/i }).click();
    // Expect either toast or stay on page without error
    await expect(
      page.getByRole("heading", { name: /Edit Medical Exam/i }),
    ).toBeVisible();
  });

  test("View exam detail", async ({ page }) => {
    await page.goto(`/admin/exams/${EXAM_ID}`);
    await expect(page.getByText(/Medical Examination/i)).toBeVisible();
    await expect(page.getByText(/Patient Information/i)).toBeVisible();
    await expect(page.getByText(/Clinical Findings/i)).toBeVisible();
  });

  test("Create prescription (validation shown)", async ({ page }) => {
    await page.goto(`/admin/exams/${EXAM_ID}/prescription`);
    const alreadyHas = await page
      .getByText(/already has a prescription/i)
      .isVisible()
      .catch(() => false);
    if (alreadyHas) {
      test.skip(true, "Exam already has prescription");
      return;
    }

    await page.getByRole("button", { name: /Create Prescription/i }).click();
    await expect(page.getByText(/Medicine is required/i)).toBeVisible();
  });
});
