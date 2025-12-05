"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepartmentsPage from "@/app/admin/hr/departments/page";
import EmployeesPage from "@/app/admin/hr/employees/page";
import SchedulesPage from "@/app/admin/hr/schedules/page";
import AttendancePage from "@/app/admin/hr/attendance/page";
import ShiftSchedulingPage from "@/app/admin/hr/scheduling/page";

export default function HrHubPage() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">HR Management</h1>
        <p className="text-muted-foreground">
          Departments, employees, schedules, and attendance tracking.
        </p>
      </div>

      <Tabs defaultValue="departments" className="w-full space-y-6">
        <TabsList className="h-auto flex-wrap gap-2">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="schedules">Doctor Schedules</TabsTrigger>
          <TabsTrigger value="shift-scheduling">Shift Scheduling</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-6">
          <DepartmentsPage />
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <EmployeesPage />
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <SchedulesPage />
        </TabsContent>

        <TabsContent value="shift-scheduling" className="space-y-6">
          <ShiftSchedulingPage />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <AttendancePage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
