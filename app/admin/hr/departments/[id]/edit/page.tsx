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

const mockDepartments = [
  {
    id: "d-101",
    name: "Cardiology",
    description: "Heart and cardiovascular care.",
    headDoctorId: "doc-1",
    headDoctorName: "Dr. Nguyen Van A",
    location: "Building A, Floor 3",
    phoneExtension: "1234",
    status: "ACTIVE",
  },
  {
    id: "d-102",
    name: "Radiology",
    description: "Imaging and diagnostics.",
    headDoctorId: "doc-2",
    headDoctorName: "Dr. Tran B",
    location: "Building B, Floor 2",
    phoneExtension: "2345",
    status: "ACTIVE",
  },
];

export default function DepartmentEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const record = useMemo(
    () => mockDepartments.find((d) => d.id === params.id),
    [params.id],
  );

  const [form, setForm] = useState(() => ({
    name: record?.name ?? "",
    description: record?.description ?? "",
    location: record?.location ?? "",
    phoneExtension: record?.phoneExtension ?? "",
    headDoctorId: record?.headDoctorId ?? "",
    status: record?.status ?? "ACTIVE",
  }));

  if (!record) return notFound();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call updateDepartment API when ready
    alert("Update department API not connected; using mock.");
    router.push("/admin/hr/departments");
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Department</h1>
          <p className="text-muted-foreground">Update department information.</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Modify fields and save</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Extension</label>
                <Input
                  value={form.phoneExtension}
                  onChange={(e) => setForm({ ...form, phoneExtension: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Head Doctor ID</label>
                <Input
                  value={form.headDoctorId}
                  onChange={(e) => setForm({ ...form, headDoctorId: e.target.value })}
                  placeholder="Doctor ID"
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
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
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
