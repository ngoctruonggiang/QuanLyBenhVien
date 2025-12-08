"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  MedicalExamFormValues,
  medicalExamSchema,
} from "@/lib/schemas/medical-exam";
import { UserRole } from "@/hooks/use-auth"; // Assuming UserRole is defined here or similar
import { ExamStatus } from "@/interfaces/medical-exam";

interface MedicalExamFormProps {
  defaultValues?: Partial<MedicalExamFormValues>;
  onSubmit: (data: MedicalExamFormValues) => void;
  isSubmitting?: boolean;
  onSubmitWithStatus?: (data: MedicalExamFormValues, status: "PENDING" | "FINALIZED") => void;
  userRole?: UserRole; // Added userRole prop
  currentExamStatus?: ExamStatus; // Added currentExamStatus prop
}

export function MedicalExamForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  onSubmitWithStatus,
  userRole,
  currentExamStatus,
}: MedicalExamFormProps) {
  const form = useForm<MedicalExamFormValues>({
    resolver: zodResolver(medicalExamSchema) as any,
    defaultValues: defaultValues || {
      appointmentId: "",
      temperature: 37,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 75,
      weight: 70,
      height: 170,
      diagnosis: "",
      symptoms: "",
      treatment: "",
      notes: "",
    },
  });

  const canFinalize =
    (userRole === "ADMIN" || userRole === "DOCTOR") &&
    currentExamStatus !== "FINALIZED"; // Allow finalize if not already finalized

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="appointmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appointment ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Appointment ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Vitals</h3>
          <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-6">
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temp (°C)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bloodPressureSystolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BP Sys</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bloodPressureDiastolic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BP Dia</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="heartRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HR (bpm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (cm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Diagnosis & Treatment</h3>
          <FormField
            control={form.control}
            name="symptoms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symptoms</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the patient's symptoms..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="diagnosis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diagnosis</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the diagnosis..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="treatment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treatment Plan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Outline the treatment plan..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any additional notes..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {onSubmitWithStatus ? (
          <div className="flex flex-wrap gap-3">
            {(userRole === "ADMIN" || userRole === "DOCTOR" || userRole === "NURSE") && (
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() =>
                  form.handleSubmit((values) => onSubmitWithStatus(values, "PENDING"))()
                }
              >
                {isSubmitting ? "Saving..." : "Save Draft"}
              </Button>
            )}
            {(userRole === "ADMIN" || userRole === "DOCTOR") && (
              <Button
                type="button"
                disabled={isSubmitting || !canFinalize}
                onClick={() =>
                  form.handleSubmit((values) => onSubmitWithStatus(values, "FINALIZED"))()
                }
              >
                {isSubmitting ? "Finalizing..." : "Save & Finalize"}
              </Button>
            )}
          </div>
        ) : (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Medical Exam"}
          </Button>
        )}
      </form>
    </Form>
  );
}
