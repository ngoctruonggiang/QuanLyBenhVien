"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Account } from "@/services/auth.service";

const roles = [
  { value: "ADMIN", label: "Admin" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "NURSE", label: "Nurse" },
  { value: "RECEPTIONIST", label: "Receptionist" },
  { value: "PATIENT", label: "Patient" },
] as const;

const accountFormSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "PATIENT", "DOCTOR", "NURSE", "RECEPTIONIST"]),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;

interface AccountFormProps {
  initialData?: Account | null;
  onSubmit: (data: AccountFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AccountForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: AccountFormProps) {
  const isEditing = !!initialData;

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: initialData?.email ?? "",
      password: "",
      role: (initialData?.role as AccountFormValues["role"]) ?? "PATIENT",
    },
  });

  const handleSubmit = (data: AccountFormValues) => {
    // If editing and password is empty, don't send it
    if (isEditing && !data.password) {
      const { password, ...rest } = data;
      onSubmit(rest as AccountFormValues);
    } else {
      onSubmit(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="form-label form-label-required">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isEditing ? "form-label" : "form-label form-label-required"}>
                Password
                {isEditing && (
                  <span className="ml-2 text-xs text-muted-foreground">(leave blank to keep current)</span>
                )}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={isEditing ? "Enter new password (optional)" : "Enter password"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="form-label form-label-required">Role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
          >
            {isLoading && <Spinner size="sm" className="mr-2" />}
            {isEditing ? "Update Account" : "Create Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
