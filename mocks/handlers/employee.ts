import { http, HttpResponse } from "msw";
import { mockEmployees } from "@/lib/mocks/data/employees";

const API_URL = "/api/employees";

export const employeeHandlers = [
  http.get(API_URL, ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get("role");

    let filteredEmployees = [...mockEmployees];

    if (role) {
      filteredEmployees = filteredEmployees.filter(
        (employee) => employee.role === role,
      );
    }

    // This mock returns all employees for the role, as the frontend needs the full list for dropdowns
    // A real implementation would have full pagination
    return HttpResponse.json({
      data: {
        content: filteredEmployees,
        page: 0,
        size: filteredEmployees.length,
        totalElements: filteredEmployees.length,
        totalPages: 1,
        last: true,
      },
    });
  }),
];
