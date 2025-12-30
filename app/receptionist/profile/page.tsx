"use client";

import { useState, useEffect } from "react";
import { 
  User,
  Phone,
  MapPin,
  Briefcase,
  Save,
  Loader2,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { hrService } from "@/services/hr.service";
import { useAuth } from "@/contexts/AuthContext";
import type { Employee } from "@/interfaces/hr";

export default function ReceptionistProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      if (user?.accountId) {
        const employee = await hrService.getEmployeeByAccountId(user.accountId);
        if (employee) {
          setProfile(employee);
          setFormData({
            phoneNumber: employee.phoneNumber || "",
            address: employee.address || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      await hrService.updateEmployee(profile.id, formData);
      toast.success("Đã cập nhật thông tin thành công!");
      fetchProfile();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-display">Hồ sơ cá nhân</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Quản lý thông tin cá nhân của bạn
        </p>
      </div>

      {/* Avatar & Basic Info */}
      <div className="card-base">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-[hsl(var(--primary-light))] flex items-center justify-center text-4xl font-bold text-[hsl(var(--primary))]">
              {profile?.fullName?.charAt(0) || "?"}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[hsl(var(--primary))] text-white flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">{profile?.fullName}</h2>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              {profile?.departmentName || "Chưa có phòng ban"}
            </p>
            <span className={`badge mt-2 ${profile?.status === "ACTIVE" ? "badge-success" : "badge-warning"}`}>
              {profile?.status === "ACTIVE" ? "Đang làm việc" : profile?.status}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="card-base">
        <h3 className="text-section mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Thông tin liên hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-label">Số điện thoại</label>
            <input
              type="tel"
              className="input-base"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-label">Địa chỉ</label>
            <input
              type="text"
              className="input-base"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="card-base">
        <h3 className="text-section mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Thông tin tài khoản
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
            <p className="text-label">Email đăng nhập</p>
            <p className="text-lg font-semibold">{user?.email || "-"}</p>
          </div>
          <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
            <p className="text-label">Vai trò</p>
            <p className="text-lg font-semibold">{user?.role || "RECEPTIONIST"}</p>
          </div>
        </div>
        <p className="text-small text-[hsl(var(--muted-foreground))] mt-3">
          Liên hệ quản trị viên để thay đổi email hoặc mật khẩu.
        </p>
      </div>

      {/* Work Info (Read-only) */}
      <div className="card-base">
        <h3 className="text-section mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Thông tin công việc
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
            <p className="text-label">Phòng ban</p>
            <p className="text-lg font-semibold">{profile?.departmentName || "-"}</p>
          </div>
          <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
            <p className="text-label">Vai trò</p>
            <p className="text-lg font-semibold">{profile?.role || "-"}</p>
          </div>
          {profile?.hiredAt && (
            <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
              <p className="text-label">Ngày vào làm</p>
              <p className="text-lg font-semibold">
                {new Date(profile.hiredAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          <Save className="w-4 h-4" />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
