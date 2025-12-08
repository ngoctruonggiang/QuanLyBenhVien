"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hrService } from "@/services/hr.service";
import { Department } from "@/interfaces/hr";

interface Props {
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
}

export function DepartmentSelect({
  value,
  onChange,
  placeholder = "Select department",
}: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      const res = await hrService.getDepartments({ status: "ACTIVE" });
      setDepartments(res.content ?? []);
    };
    fetchDepartments();
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">All Departments</SelectItem>
        {departments.map((dept) => (
          <SelectItem key={dept.id} value={dept.id}>
            {dept.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
