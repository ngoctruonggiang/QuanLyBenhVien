"use client";

import { useState, useEffect } from "react";
import { 
  User,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Users,
  Save,
  Loader2,
  Camera,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { getMyProfile, updateMyProfile, uploadMyProfileImage, deleteMyProfileImage } from "@/services/patient.service";
import { Patient } from "@/interfaces/patient";
import { AvatarUpload } from "@/components/ui/avatar-upload";

export default function PatientProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    address: "",
    allergies: "",
    relativeFullName: "",
    relativePhoneNumber: "",
    relativeRelationship: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
      setFormData({
        phoneNumber: data.phoneNumber || "",
        address: data.address || "",
        allergies: data.allergies || "",
        relativeFullName: data.relativeFullName || "",
        relativePhoneNumber: data.relativePhoneNumber || "",
        relativeRelationship: data.relativeRelationship || "",
      });
    } catch (error) {
      toast.error("Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateMyProfile({
        ...formData,
        relativeRelationship: formData.relativeRelationship as any || undefined,
      });
      toast.success("Đã cập nhật hồ sơ thành công!");
      fetchProfile();
    } catch (error) {
      toast.error("Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("vi-VN");
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
          <AvatarUpload
            currentImageUrl={profile?.profileImageUrl}
            userName={profile?.fullName}
            size="xl"
            editable={true}
            onUpload={async (file) => {
              try {
                const updated = await uploadMyProfileImage(file);
                setProfile(updated);
                toast.success("Đã cập nhật ảnh đại diện");
              } catch (error) {
                toast.error("Không thể upload ảnh");
              }
            }}
            onDelete={async () => {
              try {
                const updated = await deleteMyProfileImage();
                setProfile(updated);
                toast.success("Đã xóa ảnh đại diện");
              } catch (error) {
                toast.error("Không thể xóa ảnh");
              }
            }}
          />
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold">{profile?.fullName}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(profile?.dateOfBirth || null)}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {profile?.gender === "MALE" ? "Nam" : profile?.gender === "FEMALE" ? "Nữ" : "Khác"}
              </span>
            </div>
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

      {/* Emergency Contact */}
      <div className="card-base">
        <h3 className="text-section mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Người thân liên hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-label">Họ tên</label>
            <input
              type="text"
              className="input-base"
              value={formData.relativeFullName}
              onChange={(e) => setFormData({ ...formData, relativeFullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-label">Số điện thoại</label>
            <input
              type="tel"
              className="input-base"
              value={formData.relativePhoneNumber}
              onChange={(e) => setFormData({ ...formData, relativePhoneNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-label">Quan hệ</label>
            <select
              className="dropdown w-full"
              value={formData.relativeRelationship}
              onChange={(e) => setFormData({ ...formData, relativeRelationship: e.target.value })}
            >
              <option value="">-- Chọn --</option>
              <option value="PARENT">Cha/Mẹ</option>
              <option value="SPOUSE">Vợ/Chồng</option>
              <option value="SIBLING">Anh/Chị/Em</option>
              <option value="CHILD">Con</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medical Info */}
      <div className="card-base">
        <h3 className="text-section mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Thông tin y tế
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
            <p className="text-label">Nhóm máu</p>
            <p className="text-lg font-semibold">{profile?.bloodType || "Chưa cập nhật"}</p>
          </div>
          <div className="p-4 rounded-xl bg-[hsl(var(--secondary))]">
            <p className="text-label">Số BHYT</p>
            <p className="text-lg font-semibold">{profile?.healthInsuranceNumber || "Chưa cập nhật"}</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label className="text-label">Dị ứng</label>
          <textarea
            className="input-base min-h-[80px] resize-none"
            placeholder="Liệt kê các dị ứng (nếu có)..."
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
          />
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
