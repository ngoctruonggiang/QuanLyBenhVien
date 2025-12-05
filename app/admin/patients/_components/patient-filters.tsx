"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { Gender, BloodType } from "@/interfaces/patient";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

export interface PatientFilters {
  search: string;
  gender?: Gender;
  bloodType?: BloodType;
}

interface PatientFiltersProps {
  filters: PatientFilters;
  onFiltersChange: (filters: PatientFilters) => void;
}

const genderOptions: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const bloodTypeOptions: BloodType[] = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

export function PatientFiltersBar({
  filters,
  onFiltersChange,
}: PatientFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, onFiltersChange]);

  const handleGenderChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        gender: value === "all" ? undefined : (value as Gender),
      });
    },
    [filters, onFiltersChange]
  );

  const handleBloodTypeChange = useCallback(
    (value: string) => {
      onFiltersChange({
        ...filters,
        bloodType: value === "all" ? undefined : (value as BloodType),
      });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    onFiltersChange({ search: "", gender: undefined, bloodType: undefined });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.search || filters.gender || filters.bloodType;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 h-10"
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
            onClick={() => setSearchInput("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter selects */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select
          value={filters.gender || "all"}
          onValueChange={handleGenderChange}
        >
          <SelectTrigger className="h-10 w-[130px]">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            {genderOptions.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.bloodType || "all"}
          onValueChange={handleBloodTypeChange}
        >
          <SelectTrigger className="h-10 w-[130px]">
            <SelectValue placeholder="Blood Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {bloodTypeOptions.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-10 px-3 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
