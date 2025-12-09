import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepartmentsPage from "@/app/admin/hr/departments/page";
import EmployeesPage from "@/app/admin/hr/employees/page";
import SchedulesPage from "@/app/admin/hr/schedules/page";

export default function HrHubPage() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">HR Management</h1>
        <p className="text-muted-foreground">
          Manage departments, employees, and work schedules.
        </p>
      </div>

      <Tabs defaultValue="departments" className="w-full space-y-6">
        <TabsList className="h-auto flex-wrap gap-2">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="schedules">Doctor Schedules</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
