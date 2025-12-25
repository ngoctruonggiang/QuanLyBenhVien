"use client";

import { format, subDays, startOfMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[180px] justify-start text-left font-normal",
              !startDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate ? format(startDate, "dd/MM/yyyy") : "Start date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            disabled={(date) => (endDate ? date > endDate : false)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <span className="text-muted-foreground">to</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[180px] justify-start text-left font-normal",
              !endDate && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {endDate ? format(endDate, "dd/MM/yyyy") : "End date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={onEndDateChange}
            disabled={(date) => (startDate ? date < startDate : false)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Quick date range presets
export function useDateRangePresets() {
  const today = new Date();

  return {
    thisMonth: {
      label: "This Month",
      startDate: startOfMonth(today),
      endDate: today,
    },
    last7Days: {
      label: "Last 7 Days",
      startDate: subDays(today, 7),
      endDate: today,
    },
    last30Days: {
      label: "Last 30 Days",
      startDate: subDays(today, 30),
      endDate: today,
    },
    last90Days: {
      label: "Last 90 Days",
      startDate: subDays(today, 90),
      endDate: today,
    },
  };
}
