"use client";

import { Badge } from "@/components/ui/badge";
import { ExamStatus } from "@/interfaces/medical-exam";

const statusTone: Record<ExamStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-sky-100 text-sky-700",
  FINALIZED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
};

export function ExamStatusBadge({ status }: { status?: ExamStatus }) {
  if (!status) {
    return (
      <Badge
        variant="secondary"
        className="rounded-full px-3 py-1 text-xs font-medium"
      >
        N/A
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        statusTone[status] || ""
      }`}
    >
      {status}
    </Badge>
  );
}
