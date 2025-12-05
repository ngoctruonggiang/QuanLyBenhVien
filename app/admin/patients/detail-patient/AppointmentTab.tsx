import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AppointmentStatus = "upcoming" | "completed";

type Appointment = {
  id: string;
  dateTime: string;
  doctor: string;
  clinicRoom: string;
  status: AppointmentStatus;
};

const appointments: Appointment[] = [
  {
    id: "1",
    dateTime: "19/11/2025 - 09:30",
    doctor: "Dr. Tran B",
    clinicRoom: "Internal Medicine",
    status: "upcoming",
  },
  {
    id: "2",
    dateTime: "10/11/2025 - 09:30",
    doctor: "Dr. Emily Carter",
    clinicRoom: "Cardiology",
    status: "completed",
  },
];

const statusMap: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  upcoming: {
    label: "Upcoming",
    className: "bg-[#E7F6EC] text-[#1F9254] border-none",
  },
  completed: {
    label: "Completed",
    className: "bg-[#F1F5F9] text-[#475569] border-none",
  },
};

const AppointmentTab = () => {
  return (
    <div className="mx-auto">
      <div className="bg-white rounded-[12px] border border-[#E2E8F0]">
        <div className="p-6 border-b border-[#E2E8F0]">
          <p className="font-semibold text-[20px]">Appointments</p>
        </div>
        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8FAFC]">
                <TableHead className="text-[#94A3B8] text-[12px] uppercase font-semibold">
                  Date &amp; Time
                </TableHead>
                <TableHead className="text-[#94A3B8] text-[12px] uppercase font-semibold">
                  Doctor
                </TableHead>
                <TableHead className="text-[#94A3B8] text-[12px] uppercase font-semibold">
                  Clinic Room
                </TableHead>
                <TableHead className="text-[#94A3B8] text-[12px] uppercase font-semibold">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => {
                const status = statusMap[appointment.status];
                return (
                  <TableRow key={appointment.id} className="hover:bg-transparent">
                    <TableCell className="text-[14px] text-[#111928] font-medium py-4">
                      {appointment.dateTime}
                    </TableCell>
                    <TableCell className="text-[14px] text-[#111928] py-4">
                      {appointment.doctor}
                    </TableCell>
                    <TableCell className="text-[14px] text-[#111928] py-4">
                      {appointment.clinicRoom}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={status.className}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTab;
