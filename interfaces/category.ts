export interface Category {
  id: string;
  name: string; // Changed from categoryName to name for consistency
  description?: string | null;
  createdAt?: string; // Add these for consistency with mock service
  updatedAt?: string; // Add these for consistency with mock service
}

export interface CategoryRequest {
  name: string;
  description?: string | null;
}
