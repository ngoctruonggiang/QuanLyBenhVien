import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hrService } from "@/services/hr.service";
import {
  Department,
  DepartmentRequest,
  Employee,
  EmployeeRequest,
  EmployeeSchedule,
  ScheduleRequest,
} from "@/interfaces/hr";

// Define param types locally based on service
type DepartmentSearchParams = {
  page?: number;
  size?: number;
  sort?: string;
  status?: string;
  search?: string;
};

type EmployeeSearchParams = {
  page?: number;
  size?: number;
  sort?: string;
  departmentId?: string;
  role?: string;
  status?: string;
  search?: string;
};

type DoctorScheduleSearchParams = {
  departmentId?: string;
  doctorId?: string;
  startDate: string;
  endDate: string;
  status?: string;
  page?: number;
  size?: number;
};

// Paginated response type
type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
};

// Keys
export const hrKeys = {
  all: ["hr"] as const,
  departments: () => [...hrKeys.all, "departments"] as const,
  departmentsList: (params: DepartmentSearchParams) =>
    [...hrKeys.departments(), "list", params] as const,
  department: (id: string) => [...hrKeys.departments(), id] as const,
  employees: () => [...hrKeys.all, "employees"] as const,
  employeesList: (params: EmployeeSearchParams) =>
    [...hrKeys.employees(), "list", params] as const,
  employee: (id: string) => [...hrKeys.employees(), id] as const,
  schedules: () => [...hrKeys.all, "schedules"] as const,
  doctorSchedules: (params: DoctorScheduleSearchParams) =>
    [...hrKeys.schedules(), "doctor", params] as const,
  schedule: (id: string) => [...hrKeys.schedules(), id] as const,
};

// Departments
export const useDepartments = (params?: DepartmentSearchParams) => {
  return useQuery<PageResponse<Department>>({
    queryKey: hrKeys.departmentsList(params || {}),
    queryFn: () => hrService.getDepartments(params),
  });
};

export const useDepartment = (id: string) => {
  return useQuery<Department | undefined>({
    queryKey: hrKeys.department(id),
    queryFn: () => hrService.getDepartment(id),
    enabled: !!id,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DepartmentRequest) => hrService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.departments() });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<DepartmentRequest>;
    }) => hrService.updateDepartment(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.departments() });
      queryClient.invalidateQueries({
        queryKey: hrKeys.department(variables.id),
      });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.departments() });
    },
  });
};

// Employees
export const useEmployees = (params: EmployeeSearchParams) => {
  return useQuery<PageResponse<Employee>>({
    queryKey: hrKeys.employeesList(params),
    queryFn: () => hrService.getEmployees(params),
  });
};

export const useEmployee = (id: string) => {
  return useQuery<Employee | undefined>({
    queryKey: hrKeys.employee(id),
    queryFn: () => hrService.getEmployee(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EmployeeRequest) => hrService.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<EmployeeRequest>;
    }) => hrService.updateEmployee(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() });
      queryClient.invalidateQueries({
        queryKey: hrKeys.employee(variables.id),
      });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.employees() });
    },
  });
};

// Schedule type with extra fields
type ScheduleWithExtra = EmployeeSchedule & {
  departmentId?: string;
  departmentName?: string;
  shift?: string;
};

// Schedules
export const useDoctorSchedules = (params: DoctorScheduleSearchParams) => {
  return useQuery<PageResponse<ScheduleWithExtra>>({
    queryKey: hrKeys.doctorSchedules(params),
    queryFn: () => hrService.getDoctorSchedules(params),
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ScheduleRequest) => hrService.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.schedules() });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ScheduleRequest>;
    }) => hrService.updateSchedule(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: hrKeys.schedules() });
      queryClient.invalidateQueries({
        queryKey: hrKeys.schedule(variables.id),
      });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrKeys.schedules() });
    },
  });
};
