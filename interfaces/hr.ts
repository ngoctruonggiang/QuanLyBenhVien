export type DepartmentStatus = "ACTIVE" | "INACTIVE";

export interface Department {
  id: string;
  name: string;
  description?: string;
  headDoctorId?: string;
  headDoctorName?: string; // For display if backend returns it, or we fetch it
  location?: string;
  phoneExtension?: string;
  status: DepartmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentRequest {
  name: string;
  description?: string;
  headDoctorId?: string;
  location?: string;
  phoneExtension?: string;
  status: DepartmentStatus;
}

export type EmployeeRole = "DOCTOR" | "NURSE" | "RECEPTIONIST" | "ADMIN";
export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "RESIGNED";

export interface Employee {
  id: string;
  accountId?: string;
  fullName: string;
  role: EmployeeRole;
  departmentId?: string;
  departmentName?: string; // For display
  specialization?: string;
  licenseNumber?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  status: EmployeeStatus;
  hiredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeRequest {
  accountId?: string;
  fullName: string;
  role: EmployeeRole;
  departmentId: string; // Required by backend - @NotBlank
  specialization?: string;
  licenseNumber?: string; // Pattern: XX-12345 (2 uppercase letters, dash, 5 digits)
  phoneNumber?: string; // Pattern: 10-15 digits
  address?: string;
  status: EmployeeStatus;
  hiredAt?: string;
  // Note: email is NOT part of backend EmployeeRequest DTO
}

export type ScheduleStatus = "AVAILABLE" | "BOOKED" | "CANCELLED";

export interface EmployeeSchedule {
  id: string;
  employeeId: string;
  employeeName?: string; // For display
  workDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: ScheduleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleRequest {
  employeeId: string;
  workDate: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  notes?: string;
}
