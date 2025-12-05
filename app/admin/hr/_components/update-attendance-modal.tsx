"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, Calendar } from "lucide-react";

interface UpdateAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  day: number;
  currentStatus?: "Present" | "Absent" | "Leave" | null;
  onConfirm: (status: "Present" | "Absent" | "Leave" | null) => void;
}

export function UpdateAttendanceModal({
  open,
  onOpenChange,
  employeeName,
  day,
  currentStatus,
  onConfirm,
}: UpdateAttendanceModalProps) {
  const handleStatusSelect = (
    status: "Present" | "Absent" | "Leave" | null
  ) => {
    onConfirm(status);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Attendance</DialogTitle>
          <DialogDescription>
            Mark attendance for <strong>{employeeName}</strong> on day{" "}
            <strong>{day}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <Button
            onClick={() => handleStatusSelect("Present")}
            variant={currentStatus === "Present" ? "default" : "outline"}
            className="justify-start gap-2"
          >
            <Check className="h-4 w-4 text-green-600" />
            <span>Present (Có mặt)</span>
          </Button>

          <Button
            onClick={() => handleStatusSelect("Absent")}
            variant={currentStatus === "Absent" ? "default" : "outline"}
            className="justify-start gap-2"
          >
            <X className="h-4 w-4 text-red-600" />
            <span>Absent (Vắng mặt)</span>
          </Button>

          <Button
            onClick={() => handleStatusSelect("Leave")}
            variant={currentStatus === "Leave" ? "default" : "outline"}
            className="justify-start gap-2"
          >
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>Leave (Nghỉ phép)</span>
          </Button>

          {currentStatus && (
            <Button
              onClick={() => handleStatusSelect(null)}
              variant="ghost"
              className="justify-start gap-2 text-gray-500"
            >
              <X className="h-4 w-4" />
              <span>Clear / Remove (Xóa)</span>
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
