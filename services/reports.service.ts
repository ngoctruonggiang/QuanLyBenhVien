import axiosInstance from "@/config/axios";
import {
  RevenueReport,
  RevenueReportParams,
  AppointmentStats,
  AppointmentStatsParams,
  DoctorPerformance,
  DoctorPerformanceParams,
  PatientActivity,
  PatientActivityParams,
} from "@/interfaces/reports";
import { USE_MOCK } from "@/lib/mocks/toggle";

const BASE_URL = "/api/reports";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data for development
const mockRevenueReport: RevenueReport = {
  totalRevenue: 125000,
  paidRevenue: 100000,
  unpaidRevenue: 25000,
  invoiceCount: 450,
  collectionRate: 80,
  revenueByDepartment: [
    {
      departmentId: "dept001",
      departmentName: "Cardiology",
      revenue: 45000,
      percentage: 36,
    },
    {
      departmentId: "dept002",
      departmentName: "Neurology",
      revenue: 38000,
      percentage: 30.4,
    },
    {
      departmentId: "dept003",
      departmentName: "Radiology",
      revenue: 25000,
      percentage: 20,
    },
    {
      departmentId: "dept004",
      departmentName: "General Medicine",
      revenue: 17000,
      percentage: 13.6,
    },
  ],
  revenueByPaymentMethod: [
    { method: "CASH", amount: 30000, count: 150, percentage: 24 },
    { method: "CARD", amount: 50000, count: 200, percentage: 40 },
    { method: "INSURANCE", amount: 45000, count: 100, percentage: 36 },
  ],
  generatedAt: new Date().toISOString(),
  cached: true,
  cacheExpiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
};

const mockAppointmentStats: AppointmentStats = {
  totalAppointments: 1234,
  completedCount: 890,
  cancelledCount: 120,
  noShowCount: 45,
  completionRate: 72.1,
  noShowRate: 3.6,
  appointmentsByStatus: [
    { status: "COMPLETED", count: 890, percentage: 72.1 },
    { status: "SCHEDULED", count: 150, percentage: 12.2 },
    { status: "CANCELLED", count: 120, percentage: 9.7 },
    { status: "NO_SHOW", count: 45, percentage: 3.6 },
    { status: "CONFIRMED", count: 29, percentage: 2.4 },
  ],
  appointmentsByType: [
    { type: "CONSULTATION", count: 600 },
    { type: "FOLLOW_UP", count: 400 },
    { type: "CHECK_UP", count: 200 },
    { type: "EMERGENCY", count: 34 },
  ],
  appointmentsByDepartment: [
    { departmentId: "dept001", departmentName: "Cardiology", count: 350 },
    { departmentId: "dept002", departmentName: "Neurology", count: 280 },
    { departmentId: "dept003", departmentName: "Radiology", count: 220 },
    { departmentId: "dept004", departmentName: "General Medicine", count: 384 },
  ],
  dailyTrend: [
    { date: "2025-11-29", count: 42 },
    { date: "2025-11-30", count: 38 },
    { date: "2025-12-01", count: 45 },
    { date: "2025-12-02", count: 52 },
    { date: "2025-12-03", count: 48 },
    { date: "2025-12-04", count: 38 },
    { date: "2025-12-05", count: 55 },
  ],
  generatedAt: new Date().toISOString(),
  cached: true,
};

const mockDoctorPerformance: DoctorPerformance = {
  doctors: [
    {
      doctorId: "emp001",
      doctorName: "Dr. Nguyen Van Hung",
      departmentId: "dept001",
      departmentName: "Cardiology",
      specialization: "Interventional Cardiology",
      statistics: {
        appointmentsCompleted: 145,
        appointmentsTotal: 150,
        completionRate: 96.67,
        totalRevenue: 45000,
        patientsSeen: 120,
        prescriptionsWritten: 135,
        avgConsultationTime: 25,
      },
    },
    {
      doctorId: "emp002",
      doctorName: "Dr. Tran Thi Mai",
      departmentId: "dept002",
      departmentName: "Neurology",
      specialization: "Pediatric Neurology",
      statistics: {
        appointmentsCompleted: 110,
        appointmentsTotal: 120,
        completionRate: 91.67,
        totalRevenue: 38000,
        patientsSeen: 95,
        prescriptionsWritten: 102,
        avgConsultationTime: 30,
      },
    },
    {
      doctorId: "emp003",
      doctorName: "Dr. Le Minh Duc",
      departmentId: "dept003",
      departmentName: "Radiology",
      specialization: "Diagnostic Radiology",
      statistics: {
        appointmentsCompleted: 180,
        appointmentsTotal: 200,
        completionRate: 90.0,
        totalRevenue: 52000,
        patientsSeen: 165,
        prescriptionsWritten: 45,
        avgConsultationTime: 15,
      },
    },
    {
      doctorId: "emp004",
      doctorName: "Dr. Pham Van An",
      departmentId: "dept004",
      departmentName: "General Medicine",
      specialization: "Internal Medicine",
      statistics: {
        appointmentsCompleted: 75,
        appointmentsTotal: 100,
        completionRate: 75.0,
        totalRevenue: 22000,
        patientsSeen: 68,
        prescriptionsWritten: 88,
        avgConsultationTime: 20,
      },
    },
    {
      doctorId: "emp005",
      doctorName: "Dr. Hoang Thi Lan",
      departmentId: "dept001",
      departmentName: "Cardiology",
      specialization: "Cardiac Surgery",
      statistics: {
        appointmentsCompleted: 60,
        appointmentsTotal: 65,
        completionRate: 92.31,
        totalRevenue: 85000,
        patientsSeen: 55,
        prescriptionsWritten: 40,
        avgConsultationTime: 45,
      },
    },
  ],
  summary: {
    totalDoctors: 5,
    avgCompletionRate: 89.13,
    totalPatientsSeen: 503,
    totalRevenue: 242000,
  },
  generatedAt: new Date().toISOString(),
  cached: true,
};

const mockPatientActivity: PatientActivity = {
  totalPatients: 2500,
  newPatients: 150,
  activePatients: 1800,
  returningPatients: 320,
  patientsByGender: [
    { gender: "MALE", count: 1200, percentage: 48 },
    { gender: "FEMALE", count: 1250, percentage: 50 },
    { gender: "OTHER", count: 50, percentage: 2 },
  ],
  patientsByBloodType: [
    { bloodType: "O+", count: 900, percentage: 36 },
    { bloodType: "A+", count: 750, percentage: 30 },
    { bloodType: "B+", count: 500, percentage: 20 },
    { bloodType: "AB+", count: 200, percentage: 8 },
    { bloodType: "O-", count: 80, percentage: 3.2 },
    { bloodType: "A-", count: 40, percentage: 1.6 },
    { bloodType: "B-", count: 20, percentage: 0.8 },
    { bloodType: "AB-", count: 10, percentage: 0.4 },
  ],
  topDiagnoses: [
    { diagnosis: "Hypertension", icdCode: "I10", count: 320, percentage: 12.8 },
    {
      diagnosis: "Type 2 Diabetes",
      icdCode: "E11",
      count: 280,
      percentage: 11.2,
    },
    {
      diagnosis: "Acute Bronchitis",
      icdCode: "J20",
      count: 150,
      percentage: 6,
    },
    { diagnosis: "Migraine", icdCode: "G43", count: 120, percentage: 4.8 },
    {
      diagnosis: "Anxiety Disorder",
      icdCode: "F41",
      count: 110,
      percentage: 4.4,
    },
    {
      diagnosis: "Lower Back Pain",
      icdCode: "M54.5",
      count: 100,
      percentage: 4,
    },
    { diagnosis: "Asthma", icdCode: "J45", count: 95, percentage: 3.8 },
    { diagnosis: "Gastritis", icdCode: "K29", count: 85, percentage: 3.4 },
    { diagnosis: "Hyperlipidemia", icdCode: "E78", count: 80, percentage: 3.2 },
    { diagnosis: "Osteoarthritis", icdCode: "M15", count: 75, percentage: 3 },
  ],
  registrationTrend: [
    { date: "2025-11-29", newPatients: 22, visits: 85 },
    { date: "2025-11-30", newPatients: 18, visits: 72 },
    { date: "2025-12-01", newPatients: 25, visits: 90 },
    { date: "2025-12-02", newPatients: 30, visits: 105 },
    { date: "2025-12-03", newPatients: 28, visits: 98 },
    { date: "2025-12-04", newPatients: 20, visits: 78 },
    { date: "2025-12-05", newPatients: 35, visits: 112 },
  ],
  generatedAt: new Date().toISOString(),
  cached: true,
};

export const reportsService = {
  // Revenue Report
  getRevenueReport: async (
    params: RevenueReportParams
  ): Promise<RevenueReport> => {
    if (!USE_MOCK) {
      const response = await axiosInstance.get(`${BASE_URL}/revenue`, {
        params,
      });
      return response.data.data;
    }

    await delay(800);
    return { ...mockRevenueReport, generatedAt: new Date().toISOString() };
  },

  // Appointment Statistics
  getAppointmentStats: async (
    params: AppointmentStatsParams
  ): Promise<AppointmentStats> => {
    if (!USE_MOCK) {
      const response = await axiosInstance.get(`${BASE_URL}/appointments`, {
        params,
      });
      return response.data.data;
    }

    await delay(600);
    return { ...mockAppointmentStats, generatedAt: new Date().toISOString() };
  },

  // Doctor Performance
  getDoctorPerformance: async (
    params: DoctorPerformanceParams
  ): Promise<DoctorPerformance> => {
    if (!USE_MOCK) {
      const response = await axiosInstance.get(
        `${BASE_URL}/doctors/performance`,
        { params }
      );
      return response.data.data;
    }

    await delay(700);
    // Sort by the specified field
    let sortedDoctors = [...mockDoctorPerformance.doctors];
    if (params.sortBy) {
      sortedDoctors.sort((a, b) => {
        switch (params.sortBy) {
          case "completionRate":
            return b.statistics.completionRate - a.statistics.completionRate;
          case "patientsSeen":
            return b.statistics.patientsSeen - a.statistics.patientsSeen;
          case "totalRevenue":
            return b.statistics.totalRevenue - a.statistics.totalRevenue;
          default:
            return 0;
        }
      });
    }

    // Filter by department
    if (params.departmentId) {
      sortedDoctors = sortedDoctors.filter(
        (d) => d.departmentId === params.departmentId
      );
    }

    return {
      ...mockDoctorPerformance,
      doctors: sortedDoctors,
      generatedAt: new Date().toISOString(),
    };
  },

  // Patient Activity
  getPatientActivity: async (
    params: PatientActivityParams
  ): Promise<PatientActivity> => {
    if (!USE_MOCK) {
      const response = await axiosInstance.get(
        `${BASE_URL}/patients/activity`,
        { params }
      );
      return response.data.data;
    }

    await delay(650);
    return { ...mockPatientActivity, generatedAt: new Date().toISOString() };
  },

  // Clear Report Cache
  clearCache: async (): Promise<{ message: string; clearedAt: string }> => {
    if (!USE_MOCK) {
      const response = await axiosInstance.delete(`${BASE_URL}/cache`);
      return response.data;
    }

    await delay(300);
    return {
      message: "Report cache cleared successfully",
      clearedAt: new Date().toISOString(),
    };
  },

  // Export to CSV
  exportToCSV: async (
    reportType: string,
    params: Record<string, string>
  ): Promise<Blob> => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${reportType}/export/csv`,
      {
        params,
        responseType: "blob",
      }
    );
    return response.data;
  },

  // Export to PDF
  exportToPDF: async (
    reportType: string,
    params: Record<string, string>
  ): Promise<Blob> => {
    const response = await axiosInstance.get(
      `${BASE_URL}/${reportType}/export/pdf`,
      {
        params,
        responseType: "blob",
      }
    );
    return response.data;
  },
};
