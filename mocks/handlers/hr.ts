import { http, HttpResponse } from "msw";
import { mockSchedules } from "@/lib/mocks/data/schedules";

const API_URL = "/api/hr/schedules";

export const hrHandlers = [
  http.get(API_URL, ({ request }) => {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get("employeeId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    let filteredSchedules = [...mockSchedules];

    if (employeeId) {
      filteredSchedules = filteredSchedules.filter(
        (schedule) => schedule.employeeId === employeeId,
      );
    }

    // This is a simplified mock. A real implementation would parse dates.
    if (startDate) {
      filteredSchedules = filteredSchedules.filter(
        (schedule) => schedule.workDate >= startDate,
      );
    }
    if (endDate) {
      filteredSchedules = filteredSchedules.filter(
        (schedule) => schedule.workDate <= endDate,
      );
    }

    // MSW returns handlers as a singular JSON object, not as an array of objects
    return HttpResponse.json({
      data: filteredSchedules,
    });
  }),
];
