import { Category, CategoryRequest } from "@/interfaces/category";
import { mockCategories } from "@/lib/mocks/data/categories";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Use a local mutable array to simulate a database
export let categoriesDB = [...mockCategories];

export const categoryService = {
  getList: async (params?: { page?: number; size?: number; sort?: string; search?: string }) => {
    await delay(500);
    let data = [...categoriesDB];

    // Simulate search
    if (params?.search) {
      const lowerSearch = params.search.toLowerCase();
      data = data.filter(cat => cat.name.toLowerCase().includes(lowerSearch));
    }
    
    // Simulate pagination
    const page = params?.page || 0;
    const size = params?.size || 10;
    const totalElements = data.length;
    const totalPages = Math.ceil(totalElements / size);
    const paginatedData = data.slice(page * size, (page + 1) * size);

    return {
      data: {
        content: paginatedData,
        page,
        size,
        totalElements,
        totalPages,
      }
    };
  },

  getById: async (id: string) => {
    await delay(300);
    const category = categoriesDB.find((c) => c.id === id);
    if (!category) throw new Error("Category not found");
    return { data: category };
  },

  create: async (data: CategoryRequest) => {
    await delay(500);
    const newCategory: Category = {
      id: `cat-${Math.random().toString(36).substring(2, 9)}`,
      name: data.name,
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    categoriesDB.push(newCategory);
    return { data: newCategory };
  },

  update: async (id: string, data: Partial<CategoryRequest>) => {
    await delay(500);
    const index = categoriesDB.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Category not found");
    
    categoriesDB[index] = { ...categoriesDB[index], ...data, updatedAt: new Date().toISOString() };
    return { data: categoriesDB[index] };
  },

  delete: async (id: string) => {
    await delay(500);
    const index = categoriesDB.findIndex((c) => c.id === id);
    if (index === -1) {
      // In a real API this might throw an error, but for mock purposes, we can just warn
      console.warn(`Category with id ${id} not found for deletion.`);
      return;
    }
    categoriesDB.splice(index, 1);
    return; // DELETE returns no content
  },
};