import axiosInstance from "@/config/axios";
import {
  Appointment,
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  AppointmentCancelRequest,
  AppointmentListParams,
  PaginatedResponse,
  TimeSlot,
} from "@/interfaces/appointment";
import { USE_MOCK } from "@/lib/mocks/toggle";

const BASE_URL = "/api/appointments";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data - matches new interface structure (patient IDs sync with patient.service.ts)
const mockAppointments: Appointment[] = [
  {
    id: "apt-001",
    patient: {
      id: "p001",
      fullName: "Nguyen Van An",
      phoneNumber: "0901234567",
    },
    doctor: {
      id: "emp-101",
      fullName: "Dr. John Smith",
      department: "Cardiology",
      specialization: "Cardiology",
    },
    appointmentTime: "2025-12-05T09:00:00",
    status: "SCHEDULED",
    type: "CONSULTATION",
    reason: "Chest pain and shortness of breath",
    notes: "",
    createdAt: "2025-12-02T10:30:00Z",
    updatedAt: "2025-12-02T10:30:00Z",
  },
  {
    id: "apt-002",
    patient: {
      id: "p002",
      fullName: "Tran Thi Mai",
      phoneNumber: "0912345678",
    },
    doctor: {
      id: "emp-102",
      fullName: "Dr. Sarah Johnson",
      department: "Pediatrics",
      specialization: "Pediatrics",
    },
    appointmentTime: "2025-12-05T10:30:00",
    status: "SCHEDULED",
    type: "FOLLOW_UP",
    reason: "Follow-up after flu treatment",
    createdAt: "2025-12-01T14:00:00Z",
    updatedAt: "2025-12-01T14:00:00Z",
  },
  {
    id: "apt-003",
    patient: {
      id: "p003",
      fullName: "Le Hoang Phuc",
      phoneNumber: "0923456789",
    },
    doctor: {
      id: "emp-101",
      fullName: "Dr. John Smith",
      department: "Cardiology",
      specialization: "Cardiology",
    },
    appointmentTime: "2025-12-04T14:00:00",
    status: "COMPLETED",
    type: "CONSULTATION",
    reason: "Annual heart checkup",
    notes: "Patient completed examination successfully",
    createdAt: "2025-11-28T09:00:00Z",
    updatedAt: "2025-12-04T15:30:00Z",
  },
  {
    id: "apt-004",
    patient: {
      id: "p004",
      fullName: "Pham Minh Duc",
      phoneNumber: "0934567890",
    },
    doctor: {
      id: "emp-103",
      fullName: "Dr. Emily Carter",
      department: "Emergency",
      specialization: "Emergency Medicine",
    },
    appointmentTime: "2025-12-03T11:00:00",
    status: "CANCELLED",
    type: "EMERGENCY",
    reason: "Severe headache",
    cancelledAt: "2025-12-03T09:00:00Z",
    cancelReason: "Patient recovered at home",
    createdAt: "2025-12-02T20:00:00Z",
    updatedAt: "2025-12-03T09:00:00Z",
  },
  {
    id: "apt-005",
    patient: {
      id: "p005",
      fullName: "Vo Thi Hong",
      phoneNumber: "0945678901",
    },
    doctor: {
      id: "emp-102",
      fullName: "Dr. Sarah Johnson",
      department: "Pediatrics",
      specialization: "Pediatrics",
    },
    appointmentTime: "2025-12-02T09:00:00",
    status: "NO_SHOW",
    type: "CONSULTATION",
    reason: "Child vaccination",
    createdAt: "2025-11-25T10:00:00Z",
    updatedAt: "2025-12-02T10:00:00Z",
  },
  {
    id: "apt-006",
    patient: {
      id: "p001",
      fullName: "Nguyen Van An",
      phoneNumber: "0901234567",
    },
    doctor: {
      id: "emp-101",
      fullName: "Dr. John Smith",
      department: "Cardiology",
      specialization: "Cardiology",
    },
    appointmentTime: "2025-12-06T14:00:00",
    status: "SCHEDULED",
    type: "FOLLOW_UP",
    reason: "Follow-up for chest pain",
    createdAt: "2025-12-05T08:00:00Z",
    updatedAt: "2025-12-05T08:00:00Z",
  },
];

// Generate time slots for a day (30-min intervals from 08:00 to 17:00)
const generateTimeSlots = (
  bookedTimes: string[],
  currentTime?: string
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  for (let hour = 8; hour < 17; hour++) {
    for (const min of [0, 30]) {
      const time = `${hour.toString().padStart(2, "0")}:${min
        .toString()
        .padStart(2, "0")}`;
      slots.push({
        time,
        available: !bookedTimes.includes(time),
        current: time === currentTime,
      });
    }
  }
  return slots;
};

export const appointmentService = {
  // List appointments with filters and pagination
  list: async (
    params: AppointmentListParams
  ): Promise<PaginatedResponse<Appointment>> => {
    if (!USE_MOCK) {
      const response = await axiosInstance.get(BASE_URL, { params });
      return response.data.data;
    }

    await delay(300);
    let filtered = [...mockAppointments];

    // Filter by search (patient name)
    if (params.search) {
      const term = params.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.patient.fullName.toLowerCase().includes(term) ||
          a.doctor.fullName.toLowerCase().includes(term)
      );
    }

    // Filter by patientId
    if (params.patientId) {
      filtered = filtered.filter((a) => a.patient.id === params.patientId);
    }

    // Filter by doctorId
    if (params.doctorId) {
      filtered = filtered.filter((a) => a.doctor.id === params.doctorId);
    }

    // Filter by status
    if (params.status) {
      filtered = filtered.filter((a) => a.status === params.status);
    }

    // Filter by date range
    if (params.startDate) {
      filtered = filtered.filter((a) => a.appointmentTime >= params.startDate!);
    }
    if (params.endDate) {
      filtered = filtered.filter(
        (a) => a.appointmentTime <= params.endDate! + "T23:59:59"
      );
    }

    // Sort
    const sortField = params.sort?.split(",")[0] || "appointmentTime";
    const sortDir = params.sort?.split(",")[1] || "desc";
    filtered.sort((a, b) => {
      const aVal =
        sortField === "appointmentTime"
          ? a.appointmentTime
          : a.patient.fullName;
      const bVal =
        sortField === "appointmentTime"
          ? b.appointmentTime
          : b.patient.fullName;
      return sortDir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

    // Pagination
    const page = params.page || 0;
    const size = params.size || 10;
    const start = page * size;
    const end = start + size;
    const content = filtered.slice(start, end);

    return {
      content,
      page,
      size,
      totalElements: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / size)),
      last: end >= filtered.length,
    };
  },

  // Get appointment by ID
  getById: async (id: string): Promise<Appointment | null> => {
    if (!USE_MOCK) {
      const response = await axiosInstance.get(`${BASE_URL}/${id}`);
      return response.data.data;
    }

    await delay(200);
    return mockAppointments.find((a) => a.id === id) || null;
  },

  // Create new appointment
  create: async (data: AppointmentCreateRequest): Promise<Appointment> => {
    if (!USE_MOCK) {
      const response = await axiosInstance.post(BASE_URL, data);
      return response.data.data;
    }

    await delay(300);
    // Simulate validation
    if (new Date(data.appointmentTime) < new Date()) {
      throw { response: { data: { error: { code: "PAST_APPOINTMENT" } } } };
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patient: { id: data.patientId, fullName: `Patient ${data.patientId}` },
      doctor: {
        id: data.doctorId,
        fullName: `Doctor ${data.doctorId}`,
        department: "General",
      },
      appointmentTime: data.appointmentTime,
      status: "SCHEDULED",
      type: data.type,
      reason: data.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockAppointments.unshift(newAppointment);
    return newAppointment;
  },

  // Update appointment (reschedule)
  update: async (
    id: string,
    data: AppointmentUpdateRequest
  ): Promise<Appointment> => {
    if (!USE_MOCK) {
      const response = await axiosInstance.patch(`${BASE_URL}/${id}`, data);
      return response.data.data;
    }

    await delay(300);
    const index = mockAppointments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw {
        response: { data: { error: { code: "APPOINTMENT_NOT_FOUND" } } },
      };
    }

    const appointment = mockAppointments[index];
    if (appointment.status !== "SCHEDULED") {
      throw {
        response: { data: { error: { code: "APPOINTMENT_NOT_MODIFIABLE" } } },
      };
    }

    mockAppointments[index] = {
      ...appointment,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return mockAppointments[index];
  },

  // Cancel appointment
  cancel: async (
    id: string,
    data: AppointmentCancelRequest
  ): Promise<Appointment> => {
    if (!USE_MOCK) {
      const response = await axiosInstance.patch(
        `${BASE_URL}/${id}/cancel`,
        data
      );
      return response.data.data;
    }

    await delay(300);
    const index = mockAppointments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw {
        response: { data: { error: { code: "APPOINTMENT_NOT_FOUND" } } },
      };
    }

    const appointment = mockAppointments[index];
    if (appointment.status === "CANCELLED") {
      throw { response: { data: { error: { code: "ALREADY_CANCELLED" } } } };
    }
    if (appointment.status !== "SCHEDULED") {
      throw {
        response: { data: { error: { code: "APPOINTMENT_NOT_CANCELLABLE" } } },
      };
    }

    mockAppointments[index] = {
      ...appointment,
      status: "CANCELLED",
      cancelledAt: new Date().toISOString(),
      cancelReason: data.cancelReason,
      updatedAt: new Date().toISOString(),
    };

    return mockAppointments[index];
  },

  // Complete appointment (doctor only)
  complete: async (id: string): Promise<Appointment> => {
    if (!USE_MOCK) {
      const response = await axiosInstance.patch(`${BASE_URL}/${id}/complete`);
      return response.data.data;
    }

    await delay(300);
    const index = mockAppointments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw {
        response: { data: { error: { code: "APPOINTMENT_NOT_FOUND" } } },
      };
    }

    const appointment = mockAppointments[index];
    if (appointment.status === "COMPLETED") {
      throw { response: { data: { error: { code: "ALREADY_COMPLETED" } } } };
    }
    if (appointment.status === "CANCELLED") {
      throw {
        response: { data: { error: { code: "APPOINTMENT_CANCELLED" } } },
      };
    }

    mockAppointments[index] = {
      ...appointment,
      status: "COMPLETED",
      updatedAt: new Date().toISOString(),
    };

    return mockAppointments[index];
  },

  // Get available time slots for a doctor on a specific date
  getTimeSlots: async (
    doctorId: string,
    date: string,
    excludeAppointmentId?: string
  ): Promise<TimeSlot[]> => {
    if (!USE_MOCK) {
      const response = await axiosInstance.get(`${BASE_URL}/slots`, {
        params: { doctorId, date },
      });
      return response.data.data;
    }

    await delay(200);
    // Get booked times for this doctor on this date
    const bookedTimes = mockAppointments
      .filter((a) => {
        if (a.doctor.id !== doctorId) return false;
        if (a.status === "CANCELLED") return false;
        if (excludeAppointmentId && a.id === excludeAppointmentId) return false;
        const aptDate = a.appointmentTime.split("T")[0];
        return aptDate === date;
      })
      .map((a) => {
        const time = a.appointmentTime.split("T")[1];
        return time.substring(0, 5); // "HH:mm"
      });

    // Current time if editing
    let currentTime: string | undefined;
    if (excludeAppointmentId) {
      const current = mockAppointments.find(
        (a) => a.id === excludeAppointmentId
      );
      if (current) {
        const aptDate = current.appointmentTime.split("T")[0];
        if (aptDate === date) {
          currentTime = current.appointmentTime.split("T")[1].substring(0, 5);
        }
      }
    }

    return generateTimeSlots(bookedTimes, currentTime);
  },
};

// Re-export types
export type { Appointment, AppointmentCreateRequest, AppointmentListParams };
export type AppointmentStatus =
  import("@/interfaces/appointment").AppointmentStatus;
export type AppointmentType =
  import("@/interfaces/appointment").AppointmentType;

// Legacy function exports for existing code compatibility
export const listAppointments = appointmentService.list;
export const createAppointment = (data: AppointmentCreateRequest) =>
  appointmentService.create(data);
export const updateAppointment = (id: string, data: AppointmentUpdateRequest) =>
  appointmentService.update(id, data);

export default appointmentService;
