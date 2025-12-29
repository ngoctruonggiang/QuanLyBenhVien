"use client";

import { useState, useEffect } from "react";
import { 
  Search,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  FolderPlus,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { categoryService } from "@/services/category.service";
import type { Category } from "@/interfaces/category";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminMedicineCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getList();
      setCategories(response.content || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setSaving(true);
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, data);
        toast.success("Đã cập nhật danh mục");
      } else {
        await categoryService.create(data);
        toast.success("Đã tạo danh mục mới");
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error(editingCategory ? "Không thể cập nhật" : "Không thể tạo danh mục");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;

    try {
      await categoryService.delete(deletingCategory.id);
      toast.success("Đã xóa danh mục");
      setDeletingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Không thể xóa danh mục");
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Danh mục thuốc</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {categories.length} danh mục
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-4 h-4" />
          Thêm danh mục
        </button>
      </div>

      {/* Search */}
      <div className="card-base">
        <div className="search-input w-full max-w-md">
          <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Tìm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="card-base text-center py-12">
          <FolderPlus className="w-12 h-12 mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            Không có danh mục nào
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="card-base hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <p className="text-small mt-1 line-clamp-2">
                    {category.description || "Không có mô tả"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="btn-icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditModal(category)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => setDeletingCategory(category)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-label">Tên danh mục *</label>
              <input
                type="text"
                className="input-base"
                placeholder="VD: Thuốc giảm đau"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-label">Mô tả</label>
              <textarea
                className="input-base min-h-[100px] resize-none"
                placeholder="Mô tả danh mục..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                Hủy
              </button>
              <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingCategory ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa danh mục "{deletingCategory?.name}"? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
