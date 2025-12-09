import { MedicalExam, Prescription } from "@/interfaces/medical-exam";
import { subDays, formatISO } from "date-fns";

// Use a static date to prevent hydration mismatch errors
const baseDate = new Date("2025-12-10T12:00:00Z");

export const mockMedicalExams: MedicalExam[] = [
  {
    id: "exam-nt-001",
    appointment: { id: "appt-nt-002", appointmentTime: formatISO(subDays(baseDate, 5)) },
    patient: { id: "p001", fullName: "Nguyen Van An" },
    doctor: { id: "emp-new-doctor-001", fullName: "Dr. New Test" },
    status: "FINALIZED",
    diagnosis: "Hypertension",
    symptoms: "Patient reported occasional headaches and dizziness.",
    treatment: "Prescribed Lisinopril 10mg.",
    vitals: { temperature: 36.8, bloodPressureSystolic: 130, bloodPressureDiastolic: 85, heartRate: 75, weight: 85, height: 175 },
    notes: "Patient is responding well to medication.",
    examDate: formatISO(subDays(baseDate, 5)),
    createdAt: formatISO(subDays(baseDate, 5)),
    updatedAt: formatISO(subDays(baseDate, 5)),
    hasPrescription: true,
    prescription: {
      id: "rx-001",
      medicalExam: { id: "exam-nt-001" },
      patient: { id: "p001", fullName: "Nguyen Van An" },
      doctor: { id: "emp-new-doctor-001", fullName: "Dr. New Test" },
      prescribedAt: formatISO(subDays(baseDate, 5)),
      notes: "Take with food. Monitor for any side effects.",
      items: [
        { id: "rxi-001", medicine: { id: "med-001", name: "Lisinopril 10mg" }, quantity: 30, unitPrice: 1500, dosage: "1 tablet daily", durationDays: 30, instructions: "Take in the morning." },
      ],
      createdAt: formatISO(subDays(baseDate, 5)),
      updatedAt: formatISO(subDays(baseDate, 5)),
    },
  },
  {
    id: "exam-nt-002",
    appointment: { id: "appt-nt-004", appointmentTime: baseDate.toISOString() },
    patient: { id: "p004", fullName: "Pham Minh Duc" },
    doctor: { id: "emp-new-doctor-001", fullName: "Dr. New Test" },
    status: "PENDING",
    diagnosis: "Laceration",
    symptoms: "Laceration on forearm from kitchen knife.",
    vitals: { temperature: 37.0, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, heartRate: 80, weight: 65, height: 160 },
    examDate: baseDate.toISOString(),
    createdAt: baseDate.toISOString(),
    updatedAt: baseDate.toISOString(),
    hasPrescription: false,
  },
  {
    id: "exam-js-001",
    appointment: { id: "appt-js-002", appointmentTime: formatISO(subDays(baseDate, 6)) },
    patient: { id: "p005", fullName: "Vo Thi Hong" },
    doctor: { id: "emp-101", fullName: "Dr. John Smith" },
    status: "FINALIZED",
    diagnosis: "Stable Angina",
    symptoms: "Patient reported chest pain during exercise.",
    treatment: "Referred for stress test.",
    vitals: { temperature: 36.9, bloodPressureSystolic: 125, bloodPressureDiastolic: 82, heartRate: 70, weight: 78, height: 180 },
    examDate: formatISO(subDays(baseDate, 6)),
    createdAt: formatISO(subDays(baseDate, 6)),
    updatedAt: formatISO(subDays(baseDate, 6)),
    hasPrescription: true,
    prescription: {
      id: "rx-002",
      medicalExam: { id: "exam-js-001" },
      patient: { id: "p005", fullName: "Vo Thi Hong" },
      doctor: { id: "emp-101", fullName: "Dr. John Smith" },
      prescribedAt: formatISO(subDays(baseDate, 6)),
      notes: "Use under the tongue at the onset of chest pain. Do not exceed 3 tablets in 15 minutes.",
      items: [
        { id: "rxi-002", medicine: { id: "med-002", name: "Nitroglycerin 0.4mg" }, quantity: 25, unitPrice: 2000, dosage: "1 tablet as needed", durationDays: null, instructions: "For emergency use." },
      ],
      createdAt: formatISO(subDays(baseDate, 6)),
      updatedAt: formatISO(subDays(baseDate, 6)),
    },
  },
  // ... (the rest of the exams)
];
