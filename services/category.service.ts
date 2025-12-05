import type { Category } from "@/interfaces/category";

// Danh sách tên danh mục
const mockCategoryNames = [
  "Antibiotic",
  "Painkiller",
  "Vitamin",
  "Supplement",
  "Fever Relief",
  "Digestive",
  "Cough & Cold",
  "Allergy",
  "Heart Health",
  "Diabetes Care",
];

// Tạo danh mục mock
const generateMockCategories = (): Category[] => {
  const list: Category[] = [];

  for (let i = 1; i <= 10; i++) {
    list.push({
      id: `cat-${i}`,
      categoryName: mockCategoryNames[i - 1],
      description:
        i % 2 === 0 ? `Description for ${mockCategoryNames[i - 1]}` : null,
    });
  }

  return list;
};

const CATEGORIES = generateMockCategories();

export const getCategories = async (): Promise<Category[]> => {
  await new Promise((r) => setTimeout(r, 300));
  return CATEGORIES;
};
