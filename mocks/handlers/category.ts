import { http, HttpResponse } from "msw";
import { mockCategories } from "@/lib/mocks/data/categories";
import { Category, CategoryRequest } from "@/interfaces/category";

const API_URL = "/api/medicines/categories";

export const categoryHandlers = [
  // List Categories
  http.get(API_URL, () => {
    return HttpResponse.json({
      data: {
        content: mockCategories,
        page: 0,
        size: mockCategories.length,
        totalElements: mockCategories.length,
        totalPages: 1,
        last: true,
      },
    });
  }),

  // Create Category
  http.post(API_URL, async ({ request }) => {
    const newCategoryData = (await request.json()) as CategoryRequest;
    
    // Basic validation
    if (!newCategoryData.name) {
      return HttpResponse.json({ status: 'error', error: { code: 'VALIDATION_ERROR', message: 'Category name is required' }}, { status: 400 });
    }

    const newCategory: Category = {
      id: `cat-${Math.random().toString(36).substring(2, 9)}`,
      ...newCategoryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCategories.push(newCategory);

    return HttpResponse.json({ data: newCategory }, { status: 201 });
  }),

  // Update Category
  http.patch(`${API_URL}/:id`, async ({ request, params }) => {
    const { id } = params;
    const updatedData = (await request.json()) as Partial<CategoryRequest>;
    const categoryIndex = mockCategories.findIndex((cat) => cat.id === id);

    if (categoryIndex === -1) {
      return HttpResponse.json({ status: 'error', error: { code: 'CATEGORY_NOT_FOUND', message: 'Category not found' }}, { status: 404 });
    }

    mockCategories[categoryIndex] = {
      ...mockCategories[categoryIndex],
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ data: mockCategories[categoryIndex] });
  }),

  // Delete Category
  http.delete(`${API_URL}/:id`, ({ params }) => {
    const { id } = params;
    const categoryIndex = mockCategories.findIndex((cat) => cat.id === id);

    if (categoryIndex === -1) {
        return HttpResponse.json({ status: 'error', error: { code: 'CATEGORY_NOT_FOUND', message: 'Category not found' }}, { status: 404 });
    }

    mockCategories.splice(categoryIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
