"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { hrService } from "@/services/hr.service";
import { Employee } from "@/interfaces/hr";

interface Props {
  value?: string;
  onChange: (id: string) => void;
  placeholder?: string;
  departmentId?: string;
  status?: string;
}

export function DoctorSearchSelect({
  value,
  onChange,
  placeholder = "Select doctor",
  departmentId,
  status = "ACTIVE",
}: Props) {
  const [open, setOpen] = useState(false);
  const [doctors, setDoctors] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await hrService.getEmployees({
        role: "DOCTOR",
        departmentId,
        search,
        status,
        size: 50,
      });
      setDoctors(res.content ?? []);
    };
    fetchDoctors();
  }, [departmentId, search, status]);

  const selected = doctors.find((d) => d.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
          aria-expanded={open}
        >
          {selected ? selected.fullName : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search doctor..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Không tìm thấy</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="none"
                value="none"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value ? "opacity-0" : "opacity-100",
                  )}
                />
                <div className="text-sm text-muted-foreground">None</div>
              </CommandItem>
              {doctors.map((doc) => (
                <CommandItem
                  key={doc.id}
                  value={doc.id}
                  onSelect={() => {
                    onChange(doc.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === doc.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.departmentName || ""}{" "}
                        {doc.specialization ? `• ${doc.specialization}` : ""}
                      </p>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
