import { Appointment } from "@/interfaces/appointment";
import { mockPatients } from "./patients";
import { mockEmployees } from "./employees";
import { subDays, addDays, format, set } from "date-fns";

const today = new Date();

const drNewTest = mockEmployees.find((e) => e.id === "emp-new-doctor-001")!;
const drJohnSmith = mockEmployees.find((e) => e.id === "emp-101")!;

export const mockAppointments: Appointment[] = [
  // === Appointments for Dr. New Test (emp-new-doctor-001) ===

  // 1. Future SCHEDULED appointment
  {
    id: "appt-nt-001",
    patient: { id: mockPatients[0].id, fullName: mockPatients[0].fullName },
    doctor: {
      id: drNewTest.id,
      fullName: drNewTest.fullName,
      department: drNewTest.departmentName,
    },
    appointmentTime: set(addDays(today, 5), {
      hours: 10,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }).toISOString(),
    status: "SCHEDULED",
    type: "CONSULTATION",
    reason: "Annual check-up.",
    notes: "Patient is generally healthy. Discuss preventive care.",
    createdAt: subDays(today, 2).toISOString(),
    updatedAt: subDays(today, 2).toISOString(),
  },

  // 2. Past COMPLETED appointment
  {
    id: "appt-nt-002",
    patient: { id: mockPatients[1].id, fullName: mockPatients[1].fullName },
    doctor: {
      id: drNewTest.id,
      fullName: drNewTest.fullName,
      department: drNewTest.departmentName,
    },
    appointmentTime: set(subDays(today, 14), {
      hours: 14,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    }).toISOString(),
    status: "COMPLETED",
    type: "FOLLOW_UP",
    reason: "Follow-up on blood pressure medication.",
    notes:
      "Patient's blood pressure is now stable. Continue current medication. Next check-up in 6 months.",
    createdAt: subDays(today, 20).toISOString(),
    updatedAt: subDays(today, 14).toISOString(),
  },

  // 3. Past CANCELLED appointment
  {
    id: "appt-nt-003",
    patient: { id: mockPatients[2].id, fullName: mockPatients[2].fullName },
    doctor: {
      id: drNewTest.id,
      fullName: drNewTest.fullName,
      department: drNewTest.departmentName,
    },
    appointmentTime: set(subDays(today, 3), {
      hours: 11,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }).toISOString(),
    status: "CANCELLED",
    type: "CONSULTATION",
    reason: "Flu-like symptoms.",
    cancelReason: "Patient cancelled due to conflicting schedule.",
    cancelledAt: subDays(today, 4).toISOString(),
    createdAt: subDays(today, 10).toISOString(),
    updatedAt: subDays(today, 4).toISOString(),
  },

  // 4. Appointment for TODAY
  {
    id: "appt-nt-004",
    patient: { id: mockPatients[3].id, fullName: mockPatients[3].fullName },
    doctor: {
      id: drNewTest.id,
      fullName: drNewTest.fullName,
      department: drNewTest.departmentName,
    },
    appointmentTime: set(today, {
      hours: 15,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }).toISOString(),
    status: "SCHEDULED",
    type: "EMERGENCY",
    reason: "Minor injury, requires stitches.",
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
  },

  // 5. Another future appointment
  {
    id: "appt-nt-005",
    patient: { id: mockPatients[0].id, fullName: mockPatients[0].fullName },
    doctor: {
      id: drNewTest.id,
      fullName: drNewTest.fullName,
      department: drNewTest.departmentName,
    },
    appointmentTime: set(addDays(today, 25), {
      hours: 9,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    }).toISOString(),
    status: "SCHEDULED",
    type: "CONSULTATION",
    reason: "Discuss lab results.",
    notes: "",
    createdAt: subDays(today, 1).toISOString(),
    updatedAt: subDays(today, 1).toISOString(),
  },

  // === Appointments for other doctors (to test filtering) ===

  // 6. Dr. John Smith's appointment
  {
    id: "appt-js-001",
    patient: { id: mockPatients[3].id, fullName: mockPatients[3].fullName },
    doctor: {
      id: drJohnSmith.id,
      fullName: drJohnSmith.fullName,
      department: drJohnSmith.departmentName,
    },
    appointmentTime: set(addDays(today, 2), {
      hours: 11,
      minutes: 30,
      seconds: 0,
      milliseconds: 0,
    }).toISOString(),
    status: "SCHEDULED",
    type: "CONSULTATION",
    reason: "Heart palpitations.",
    createdAt: subDays(today, 1).toISOString(),
    updatedAt: subDays(today, 1).toISOString(),
  },

  // 7. Dr. John Smith's completed appointment
  {
    id: "appt-js-002",
    patient: { id: mockPatients[1].id, fullName: mockPatients[1].fullName },
    doctor: {
      id: drJohnSmith.id,
      fullName: drJohnSmith.fullName,
      department: drJohnSmith.departmentName,
    },
    appointmentTime: set(subDays(today, 30), {
      hours: 10,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    }).toISOString(),
    status: "COMPLETED",
    type: "CONSULTATION",
    reason: "Initial consultation for chest pain.",
    notes: "ECG normal. Prescribed stress test.",
    createdAt: subDays(today, 35).toISOString(),
    updatedAt: subDays(today, 30).toISOString(),
  },
];
