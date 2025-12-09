import { EmployeeSchedule } from "@/interfaces/hr";
import { format, addDays } from "date-fns";

const today = new Date();
const drNewTestId = "emp-new-doctor-001";
const drJohnSmithId = "emp-101";

const createSchedule = (
  employeeId: string,
  daysOffset: number,
  startTime: string,
  endTime: string,
  status: "AVAILABLE" | "BOOKED" = "AVAILABLE",
): EmployeeSchedule => {
  const workDate = addDays(today, daysOffset);
  return {
    id: `sched-${employeeId}-${format(workDate, "yyyyMMdd")}-${startTime.replace(":", "")}`,
    employeeId: employeeId,
    workDate: format(workDate, "yyyy-MM-dd"),
    startTime,
    endTime,
    status,
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  };
};

export const mockSchedules: EmployeeSchedule[] = [
  // === Schedules for Dr. New Test ===

  // This Week
  // Monday (Today + 0 assuming today is Monday for consistency)
  createSchedule(drNewTestId, 0, "09:00", "12:00"),
  createSchedule(drNewTestId, 0, "13:00", "17:00", "BOOKED"),
  // Tuesday
  createSchedule(drNewTestId, 1, "09:00", "12:00"),
  createSchedule(drNewTestId, 1, "13:00", "17:00"),
  // Wednesday (shorter day)
  createSchedule(drNewTestId, 2, "10:00", "14:00"),
  // Thursday
  createSchedule(drNewTestId, 3, "09:00", "12:00"),
  createSchedule(drNewTestId, 3, "13:00", "17:00"),
  // Friday
  createSchedule(drNewTestId, 4, "09:00", "13:00"),
  // Saturday/Sunday - Day off

  // Next Week
  createSchedule(drNewTestId, 7, "09:00", "17:00"),
  createSchedule(drNewTestId, 8, "09:00", "17:00"),
  createSchedule(drNewTestId, 9, "10:00", "14:00"),
  createSchedule(drNewTestId, 10, "09:00", "17:00"),
  createSchedule(drNewTestId, 11, "09:00", "13:00"),

  // === Schedules for Dr. John Smith (for filtering) ===
  // This Week
  createSchedule(drJohnSmithId, 0, "08:30", "12:30"),
  createSchedule(drJohnSmithId, 0, "13:30", "17:30"),
  createSchedule(drJohnSmithId, 2, "08:30", "12:30"),

  // Next Week
  createSchedule(drJohnSmithId, 8, "08:30", "17:30"),
  createSchedule(drJohnSmithId, 10, "08:30", "17:30"),
];
