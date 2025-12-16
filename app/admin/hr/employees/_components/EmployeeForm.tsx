"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Employee, EmployeeRequest } from "@/interfaces/hr";
import { useDepartments } from "@/hooks/queries/useHr";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { User, Briefcase, Link2 } from "lucide-react";

const formSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["DOCTOR", "NURSE", "RECEPTIONIST", "ADMIN"]),
    departmentId: z.string().optional(),
    specialization: z.string().optional(),
    licenseNumber: z.string().optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(["ACTIVE", "ON_LEAVE", "RESIGNED"]),
    hiredAt: z.string().optional(),
    accountId: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      (values.role === "DOCTOR" || values.role === "NURSE") &&
      !values.departmentId
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["departmentId"],
        message: "Department is required for doctors and nurses",
      });
    }
    if (
      (values.role === "DOCTOR" || values.role === "NURSE") &&
      !values.licenseNumber
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["licenseNumber"],
        message: "License number required for doctors/nurses",
      });
    }
    if (values.phoneNumber) {
      const phoneOk = /^\d{10,15}$/.test(values.phoneNumber);
      if (!phoneOk) {
        ctx.addIssue({
          code: "custom",
          path: ["phoneNumber"],
          message: "Phone must be 10-15 digits",
        });
      }
    }
  });

type EmployeeFormValues = z.infer<typeof formSchema>;

interface EmployeeFormProps {
  initialData?: Employee;
  onSubmit: (data: EmployeeRequest) => void;
  isLoading: boolean;
}

export default function EmployeeForm({
  initialData,
  onSubmit,
  isLoading,
}: EmployeeFormProps) {
  const router = useRouter();
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      role: initialData?.role || "DOCTOR",
      departmentId: initialData?.departmentId || "",
      specialization: initialData?.specialization || "",
      licenseNumber: initialData?.licenseNumber || "",
      phoneNumber: initialData?.phoneNumber || "",
      address: initialData?.address || "",
      status: initialData?.status || "ACTIVE",
      hiredAt: initialData?.hiredAt ? initialData.hiredAt.split("T")[0] : "",
      accountId: initialData?.accountId || "",
    },
  });

  const { data: departmentsData } = useDepartments({ size: 100 });
  const availableAccounts = [
    { id: "acct-2001", email: "unlinked1@hms.com" },
    { id: "acct-2002", email: "unlinked2@hms.com" },
  ];

  const handleSubmit = (values: EmployeeFormValues) => {
    const submitData: EmployeeRequest = {
      ...values,
      departmentId:
        values.departmentId === "none" || !values.departmentId
          ? undefined
          : values.departmentId,
      accountId:
        values.accountId === "none" || !values.accountId
          ? undefined
          : values.accountId,
      hiredAt: values.hiredAt
        ? new Date(values.hiredAt).toISOString()
        : undefined,
    };
    onSubmit(submitData);
  };

  const role = form.watch("role");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div className="form-section-card">
          <div className="form-section-card-title">
            <User className="h-5 w-5 text-sky-500" />
            Basic Information
          </div>
          <div className="form-grid">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label form-label-required">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label form-label-required">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john.doe@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Phone (10-15 digits)</FormLabel>
                  <FormControl>
                    <Input placeholder="0901234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Street, city" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Employment Details Section */}
        <div className="form-section-card">
          <div className="form-section-card-title">
            <Briefcase className="h-5 w-5 text-violet-500" />
            Employment Details
          </div>
          <div className="form-grid">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label form-label-required">Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DOCTOR">Doctor</SelectItem>
                      <SelectItem value="NURSE">Nurse</SelectItem>
                      <SelectItem value="RECEPTIONIST">
                        Receptionist
                      </SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">
                    Department{" "}
                    {role === "DOCTOR" || role === "NURSE" ? "*" : ""}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {departmentsData?.content?.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Specialization</FormLabel>
                  <FormControl>
                    <Input placeholder="Cardiology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(role === "DOCTOR" || role === "NURSE") && (
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="form-label form-label-required">License Number</FormLabel>
                    <FormControl>
                      <Input placeholder="LIC-12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                      <SelectItem value="RESIGNED">Resigned</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hiredAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Hire Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Account Linking Section */}
        <div className="form-section-card">
          <div className="form-section-card-title">
            <Link2 className="h-5 w-5 text-emerald-500" />
            Account Linking (Optional)
          </div>
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem className="max-w-md">
                <FormLabel className="form-label">Account ID</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Unlinked</SelectItem>
                    {availableAccounts.map((acct) => (
                      <SelectItem key={acct.id} value={acct.id}>
                        {acct.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {initialData?.updatedAt && (
          <p className="text-xs text-muted-foreground">
            Last updated at {initialData.updatedAt}
          </p>
        )}

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={() => router.back()} className="px-6">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="px-6 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0"
          >
            {isLoading && <Spinner size="sm" className="mr-2" />}
            {initialData ? "Update Employee" : "Create Employee"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
