"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TagInput } from "@/components/ui/tag-input";
import { useMyProfile, useUpdateMyProfile } from "@/hooks/queries/usePatient";
import { RelationshipType } from "@/interfaces/patient";
import { Spinner } from "@/components/ui/spinner";
import {
  User,
  Heart,
  Phone,
  Lock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Save,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const editSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^0[0-9]{9}$/, "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0"),
  address: z.string().max(255, "Tối đa 255 ký tự").optional().or(z.literal("")),
  allergies: z.array(z.string()).optional(),
  relativeFullName: z
    .string()
    .max(100, "Tối đa 100 ký tự")
    .optional()
    .or(z.literal("")),
  relativePhoneNumber: z
    .string()
    .regex(/^0[0-9]{9}$/, "Số điện thoại phải có 10 chữ số và bắt đầu bằng 0")
    .optional()
    .or(z.literal("")),
  relativeRelationship: z
    .enum(["SPOUSE", "PARENT", "CHILD", "SIBLING", "FRIEND", "OTHER"] as const)
    .optional()
    .or(z.literal("")),
});

type EditFormValues = z.infer<typeof editSchema>;

const relationships: { value: RelationshipType; label: string }[] = [
  { value: "SPOUSE", label: "Vợ/Chồng" },
  { value: "PARENT", label: "Cha/Mẹ" },
  { value: "CHILD", label: "Con" },
  { value: "SIBLING", label: "Anh/Chị/Em" },
  { value: "FRIEND", label: "Bạn bè" },
  { value: "OTHER", label: "Khác" },
];

export default function PatientEditProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading, error } = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const [healthInfoOpen, setHealthInfoOpen] = useState(true);
  const [emergencyOpen, setEmergencyOpen] = useState(true);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      phoneNumber: "",
      address: "",
      allergies: [],
      relativeFullName: "",
      relativePhoneNumber: "",
      relativeRelationship: "" as RelationshipType | "",
    },
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      phoneNumber: profile.phoneNumber || "",
      address: profile.address || "",
      allergies: profile.allergies
        ? profile.allergies
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      relativeFullName: profile.relativeFullName || "",
      relativePhoneNumber: profile.relativePhoneNumber || "",
      relativeRelationship:
        (profile.relativeRelationship as RelationshipType | "") || "",
    });
  }, [profile, form]);

  const onSubmit = async (values: EditFormValues) => {
    const allergiesString =
      values.allergies && values.allergies.length > 0
        ? values.allergies.join(", ")
        : undefined;
    await updateProfile.mutateAsync({
      phoneNumber: values.phoneNumber,
      address: values.address || undefined,
      allergies: allergiesString,
      relativeFullName: values.relativeFullName || undefined,
      relativePhoneNumber: values.relativePhoneNumber || undefined,
      relativeRelationship: values.relativeRelationship || undefined,
    });
    router.push("/patient/profile");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" variant="muted" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-10 space-y-3 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <p className="text-lg font-semibold text-destructive">
          Không tải được hồ sơ
        </p>
        <Button variant="outline" asChild>
          <Link href="/patient/profile">Quay lại</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/patient/profile">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa hồ sơ</h1>
            <p className="text-muted-foreground">
              Cập nhật thông tin cá nhân của {profile.fullName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/patient/profile">Hủy</Link>
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={updateProfile.isPending}
            className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600"
          >
            {updateProfile.isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Readonly Info Notice */}
      <Alert className="bg-amber-50 border-amber-200">
        <Lock className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          Một số thông tin như họ tên, ngày sinh, giới tính, nhóm máu chỉ có thể được cập nhật bởi nhân viên y tế.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Readonly Personal Information */}
          <div className="form-section-card">
            <div className="form-section-card-title">
              <Lock className="h-5 w-5 text-slate-400" />
              Thông tin cá nhân (Chỉ xem)
            </div>
            <div className="grid gap-4 md:grid-cols-2 pt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Họ và tên</p>
                <p className="font-medium text-foreground">{profile.fullName || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{profile.email || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Ngày sinh</p>
                <p className="font-medium text-foreground">
                  {profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString("vi-VN")
                    : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Giới tính</p>
                <p className="font-medium text-foreground">
                  {profile.gender === "MALE" ? "Nam" : profile.gender === "FEMALE" ? "Nữ" : profile.gender || "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nhóm máu</p>
                <p className="font-medium text-foreground">{profile.bloodType || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">CCCD/CMND</p>
                <p className="font-medium text-foreground">{profile.identificationNumber || "—"}</p>
              </div>
            </div>
          </div>

          {/* Editable Contact Information */}
          <div className="form-section-card">
            <div className="form-section-card-title">
              <User className="h-5 w-5 text-sky-500" />
              Thông tin liên hệ
            </div>
            <div className="space-y-4 pt-4">
              <div className="form-grid">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="form-label form-label-required">Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số điện thoại" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="form-full-width">
                    <FormLabel className="form-label">Địa chỉ</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Nhập địa chỉ" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Health Information - Collapsible */}
          <Collapsible open={healthInfoOpen} onOpenChange={setHealthInfoOpen}>
            <div className="form-section-card">
              <CollapsibleTrigger asChild>
                <div className="form-section-card-title cursor-pointer hover:text-sky-600 transition-colors">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Thông tin sức khỏe
                  <div className="ml-auto">
                    {healthInfoOpen ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Dị ứng</FormLabel>
                        <FormControl>
                          <TagInput
                            value={field.value || []}
                            onChange={field.onChange}
                            placeholder="Thêm dị ứng và nhấn Enter"
                            suggestions={[
                              "Penicillin",
                              "Peanut",
                              "Seafood",
                              "Dust",
                              "NSAIDs",
                            ]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Emergency Contact - Collapsible */}
          <Collapsible open={emergencyOpen} onOpenChange={setEmergencyOpen}>
            <div className="form-section-card">
              <CollapsibleTrigger asChild>
                <div className="form-section-card-title cursor-pointer hover:text-sky-600 transition-colors">
                  <Phone className="h-5 w-5 text-emerald-500" />
                  Liên hệ khẩn cấp
                  <div className="ml-auto">
                    {emergencyOpen ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="relativeFullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label">Tên người liên hệ</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên người liên hệ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="form-grid">
                    <FormField
                      control={form.control}
                      name="relativeRelationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Mối quan hệ</FormLabel>
                          <Select
                            onValueChange={(v) => field.onChange(v === "NONE" ? "" : v)}
                            value={field.value || "NONE"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn mối quan hệ" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="NONE">Chưa chọn</SelectItem>
                              {relationships.map((r) => (
                                <SelectItem key={r.value} value={r.value}>
                                  {r.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="relativePhoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="form-label">Số điện thoại</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập số điện thoại" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Action buttons (mobile) */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 md:hidden">
            <Button type="button" variant="outline" asChild>
              <Link href="/patient/profile">Hủy</Link>
            </Button>
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600"
            >
              {updateProfile.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
