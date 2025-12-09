import { http, HttpResponse } from "msw";
import { mockAppointments } from "@/lib/mocks/data/appointments";
import { Appointment } from "@/interfaces/appointment";
import { parseISO, isWithinInterval } from "date-fns";

const API_URL = "/api/appointments";

export const appointmentHandlers = [
  http.get(API_URL, ({ request }) => {
    const url = new URL(request.url);
    const doctorId = url.searchParams.get("doctorId");
    const patientId = url.searchParams.get("patientId");
    const status = url.searchParams.get("status");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const page = parseInt(url.searchParams.get("page") || "0");
    const size = parseInt(url.searchParams.get("size") || "10");

    let filteredAppointments = [...mockAppointments];

    // Filter by doctorId
    if (doctorId) {
      filteredAppointments = filteredAppointments.filter(
        (appt) => appt.doctor.id === doctorId,
      );
    }

    // Filter by patientId
    if (patientId) {
      filteredAppointments = filteredAppointments.filter(
        (appt) => appt.patient.id === patientId,
      );
    }

    // Filter by status
    if (status) {
      filteredAppointments = filteredAppointments.filter(
        (appt) => appt.status === status,
      );
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      filteredAppointments = filteredAppointments.filter((appt) => {
        const apptDate = parseISO(appt.appointmentTime);
        return isWithinInterval(apptDate, { start, end });
      });
    }

    // Sort by appointment time descending by default
    filteredAppointments.sort(
      (a, b) =>
        parseISO(b.appointmentTime).getTime() -
        parseISO(a.appointmentTime).getTime(),
    );

    // Paginate
    const totalElements = filteredAppointments.length;
    const totalPages = Math.ceil(totalElements / size);
    const paginatedAppointments = filteredAppointments.slice(
      page * size,
      (page + 1) * size,
    );

    return HttpResponse.json({
      data: {
        content: paginatedAppointments,
        page,
        size,
        totalElements,
        totalPages,
        last: page >= totalPages - 1,
      },
    });
  }),
];
