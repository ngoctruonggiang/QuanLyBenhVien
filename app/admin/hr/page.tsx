import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepartmentsPage from "@/app/admin/hr/departments/page";
import EmployeesPage from "@/app/admin/hr/employees/page";
import SchedulesPage from "@/app/admin/hr/schedules/page";
import { Users, Building2, Calendar } from "lucide-react";
import { ListPageHeader } from "@/components/ui/list-page-header";

export default function HrHubPage() {
  return (
    <div className="w-full space-y-6">
      {/* Enhanced Header */}
      <ListPageHeader
        title="HR Management"
        description="Manage departments, employees, and work schedules"
        theme="violet"
        icon={<Users className="h-6 w-6 text-white" />}
      />

      <Tabs defaultValue="departments" className="w-full space-y-6">
        <TabsList className="h-auto flex-wrap gap-2 bg-slate-100 p-1 rounded-lg">
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
