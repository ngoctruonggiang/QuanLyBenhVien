"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  usePatientAppointments,
  useCancelAppointment,
} from "@/hooks/queries/useAppointment";
import { AppointmentStatusBadge } from "@/app/admin/appointments/_components/appointment-status-badge";
import { CancelAppointmentModal } from "@/components/appointment/CancelAppointmentModal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Appointment } from "@/interfaces/appointment";
import { format } from "date-fns";

type FilterStatus = "UPCOMING" | "PAST" | "CANCELLED";

export default function PatientAppointmentListPage() {
  const [patientId] = useState<string | null>(() => {
    const pid =
      typeof window !== "undefined" ? localStorage.getItem("patientId") : null;
    return pid || "p001";
  });
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("UPCOMING");

  const { data: appointments = [], isLoading } = usePatientAppointments(
    patientId || "",
  );
  const cancelMutation = useCancelAppointment();

  const handleCancelConfirm = async (reason: string) => {
    if (!cancellingId) return;

    await cancelMutation.mutateAsync({
      id: cancellingId,
      data: { cancelReason: reason },
    });
    setCancellingId(null);
  };

  const filteredAndSortedAppointments = useMemo(() => {
    const now = new Date();

    const filtered = appointments.filter((apt: Appointment) => {
      const appointmentTime = new Date(apt.appointmentTime);
      switch (filter) {
        case "UPCOMING":
          return apt.status === "SCHEDULED" && appointmentTime >= now;
        case "PAST":
          return (
            apt.status === "COMPLETED" ||
            apt.status === "NO_SHOW" ||
            (apt.status === "SCHEDULED" && appointmentTime < now)
          );
        case "CANCELLED":
          return apt.status === "CANCELLED";
        default:
          return true;
      }
    });

    return filtered.sort((a: Appointment, b: Appointment) => {
      const aDate = new Date(a.appointmentTime);
      const bDate = new Date(b.appointmentTime);
      const aIsUpcoming = a.status === "SCHEDULED" && aDate >= now;
      const bIsUpcoming = b.status === "SCHEDULED" && bDate >= now;

      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      if (aIsUpcoming && bIsUpcoming) {
        return aDate.getTime() - bDate.getTime();
      }

      return bDate.getTime() - aDate.getTime();
    });
  }, [appointments, filter]);

  return (
    <>
      <CancelAppointmentModal
        isOpen={!!cancellingId}
        onClose={() => setCancellingId(null)}
        onConfirm={handleCancelConfirm}
        isLoading={cancelMutation.isPending}
      />
      <div className="page-shell space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Lịch hẹn của tôi</h1>
            <p className="text-muted-foreground">Xem và quản lý lịch hẹn</p>
          </div>
          <Button asChild>
            <Link href="/patient/appointments/new">Đặt lịch mới</Link>
          </Button>
        </div>

        <div className="flex justify-start">
          <ToggleGroup
            type="single"
            value={filter}
            onValueChange={(value: FilterStatus) => {
              if (value) setFilter(value);
            }}
            defaultValue="UPCOMING"
          >
            <ToggleGroupItem value="UPCOMING">Sắp tới</ToggleGroupItem>
            <ToggleGroupItem value="PAST">Đã qua</ToggleGroupItem>
            <ToggleGroupItem value="CANCELLED">Đã hủy</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Đang tải...</p>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Bạn chưa có lịch hẹn nào.
            </CardContent>
          </Card>
        ) : filteredAndSortedAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Không có lịch hẹn nào trong mục này.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedAppointments.map((apt: Appointment) => {
              const isCancelable =
                apt.status === "SCHEDULED" &&
                new Date(apt.appointmentTime) > new Date();
              return (
                <Card key={apt.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {apt.doctor?.fullName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(apt.appointmentTime),
                          "h:mm a, dd/MM/yyyy",
                        )}
                      </p>
                    </div>
                    <AppointmentStatusBadge status={apt.status} />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p
                      className="text-sm text-muted-foreground truncate"
                      title={apt.reason}
                    >
                      Lý do: {apt.reason || "Không có"}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/patient/appointments/${apt.id}`}>
                          Chi tiết
                        </Link>
                      </Button>
                      {isCancelable && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setCancellingId(apt.id)}
                          disabled={cancelMutation.isPending}
                        >
                          Hủy lịch
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
