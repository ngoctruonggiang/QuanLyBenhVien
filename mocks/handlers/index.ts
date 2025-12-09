import { billingHandlers } from "./billing";
import { authHandlers } from "./auth";
import { appointmentHandlers } from "./appointment";
import { medicalExamHandlers } from "./medical-exam";
import { hrHandlers } from "./hr";
import { employeeHandlers } from "./employee";
import { categoryHandlers } from "./category";

export const handlers = [
  ...billingHandlers,
  ...authHandlers,
  ...appointmentHandlers,
  ...medicalExamHandlers,
  ...hrHandlers,
  ...employeeHandlers,
  ...categoryHandlers,
];
