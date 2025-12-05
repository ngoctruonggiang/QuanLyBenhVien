export type EmployeeStatus = "Active" | "On leave" | "Inactive";
export type EmployeeGender = "Male" | "Female" | "Other";

export interface Employee {
  id: number;
  avatar: string | null;
  fullName: string;
  dateOfBirth: string; // ISO date string
  gender: EmployeeGender;
  department: string;
  position: string;
  status: EmployeeStatus;
  idCard: string;
  phoneNumber: string;
  email: string;
  address: string;
  baseSalary: number;
  startingDay: string; // ISO date string
}
