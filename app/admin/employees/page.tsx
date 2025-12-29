"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Filter,
  Download,
  Mail,
  Phone,
  Building2,
  User,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { hrService } from "@/services/hr.service";
import { Employee } from "@/interfaces/employee";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);

  // Fetch data
  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [searchQuery, roleFilter, departmentFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await hrService.getEmployees({
        search: searchQuery || undefined,
        position: roleFilter || undefined,
        departmentId: departmentFilter || undefined,
      });
      setEmployees(response.content || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await hrService.getDepartments();
      setDepartments(response.content || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteEmployee) return;
    
    try {
      await hrService.deleteEmployee(deleteEmployee.id);
      toast.success("Đã xóa nhân viên thành công");
      setDeleteEmployee(null);
      fetchEmployees();
    } catch (error) {
      toast.error("Không thể xóa nhân viên");
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  const roles = ["DOCTOR", "NURSE", "RECEPTIONIST", "ADMIN"];

  const getRoleBadge = (position: string) => {
    const badges: Record<string, string> = {
      DOCTOR: "badge-info",
      NURSE: "badge-success",
      RECEPTIONIST: "badge-warning",
      ADMIN: "badge-danger",
    };
    return badges[position] || "badge-info";
  };

  const getRoleLabel = (position: string) => {
    const labels: Record<string, string> = {
      DOCTOR: "Bác sĩ",
      NURSE: "Y tá",
      RECEPTIONIST: "Lễ tân",
      ADMIN: "Quản trị",
    };
    return labels[position] || position;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Quản lý nhân viên</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            {employees.length} nhân viên trong hệ thống
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <button className="btn-primary" onClick={() => setEditingEmployee(null)}>
              <Plus className="w-5 h-5" />
              Thêm nhân viên
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
              </DialogTitle>
            </DialogHeader>
            <EmployeeForm
              employee={editingEmployee}
              departments={departments}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="card-base">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="search-input w-full max-w-none">
              <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Role Filter */}
          <select
            className="dropdown min-w-[150px]"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tất cả vị trí</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {getRoleLabel(role)}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            className="dropdown min-w-[180px]"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">Tất cả phòng ban</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* Export */}
          <button className="btn-outline-icon">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table-base">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Liên hệ</th>
              <th>Phòng ban</th>
              <th>Vị trí</th>
              <th>Trạng thái</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--primary))]" />
                  <p className="text-small mt-2">Đang tải...</p>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <User className="w-12 h-12 mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
                  <p className="text-[hsl(var(--muted-foreground))] mt-2">
                    Chưa có nhân viên nào
                  </p>
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id}>
                  {/* Employee Info */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        {employee.fullName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium">{employee.fullName}</p>
                        <p className="text-small">ID: {employee.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        {employee.email || "-"}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                        {employee.phoneNumber || "-"}
                      </div>
                    </div>
                  </td>

                  {/* Department */}
                  <td>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      {employee.department || "-"}
                    </div>
                  </td>

                  {/* Position */}
                  <td>
                    <span className={`badge ${getRoleBadge(employee.position || "")}`}>
                      {getRoleLabel(employee.position || "")}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`badge ${
                      employee.status === "Active" 
                        ? "badge-success" 
                        : "badge-danger"
                    }`}>
                      {employee.status === "Active" ? "Đang làm" : "Nghỉ việc"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="btn-icon w-8 h-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingEmployee(employee);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => setDeleteEmployee(employee)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteEmployee} onOpenChange={() => setDeleteEmployee(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên "{deleteEmployee?.fullName}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Employee Form Component
interface EmployeeFormProps {
  employee: Employee | null;
  departments: { id: string; name: string }[];
  onSuccess: () => void;
  onCancel: () => void;
}

function EmployeeForm({ employee, departments, onSuccess, onCancel }: EmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: employee?.fullName || "",
    email: employee?.email || "",
    phoneNumber: employee?.phoneNumber || "",
    dateOfBirth: employee?.dateOfBirth || "",
    gender: employee?.gender || "Male",
    department: employee?.department || "",
    position: employee?.position || "DOCTOR",
    address: employee?.address || "",
    idCard: employee?.idCard || "",
    baseSalary: employee?.baseSalary || 0,
    startingDay: employee?.startingDay || new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (employee) {
        await hrService.updateEmployee(employee.id, formData);
        toast.success("Đã cập nhật nhân viên thành công");
      } else {
        await hrService.createEmployee(formData);
        toast.success("Đã thêm nhân viên mới thành công");
      }
      onSuccess();
    } catch (error) {
      toast.error(employee ? "Không thể cập nhật nhân viên" : "Không thể thêm nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const positions = ["DOCTOR", "NURSE", "RECEPTIONIST", "ADMIN"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="col-span-2 sm:col-span-1 space-y-2">
          <label className="text-label">Họ và tên *</label>
          <input
            type="text"
            className="input-base"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>

        {/* Email */}
        <div className="col-span-2 sm:col-span-1 space-y-2">
          <label className="text-label">Email *</label>
          <input
            type="email"
            className="input-base"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-label">Số điện thoại</label>
          <input
            type="tel"
            className="input-base"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          />
        </div>

        {/* ID Card */}
        <div className="space-y-2">
          <label className="text-label">CMND/CCCD</label>
          <input
            type="text"
            className="input-base"
            value={formData.idCard}
            onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <label className="text-label">Ngày sinh</label>
          <input
            type="date"
            className="input-base"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="text-label">Giới tính</label>
          <select
            className="input-base"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          >
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
            <option value="Other">Khác</option>
          </select>
        </div>

        {/* Position */}
        <div className="space-y-2">
          <label className="text-label">Vị trí *</label>
          <select
            className="input-base"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            required
          >
            {positions.map((pos) => (
              <option key={pos} value={pos}>
                {pos === "DOCTOR" ? "Bác sĩ" : 
                 pos === "NURSE" ? "Y tá" : 
                 pos === "RECEPTIONIST" ? "Lễ tân" : "Quản trị"}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div className="space-y-2">
          <label className="text-label">Phòng ban</label>
          <select
            className="input-base"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          >
            <option value="">Chọn phòng ban</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div className="col-span-2 space-y-2">
          <label className="text-label">Địa chỉ</label>
          <input
            type="text"
            className="input-base"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        {/* Base Salary */}
        <div className="space-y-2">
          <label className="text-label">Lương cơ bản</label>
          <input
            type="number"
            className="input-base"
            value={formData.baseSalary}
            onChange={(e) => setFormData({ ...formData, baseSalary: Number(e.target.value) })}
          />
        </div>

        {/* Starting Day */}
        <div className="space-y-2">
          <label className="text-label">Ngày bắt đầu</label>
          <input
            type="date"
            className="input-base"
            value={formData.startingDay}
            onChange={(e) => setFormData({ ...formData, startingDay: e.target.value })}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Hủy
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {employee ? "Cập nhật" : "Thêm mới"}
        </button>
      </div>
    </form>
  );
}
