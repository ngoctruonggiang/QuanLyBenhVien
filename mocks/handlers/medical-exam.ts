import { http, HttpResponse } from "msw";
import { mockMedicalExams } from "@/lib/mocks/data/medical-exams";
import { parseISO, isWithinInterval } from "date-fns";

const API_URL = "/api/exams"; // CORRECTED URL

export const medicalExamHandlers = [
  http.get(API_URL, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "0");
    const size = parseInt(url.searchParams.get("size") || "10");
    const doctorId = url.searchParams.get("doctorId");
    const patientName = url.searchParams.get("patientName")?.toLowerCase();
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    let filteredExams = [...mockMedicalExams];

    // Filter by doctorId
    if (doctorId) {
      filteredExams = filteredExams.filter(
        (exam) => exam.doctor.id === doctorId,
      );
    }

    // Filter by patient name (search)
    if (patientName) {
      filteredExams = filteredExams.filter((exam) =>
        exam.patient.fullName.toLowerCase().includes(patientName),
      );
    }

    // Filter by date range
    if (startDate && endDate) {
      const interval = { start: parseISO(startDate), end: parseISO(endDate) };
      filteredExams = filteredExams.filter((exam) =>
        isWithinInterval(parseISO(exam.examDate), interval),
      );
    }

    // Sort by exam date descending by default
    filteredExams.sort(
      (a, b) => parseISO(b.examDate).getTime() - parseISO(a.examDate).getTime(),
    );

    // Paginate
    const totalElements = filteredExams.length;
    const totalPages = Math.ceil(totalElements / size);
    const paginatedExams = filteredExams.slice(page * size, (page + 1) * size);

    return HttpResponse.json({
      data: {
        content: paginatedExams,
        page,
        size,
        totalElements,
        totalPages,
        last: page >= totalPages - 1,
      },
    });
  }),
];
