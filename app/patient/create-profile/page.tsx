"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User,
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createMyProfile } from "@/services/patient.service";

export default function PatientCreateProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
    phoneNumber: "",
    address: "",
    identityNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.dateOfBirth || !formData.gender) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);
      await createMyProfile({
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber || undefined,
        address: formData.address || undefined,
      });
      toast.success("Tạo hồ sơ thành công!");
      router.push("/patient/dashboard");
    } catch (error) {
      toast.error("Không thể tạo hồ sơ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--background))]">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-display">Tạo hồ sơ bệnh nhân</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2">
            Vui lòng điền thông tin để hoàn tất đăng ký
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-base space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-label flex items-center gap-2">
              <User className="w-4 h-4" />
              Họ và tên *
            </label>
            <input
              type="text"
              className="input-base"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <label className="text-label flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Ngày sinh *
            </label>
            <input
              type="date"
              className="input-base"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-label">Giới tính *</label>
            <div className="flex gap-2">
              {[
                { value: "MALE", label: "Nam" },
                { value: "FEMALE", label: "Nữ" },
                { value: "OTHER", label: "Khác" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: option.value as any })}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                    formData.gender === option.value
                      ? "bg-[hsl(var(--primary))] text-white"
                      : "bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-label flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Số điện thoại
            </label>
            <input
              type="tel"
              className="input-base"
              placeholder="0901234567"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-label flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Địa chỉ
            </label>
            <input
              type="text"
              className="input-base"
              placeholder="123 Đường ABC, Quận 1, TP.HCM"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* Identity Number */}
          <div className="space-y-2">
            <label className="text-label flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              CMND/CCCD
            </label>
            <input
              type="text"
              className="input-base"
              placeholder="012345678901"
              maxLength={12}
              value={formData.identityNumber}
              onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            Tạo hồ sơ
          </button>
        </form>
      </div>
    </div>
  );
}
