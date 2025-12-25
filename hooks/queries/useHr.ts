import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hrService } from "@/services/hr.service";
import {
  DepartmentRequest,
  ScheduleRequest,
  EmployeeRequest,
} from "@/interfaces/hr";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Hook to fetch the current user's employee profile by their accountId.
 * Useful for DOCTOR/NURSE/RECEPTIONIST roles to get their employeeId.
 */
export const useMyEmployeeProfile = () => {
  const { user } = useAuth();
  const accountId = user?.accountId;
  const isStaff = user?.role && ["DOCTOR", "NURSE", "RECEPTIONIST"].includes(user.role);
  
  return useQuery({
    queryKey: ["myEmployeeProfile", accountId],
    queryFn: () => hrService.getEmployeeByAccountId(accountId!),
    enabled: Boolean(accountId && isStaff),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useDepartments = ({
  page,
  size,
  search,
  status,
  sort,
}: {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  sort?: string;
}) => {
  return useQuery({
    queryKey: ["departments", { page, size, search, status, sort }],
    queryFn: () =>
      hrService.getDepartments({
        page,
        size,
        search,
        status,
        sort,
      }),
  });
};

export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: ["department", id],
    queryFn: () => hrService.getDepartment(id),
    enabled: !!id,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrService.createDepartment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
    } & Partial<DepartmentRequest>) => hrService.updateDepartment(id, data),
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
      await queryClient.invalidateQueries({ queryKey: ["department", id] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrService.deleteDepartment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export const useEmployees = ({
  page,
  size,
  search,
  sort,
  departmentId,
  role,
  status,
  enabled = true,
}: {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  departmentId?: string;
  role?: string;
  status?: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [
      "employees",
      { page, size, search, sort, departmentId, role, status },
    ],
    queryFn: () =>
      hrService.getEmployees({
        page,
        size,
        search,
        sort,
        departmentId,
        role,
        status,
      }),
    enabled,
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => hrService.getEmployee(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrService.createEmployee,
    onSuccess: async () => {
      // Wait for cache invalidation to complete before redirect
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
    } & Partial<EmployeeRequest>) => hrService.updateEmployee(id, data),
    onSuccess: async (_, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
      await queryClient.invalidateQueries({ queryKey: ["employee", id] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrService.deleteEmployee,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
};

export const useDoctorSchedules = ({
  departmentId,
  doctorId,
  startDate,
  endDate,
  status,
  page,
  size,
  enabled = true,
}: {
  departmentId?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  size?: number;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: [
      "doctorSchedules",
      { departmentId, doctorId, startDate, endDate, status, page, size },
    ],
    queryFn: () =>
      hrService.getDoctorSchedules({
        departmentId,
        doctorId,
        startDate,
        endDate,
        status,
        page,
        size,
      }),
    enabled,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrService.createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctorSchedules"] });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
    } & Partial<ScheduleRequest>) => hrService.updateSchedule(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["doctorSchedules"] });
      queryClient.invalidateQueries({ queryKey: ["schedule", id] });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrService.deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctorSchedules"] });
    },
  });
};
