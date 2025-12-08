import { http, HttpResponse } from "msw";

const accounts = [
  { id: "acc_1", email: "patient1@example.com", role: "PATIENT" },
  { id: "acc_2", email: "doctor_jones@example.com", role: "DOCTOR" },
  { id: "acc_3", email: "nurse_smith@example.com", role: "NURSE" },
  { id: "acc_4", email: "admin@hms.com", role: "ADMIN" },
  { id: "acc_5", email: "reception@hms.com", role: "RECEPTIONIST" },
];

export const authHandlers = [
  http.get("/api/auth-service/auth/accounts", ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";

    const filteredAccounts = accounts.filter(
      (account) =>
        account.email.toLowerCase().includes(search)
    );

    return HttpResponse.json({
        status: "success",
        data: {
          content: filteredAccounts,
          page: 0,
          size: 10,
          totalElements: filteredAccounts.length,
          totalPages: 1,
          last: true,
        },
      });
  }),
];
