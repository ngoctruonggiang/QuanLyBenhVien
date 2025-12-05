"use client";

import { useMemo, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockEmployees = [
  {
    id: "e-101",
    fullName: "Dr. Nguyen Van A",
    email: "nguyenvana@hms.com",
    role: "DOCTOR",
    departmentId: "d-101",
    departmentName: "Cardiology",
    specialization: "Cardiologist",
    licenseNumber: "LIC-1234",
    phoneNumber: "0901234567",
    address: "123 Main St",
    status: "ACTIVE",
  },
  {
    id: "e-102",
    fullName: "Tran Thi B",
    email: "tranthib@hms.com",
    role: "NURSE",
    departmentId: "d-102",
    departmentName: "Radiology",
    phoneNumber: "0902345678",
    address: "456 Second St",
    status: "ON_LEAVE",
  },
];

export default function EmployeeEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const record = useMemo(
    () => mockEmployees.find((e) => e.id === params.id),
    [params.id],
  );

  const [form, setForm] = useState(() => ({
    fullName: record?.fullName ?? "",
    email: record?.email ?? "",
    role: record?.role ?? "DOCTOR",
    departmentId: record?.departmentId ?? "",
    specialization: record?.specialization ?? "",
    licenseNumber: record?.licenseNumber ?? "",
    phoneNumber: record?.phoneNumber ?? "",
    address: record?.address ?? "",
    status: record?.status ?? "ACTIVE",
  }));

  if (!record) return notFound();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call updateEmployee API when ready
    alert("Update employee API not connected; using mock.");
    router.push("/admin/hr/employees");
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Employee</h1>
          <p className="text-muted-foreground">Update staff profile.</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Modify fields and save</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm({ ...form, role: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                    <SelectItem value="NURSE">Nurse</SelectItem>
                    <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department ID</label>
                <Input
                  value={form.departmentId}
                  onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  placeholder="Department ID"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialization</label>
                <Input
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">License Number</label>
                <Input
                  value={form.licenseNumber}
                  onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                    <SelectItem value="RESIGNED">Resigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
