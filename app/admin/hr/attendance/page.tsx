"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDepartments,
  getPositions,
  getEmployeeAttendance,
  updateAttendance,
  type AttendanceStatus,
} from "@/services/employee.service";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UpdateAttendanceModal } from "../_components/update-attendance-modal";
import * as XLSX from "xlsx";

export default function AttendancePage() {
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: number;
    name: string;
    dateStr: string;
    status?: AttendanceStatus | null;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const queryClient = useQueryClient();

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const departments = getDepartments();
  const positions = getPositions();

  const { data: attendance = [] } = useQuery({
    queryKey: ["attendance"],
    queryFn: getEmployeeAttendance,
  });

  const filteredAttendance = attendance.filter((emp: any) => {
    if (department && department !== " " && emp.department !== department) {
      return false;
    }
    if (position && position !== " " && emp.position !== position) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredAttendance.length / pageSize);
  const paginatedAttendance = filteredAttendance.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setCurrentPage(1);
  };

  const handlePositionChange = (value: string) => {
    setPosition(value);
    setCurrentPage(1);
  };

  const daysInCurrentMonth = new Date(year, month, 0).getDate();
  const daysInMonth = Array.from({ length: daysInCurrentMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(year, month - 1, day);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return {
      date: day,
      dayName: dayNames[date.getDay()],
    };
  });

  const handleExport = () => {
    if (!filteredAttendance || filteredAttendance.length === 0) {
      alert("No attendance data to export!");
      return;
    }

    const exportData = filteredAttendance.map((emp: any) => {
      const row: any = {
        "Employee Name": emp.name,
        Department: emp.department,
        Position: emp.position,
        "Total Days Present": emp.sum,
      };

      for (let i = 1; i <= daysInMonth.length; i++) {
        const dateStr = `${i}/${month}/${year}`;
        const status = emp.attendance?.[dateStr];
        row[`Day ${i}`] = status || "-";
      }

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Attendance-${month}-${year}`);

    const fileName = `Attendance_${month}_${year}.xlsx`;
    XLSX.writeFile(wb, fileName, { bookType: "xlsx" });
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleAttendanceClick = (
    employeeId: number,
    employeeName: string,
    dateStr: string,
    currentStatus?: AttendanceStatus | null
  ) => {
    setSelectedEmployee({
      id: employeeId,
      name: employeeName,
      dateStr,
      status: currentStatus,
    });
  };

  const handleAttendanceUpdate = async (status: AttendanceStatus | null) => {
    if (!selectedEmployee) return;

    await updateAttendance(
      selectedEmployee.id,
      selectedEmployee.dateStr,
      status
    );
    queryClient.invalidateQueries({ queryKey: ["attendance"] });
    setSelectedEmployee(null);
  };

  const getAttendanceColor = (status?: AttendanceStatus | null) => {
    if (!status) return "";
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700";
      case "Absent":
        return "bg-red-100 text-red-700";
      case "Leave":
        return "bg-blue-100 text-blue-700";
      default:
        return "";
    }
  };

  const getAttendanceIcon = (status?: AttendanceStatus | null) => {
    if (!status) return null;
    switch (status) {
      case "Present":
        return "✓";
      case "Absent":
        return "✗";
      case "Leave":
        return "📅";
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Attendance Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Track and manage employee attendance
          </p>
        </div>
        <Button onClick={handleExport}>Export</Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            className="cursor-pointer h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm font-medium">
            {month}/{year}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="cursor-pointer h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Select value={department} onValueChange={handleDepartmentChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={position} onValueChange={handlePositionChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Positions</SelectItem>
            {positions.map((pos) => (
              <SelectItem key={pos} value={pos}>
                {pos}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            setPageSize(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 / page</SelectItem>
            <SelectItem value="8">8 / page</SelectItem>
            <SelectItem value="10">10 / page</SelectItem>
            <SelectItem value="20">20 / page</SelectItem>
            <SelectItem value="50">50 / page</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="border p-2 text-left font-medium sticky left-0 bg-gray-50 z-10">
                  Name
                </th>
                {daysInMonth.map((day) => (
                  <th
                    key={day.date}
                    className="border p-2 text-center font-medium min-w-[50px]"
                  >
                    <div>{day.date}</div>
                    <div className="text-xs text-gray-500">{day.dayName}</div>
                  </th>
                ))}
                <th className="border p-2 text-center font-medium sticky right-0 bg-gray-50 z-10">
                  Sum
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedAttendance.length > 0 ? (
                paginatedAttendance.map((employee: any, idx: number) => (
                  <tr key={idx}>
                    <td className="border p-2 font-medium sticky left-0 bg-white z-10">
                      {employee.name}
                    </td>
                    {daysInMonth.map((day) => {
                      const dateStr = `${day.date}/${month}/${year}`;
                      const dayStatus = employee.attendance?.[dateStr];
                      return (
                        <td key={day.date} className="border p-2 text-center">
                          <div
                            className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-xs cursor-pointer transition-all hover:scale-110 ${
                              dayStatus
                                ? getAttendanceColor(dayStatus)
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() =>
                              handleAttendanceClick(
                                employee.id,
                                employee.name,
                                dateStr,
                                dayStatus
                              )
                            }
                          >
                            {getAttendanceIcon(dayStatus) || "+"}
                          </div>
                        </td>
                      );
                    })}
                    <td className="border p-2 text-center font-semibold sticky right-0 bg-white z-10">
                      <div>{employee.sum}</div>
                      <div className="text-xs text-gray-500">Days</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={daysInMonth.length + 2}
                    className="border p-4 text-center text-gray-400"
                  >
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAttendance.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredAttendance.length)} of{" "}
            {filteredAttendance.length} employees
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      <UpdateAttendanceModal
        open={!!selectedEmployee}
        onOpenChange={(open: boolean) => !open && setSelectedEmployee(null)}
        employeeName={selectedEmployee?.name || ""}
        day={
          selectedEmployee
            ? parseInt(selectedEmployee.dateStr.split("/")[0])
            : 0
        }
        currentStatus={selectedEmployee?.status}
        onConfirm={handleAttendanceUpdate}
      />
    </div>
  );
}
