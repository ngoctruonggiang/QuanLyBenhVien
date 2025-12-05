import { getCategories } from "@/services/category.service";
import { useQuery } from "@tanstack/react-query";
export const useCategory = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories(),
    });
};
