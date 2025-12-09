import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryService } from "@/services/category.service";
import { CategoryRequest } from "@/interfaces/category";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params: any) => [...categoryKeys.lists(), params] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Get category list
export const useCategories = (params?: any) => {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryService.getList(params),
  });
};

// Get a single category
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  });
};

// Create a category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryRequest) => categoryService.create(data),
    onSuccess: () => {
      toast.success("Category created successfully.");
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || "Failed to create category.";
      toast.error(message);
    },
  });
};

// Update a category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CategoryRequest> }) =>
      categoryService.update(id, data),
    onSuccess: (_, { id }) => {
      toast.success("Category updated successfully.");
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || "Failed to update category.";
      toast.error(message);
    },
  });
};

// Delete a category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      toast.success("Category deleted successfully.");
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || "Failed to delete category.";
      toast.error(message);
    },
  });
};