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
import { authService, Account } from "@/services/auth.service";
import { Employee, EmployeeRequest, EmployeeRole, EmployeeStatus } from "@/interfaces/hr";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { UserAvatar } from "@/components/ui/user-avatar";
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
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

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
        role: roleFilter || undefined,
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

  const handleExportExcel = () => {
    try {
      // Prepare data for export
      const exportData = employees.map(emp => ({
        "Họ và tên": emp.fullName,
        "ID": emp.id,
        "Số điện thoại": emp.phoneNumber || "-",
        "Phòng ban": emp.departmentName || "-",
        "Vị trí": getRoleLabel(emp.role || ""),
        "Trạng thái": emp.status === "ACTIVE" ? "Đang làm việc" : emp.status === "ON_LEAVE" ? "Nghỉ phép" : "Đã nghỉ việc",
        "Chuyên khoa": emp.specialization || "-",
        "Số chứng chỉ": emp.licenseNumber || "-",
        "Địa chỉ": emp.address || "-",
      }));

      // Create CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(","),
        ...exportData.map(row => 
          headers.map(h => `"${(row as any)[h] || ""}"`).join(",")
        )
      ].join("\n");

      // Download
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `NhanVien_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Đã xuất file Excel thành công");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Không thể xuất file Excel");
    }
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
          <button onClick={handleExportExcel} className="btn-outline-icon">
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
                <tr 
                  key={employee.id}
                  className="cursor-pointer hover:bg-[hsl(var(--secondary))] transition-colors"
                  onClick={() => setViewingEmployee(employee)}
                >
                  {/* Employee Info */}
                  <td>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        imageUrl={employee.profileImageUrl}
                        userName={employee.fullName}
                        size="sm"
                      />
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
                        -
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
                      {employee.departmentName || "-"}
                    </div>
                  </td>

                  {/* Position */}
                  <td>
                    <span className={`badge ${getRoleBadge(employee.role || "")}`}>
                      {getRoleLabel(employee.role || "")}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`badge ${
                      employee.status === "ACTIVE" 
                        ? "badge-success" 
                        : "badge-danger"
                    }`}>
                      {employee.status === "ACTIVE" ? "Đang làm" : "Nghỉ việc"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td onClick={(e) => e.stopPropagation()}>
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

      {/* Employee Detail Modal */}
      <Dialog open={!!viewingEmployee} onOpenChange={() => setViewingEmployee(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Chi tiết nhân viên</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {viewingEmployee && (
            <div className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex justify-center py-4">
                <AvatarUpload
                  currentImageUrl={viewingEmployee.profileImageUrl}
                  userName={viewingEmployee.fullName}
                  size="xl"
                  editable={true}
                  onUpload={async (file) => {
                    try {
                      await hrService.uploadEmployeeProfileImage(viewingEmployee.id, file);
                      toast.success("Đã cập nhật ảnh đại diện");
                      fetchEmployees();
                    } catch (error) {
                      toast.error("Không thể upload ảnh");
                    }
                  }}
                  onDelete={async () => {
                    try {
                      await hrService.deleteEmployeeProfileImage(viewingEmployee.id);
                      toast.success("Đã xóa ảnh đại diện");
                      fetchEmployees();
                    } catch (error) {
                      toast.error("Không thể xóa ảnh");
                    }
                  }}
                />
              </div>

              {/* Profile Header */}
              <div className="text-center">
                <p className="font-bold text-lg text-gray-900">{viewingEmployee.fullName}</p>
                <span className={`badge ${getRoleBadge(viewingEmployee.role || "")}`}>
                  {getRoleLabel(viewingEmployee.role || "")}
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                  <p className="text-label text-gray-500">Phòng ban</p>
                  <p className="font-semibold text-gray-900">{viewingEmployee.departmentName || "Chưa gán"}</p>
                </div>
                <div className="p-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                  <p className="text-label text-gray-500">Số điện thoại</p>
                  <p className="font-semibold text-gray-900">{viewingEmployee.phoneNumber || "-"}</p>
                </div>
                <div className="p-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                  <p className="text-label text-gray-500">Chuyên khoa</p>
                  <p className="font-semibold text-gray-900">{viewingEmployee.specialization || "-"}</p>
                </div>
                <div className="p-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                  <p className="text-label text-gray-500">Trạng thái</p>
                  <span className={`badge ${viewingEmployee.status === "ACTIVE" ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}>
                    {viewingEmployee.status === "ACTIVE" ? "✓ Đang làm" : "Nghỉ việc"}
                  </span>
                </div>
              </div>

              {/* ID */}
              <div className="p-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                <p className="text-label text-gray-500">Mã nhân viên</p>
                <p className="font-mono text-sm text-gray-700">{viewingEmployee.id}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    setViewingEmployee(null);
                    setEditingEmployee(viewingEmployee);
                    setIsFormOpen(true);
                  }}
                  className="btn-secondary flex-1"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

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
  const [formData, setFormData] = useState<EmployeeRequest>({
    accountId: employee?.accountId || "",
    fullName: employee?.fullName || "",
    role: employee?.role || "DOCTOR",
    departmentId: employee?.departmentId || "",
    specialization: employee?.specialization || "",
    licenseNumber: employee?.licenseNumber || "",
    phoneNumber: employee?.phoneNumber || "",
    address: employee?.address || "",
    status: employee?.status || "ACTIVE",
    hiredAt: employee?.hiredAt || "",
  });

  // Account search states
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accountSearch, setAccountSearch] = useState("");
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [selectedAccountEmail, setSelectedAccountEmail] = useState("");

  // Fetch staff accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoadingAccounts(true);
      try {
        // Get accounts with staff roles only
        const response = await authService.getAccounts(
          undefined,
          ["DOCTOR", "NURSE", "RECEPTIONIST", "ADMIN"]
        );
        setAccounts(response.content || []);
        // If editing, find the selected account's email
        if (employee?.accountId) {
          const acc = response.content?.find(a => a.id === employee.accountId);
          if (acc) setSelectedAccountEmail(acc.email);
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setLoadingAccounts(false);
      }
    };
    fetchAccounts();
  }, [employee?.accountId]);

  const filteredAccounts = accounts.filter(acc => 
    acc.email.toLowerCase().includes(accountSearch.toLowerCase())
  );

  const handleAccountSelect = (account: Account) => {
    setFormData({ ...formData, accountId: account.id });
    setSelectedAccountEmail(account.email);
    setShowAccountDropdown(false);
    setAccountSearch("");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowAccountDropdown(false);
    if (showAccountDropdown) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showAccountDropdown]);

  const handleClearAccount = () => {
    setFormData({ ...formData, accountId: "" });
    setSelectedAccountEmail("");
  };

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

  const roles: EmployeeRole[] = ["DOCTOR", "NURSE", "RECEPTIONIST", "ADMIN"];
  const statuses: EmployeeStatus[] = ["ACTIVE", "ON_LEAVE", "RESIGNED"];

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

        {/* Account (for login) */}
        <div className="col-span-2 sm:col-span-1 space-y-2">
          <label className="text-label">Tài khoản đăng nhập</label>
          <div className="relative">
            {selectedAccountEmail ? (
              <div className="input-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{selectedAccountEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAccount}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    className="input-base pl-10"
                    placeholder="Tìm tài khoản theo email..."
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    onFocus={() => setShowAccountDropdown(true)}
                  />
                  {loadingAccounts && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>
                {showAccountDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredAccounts.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        {accountSearch ? "Không tìm thấy" : "Nhập để tìm kiếm"}
                      </div>
                    ) : (
                      filteredAccounts.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => handleAccountSelect(acc)}
                          className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b last:border-b-0"
                        >
                          <div className="avatar w-8 h-8 text-xs">
                            {acc.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{acc.email}</p>
                            <p className="text-xs text-gray-500">{acc.role}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <p className="text-xs text-gray-500">Chọn tài khoản để nhân viên có thể đăng nhập hệ thống</p>
        </div>

        {/* Role */}
        <div className="space-y-2">
          <label className="text-label">Vai trò *</label>
          <select
            className="input-base"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
            required
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role === "DOCTOR" ? "Bác sĩ" : 
                 role === "NURSE" ? "Y tá" : 
                 role === "RECEPTIONIST" ? "Lễ tân" : "Quản trị"}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div className="space-y-2">
          <label className="text-label">Khoa *</label>
          <select
            className="input-base"
            value={formData.departmentId}
            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
            required
          >
            <option value="">Chọn khoa</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Specialization */}
        <div className="space-y-2">
          <label className="text-label">Chuyên khoa</label>
          <input
            type="text"
            className="input-base"
            value={formData.specialization}
            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            placeholder="VD: Tim mạch, Nội tiết"
          />
        </div>

        {/* License Number */}
        <div className="space-y-2">
          <label className="text-label">Số chứng chỉ hành nghề</label>
          <input
            type="text"
            className="input-base"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            placeholder="XX-12345"
            pattern="^[A-Z]{2}-[0-9]{5}$"
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Định dạng: 2 chữ cái viết hoa, dấu gạch ngang, 5 số (VD: BS-12345)</p>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-label">Số điện thoại</label>
          <input
            type="tel"
            className="input-base"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="0123456789"
            pattern="^[0-9]{10,15}$"
          />
          <p className="text-xs text-[hsl(var(--muted-foreground))]">10-15 chữ số</p>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-label">Trạng thái *</label>
          <select
            className="input-base"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as EmployeeStatus })}
            required
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "ACTIVE" ? "Đang làm việc" : 
                 status === "ON_LEAVE" ? "Nghỉ phép" : "Đã nghỉ việc"}
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

        {/* Hired At */}
        <div className="col-span-2 sm:col-span-1 space-y-2">
          <label className="text-label">Ngày bắt đầu làm việc</label>
          <input
            type="date"
            className="input-base"
            value={formData.hiredAt}
            onChange={(e) => setFormData({ ...formData, hiredAt: e.target.value })}
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
