"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTimeSlots } from "@/hooks/queries/useAppointment"; // Import useTimeSlots
import { Loader2 } from "lucide-react"; // Import Loader2 for loading indicator

interface TimeSlot {
  time: string; // "09:00"
  datetime: string; // "2025-12-05T09:00:00"
  available: boolean;
  current?: boolean; // true if editing current appointment
}

interface TimeSlotPickerProps {
  doctorId: string;
  date: string; // YYYY-MM-DD format
  selectedSlot: string | null;
  onSelect: (datetime: string) => void;
  disabled?: boolean;
  excludeAppointmentId?: string;
}

export function TimeSlotPicker({
  doctorId,
  date,
  selectedSlot,
  onSelect,
  disabled,
  excludeAppointmentId,
}: TimeSlotPickerProps) {
  // Fetch slots using the hook
  const { data: slots, isLoading } = useTimeSlots(
    doctorId,
    date,
    excludeAppointmentId
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Loading slots...</span>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="text-muted-foreground text-sm py-4 text-center">
        No available slots for this date.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.datetime}
          type="button"
          disabled={disabled || !slot.available}
          onClick={() => onSelect(slot.datetime)}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md border transition-colors",
            {
              "bg-primary text-primary-foreground border-primary":
                selectedSlot === slot.datetime,
              "bg-white hover:bg-gray-50 border-gray-300":
                slot.available && selectedSlot !== slot.datetime,
              "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed":
                !slot.available,
              "ring-2 ring-offset-2 ring-blue-500": slot.current,
            }
          )}
        >
          {slot.time}
          {slot.current && <span className="block text-xs">(Current)</span>}
        </button>
      ))}
    </div>
  );
}

// Utility to generate time slots - this is not used internally by the component anymore
// but could be useful elsewhere or for mocking
export function generateTimeSlots(
  date: string,
  startTime: string,
  endTime: string,
  bookedSlots: string[],
  currentSlot?: string
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    const time = `${String(currentHour).padStart(2, "0")}:${String(
      currentMin
    ).padStart(2, "0")}`;
    const datetime = `${date}T${time}:00`;

    slots.push({
      time,
      datetime,
      available: !bookedSlots.includes(datetime) || datetime === currentSlot,
      current: datetime === currentSlot,
    });

    // Increment by 30 minutes
    currentMin += 30;
    if (currentMin >= 60) {
      currentMin = 0;
      currentHour += 1;
    }
  }

  return slots;
}
