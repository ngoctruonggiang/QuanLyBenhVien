import {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
} from "@/services/medicine.service";
import {
  MedicineListParams,
  CreateMedicineRequest,
  UpdateMedicineRequest,
} from "@/interfaces/medicine";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query key factory
export const medicineKeys = {
  all: ["medicines"] as const,
  list: (params: MedicineListParams) => ["medicines", "list", params] as const,
  detail: (id: string) => ["medicines", "detail", id] as const,
};

// List medicines with filters and pagination
export const useMedicines = (params: MedicineListParams = {}) => {
  return useQuery({
    queryKey: medicineKeys.list(params),
    queryFn: () => getMedicines(params),
  });
};

// Get single medicine by ID
export const useMedicine = (id: string) => {
  return useQuery({
    queryKey: medicineKeys.detail(id),
    queryFn: () => getMedicine(id),
    enabled: !!id,
  });
};

// Create new medicine
export const useCreateMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMedicineRequest) => createMedicine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicineKeys.all });
      toast.success("Medicine created successfully");
    },
    onError: (error: any) => {
      const code = error?.response?.data?.error?.code;
      if (code === "DUPLICATE_NAME") {
        toast.error("A medicine with this name already exists");
      } else {
        toast.error("Failed to create medicine");
      }
    },
  });
};

// Update medicine
export const useUpdateMedicine = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMedicineRequest) => updateMedicine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicineKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: medicineKeys.all });
      toast.success("Medicine updated successfully");
    },
    onError: (error: any) => {
      const code = error?.response?.data?.error?.code;
      if (code === "MEDICINE_NOT_FOUND") {
        toast.error("Medicine not found");
      } else {
        toast.error("Failed to update medicine");
      }
    },
  });
};

// Delete medicine
export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMedicine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicineKeys.all });
      toast.success("Medicine deleted successfully");
    },
    onError: (error: any) => {
      const code = error?.response?.data?.error?.code;
      if (code === "MEDICINE_NOT_FOUND") {
        toast.error("Medicine not found");
      } else if (code === "MEDICINE_IN_USE") {
        toast.error("Cannot delete: medicine is in use by prescriptions");
      } else {
        toast.error("Failed to delete medicine");
      }
    },
  });
};

// Legacy exports for backward compatibility
export const useMedicineById = useMedicine;
