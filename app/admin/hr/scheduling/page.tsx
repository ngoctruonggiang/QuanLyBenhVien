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
  getAllEmployees,
  getEmployeeSchedule,
  addEmployeeToShift,
  removeEmployeeFromShift,
} from "@/services/employee.service";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  X,
  Users,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";

const SHIFTS = [
  { name: "Morning", time: "6:00-12:00" },
  { name: "Afternoon", time: "12:00-18:00" },
  { name: "Evening", time: "18:00-22:00" },
  { name: "Night", time: "22:00-6:00" },
];

export default function ShiftSchedulingPage() {
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedEmployee, setDraggedEmployee] = useState<any>(null);

  const queryClient = useQueryClient();

  const getWeekDates = (date: Date) => {
    const curr = new Date(date);
    const firstDay = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1)); // Monday

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(firstDay);
      day.setDate(firstDay.getDate() + i);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      weekDays.push({
        day: dayNames[day.getDay()],
        date: `${day.getDate()}/${day.getMonth() + 1}`,
        fullDate: day,
        fullDateStr: `${day.getDate()}/${day.getMonth() + 1}/${day.getFullYear()}`,
      });
    }
    return weekDays;
  };

  const weekDays = getWeekDates(currentDate);
  const startDate = weekDays[0].date;
  const endDate = weekDays[6].date;

  const departments = getDepartments();
  const positions = getPositions();

  const { data: employees = [] } = useQuery({
    queryKey: ["allEmployees"],
    queryFn: getAllEmployees,
  });

  const { data: schedule = [] } = useQuery({
    queryKey: ["schedule"],
    queryFn: getEmployeeSchedule,
  });

  // Filter employees based on department and position
  const filteredEmployees = employees.filter((emp: any) => {
    if (department && department !== " " && emp.department !== department) {
      return false;
    }
    if (position && position !== " " && emp.position !== position) {
      return false;
    }
    return true;
  });

  const handleExport = () => {
    if (!schedule || schedule.length === 0) {
      alert("No schedule data to export!");
      return;
    }

    // Prepare data for Excel
    const exportData: any[] = [];

    SHIFTS.forEach((shift) => {
      const row: any = {
        Shift: `${shift.name} (${shift.time})`,
      };

      weekDays.forEach((day) => {
        const shiftSchedule = schedule.find(
          (s: any) => s.day === day.fullDateStr && s.shift === shift.name
        );
        row[`${day.day} ${day.date}`] = shiftSchedule
          ? shiftSchedule.employees.map((e: any) => e.fullName).join(", ")
          : "-";
      });

      exportData.push(row);
    });

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedule");

    // Generate file and download
    const fileName = `Schedule_Week_${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}.xlsx`;
    XLSX.writeFile(wb, fileName, { bookType: "xlsx" });
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleDragStart = (e: React.DragEvent, employee: any) => {
    setDraggedEmployee(employee);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOnShift = async (
    e: React.DragEvent,
    day: string,
    shiftName: string
  ) => {
    e.preventDefault();
    if (!draggedEmployee) return;

    await addEmployeeToShift({ day, shift: shiftName, employeeId: Number(draggedEmployee.id) });
    queryClient.invalidateQueries({ queryKey: ["schedule"] });
    setDraggedEmployee(null);
  };

  const handleRemoveFromShift = async (
    day: string,
    shiftName: string,
    employeeId: number
  ) => {
    await removeEmployeeFromShift({ day, shift: shiftName, employeeId: Number(employeeId) });
    queryClient.invalidateQueries({ queryKey: ["schedule"] });
  };

  const handleDragEnd = () => {
    setDraggedEmployee(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Shift Scheduling</h2>
          <p className="text-sm text-muted-foreground">
            Drag and drop employees to assign shifts
          </p>
        </div>
        <Button onClick={handleExport}>Export</Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={position} onValueChange={setPosition}>
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

        <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousWeek}
            className="cursor-pointer h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm font-medium">
            {startDate} - {endDate}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextWeek}
            className="cursor-pointer h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-2 text-left font-medium">Shift</th>
                  {weekDays.map((day, idx) => (
                    <th key={idx} className="border p-2 text-center font-medium">
                      <div>{day.day}</div>
                      <div className="text-xs text-gray-500">{day.date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SHIFTS.map((shift, shiftIdx) => (
                  <tr key={shiftIdx}>
                    <td className="border p-2 bg-gray-50">
                      <div className="font-medium">{shift.name}</div>
                      <div className="text-xs text-gray-500">{shift.time}</div>
                    </td>
                    {weekDays.map((day, dayIdx) => {
                      const shiftSchedule = schedule.find(
                        (s: any) =>
                          s.day === day.fullDateStr && s.shift === shift.name
                      );
                      return (
                        <td
                          key={dayIdx}
                          className="border p-2 text-center min-h-[80px] align-top"
                          onDragOver={handleDragOver}
                          onDrop={(e) =>
                            handleDropOnShift(e, day.fullDateStr, shift.name)
                          }
                        >
                          {shiftSchedule ? (
                            <div className="space-y-1">
                              {shiftSchedule.employees.map(
                                (emp: any, empIdx: number) => (
                                  <div
                                    key={empIdx}
                                    className="group relative text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded flex items-center justify-between hover:bg-blue-200 transition-colors"
                                  >
                                    <span className="flex-1">
                                      {emp.fullName.split(" ").slice(-2).join(" ")}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleRemoveFromShift(
                                          day.fullDateStr,
                                          shift.name,
                                          emp.id
                                        )
                                      }
                                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                    >
                                      <X className="h-3 w-3 text-red-600" />
                                    </button>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="h-full min-h-[60px] flex items-center justify-center text-gray-300">
                              Drop here
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-64 border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-semibold">Employee List</h3>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp: any, idx: number) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={(e) => handleDragStart(e, emp)}
                  onDragEnd={handleDragEnd}
                  className={`p-2 border rounded-lg hover:bg-gray-50 cursor-grab active:cursor-grabbing transition-all ${
                    draggedEmployee?.id === emp.id ? "opacity-50 scale-95" : ""
                  }`}
                >
                  <div className="font-medium text-sm">{emp.fullName}</div>
                  <div className="text-xs text-gray-500">{emp.department}</div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4 text-sm">
                No employees found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
