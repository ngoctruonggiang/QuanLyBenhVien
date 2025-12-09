import { Category } from "@/interfaces/category";

export const mockCategories: Category[] = [
    {
      id: "cat-001",
      name: "Antibiotics",
      description: "Medications that fight bacterial infections",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cat-002",
      name: "Painkillers",
      description: "Medications used to relieve pain",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
        id: "cat-003",
        name: "Vitamins",
        description: "Nutritional supplements for health",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];
