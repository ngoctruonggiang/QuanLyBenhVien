"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  CalendarDays,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { AppointmentType } from "@/interfaces/appointment";
import {
  useAppointment,
  useUpdateAppointment,
  useTimeSlots,
} from "@/hooks/queries/useAppointment";

// Form schema - only editable fields
const editFormSchema = z.object({
  appointmentDate: z.date({ message: "Please select a date" }),
  appointmentTime: z.string().min(1, "Please select a time slot"),
  type: z.enum(["CONSULTATION", "FOLLOW_UP", "EMERGENCY"], {
    message: "Please select appointment type",
  }),
  reason: z
    .string()
    .min(1, "Please enter reason for visit")
    .max(500, "Reason cannot exceed 500 characters"),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

type FormValues = z.infer<typeof editFormSchema>;

export default function EditAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: appointment, isLoading, error } = useAppointment(id);
  const updateMutation = useUpdateAppointment();

  const form = useForm<FormValues>({
    resolver: zodResolver(editFormSchema) as any,
    defaultValues: {
      appointmentTime: "",
      type: "CONSULTATION",
      reason: "",
      notes: "",
    },
  });

  // Initialize form when appointment loads
  useEffect(() => {
    if (appointment) {
      const dateTime = new Date(appointment.appointmentTime);
      form.reset({
        appointmentDate: dateTime,
        appointmentTime: format(dateTime, "HH:mm"),
        type: appointment.type,
        reason: appointment.reason,
        notes: appointment.notes || "",
      });
    }
  }, [appointment, form]);

  const watchedDate = form.watch("appointmentDate");

  // Fetch time slots
  const { data: timeSlots, isLoading: loadingSlots } = useTimeSlots(
    appointment?.doctor.id || "",
    watchedDate ? format(watchedDate, "yyyy-MM-dd") : "",
    id // exclude current appointment
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold">Appointment Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            The appointment you're looking for doesn't exist or has been
            removed.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/admin/appointments">Back to Appointments</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Cannot edit non-scheduled appointments
  if (appointment.status !== "SCHEDULED") {
    return (
      <div className="mx-auto max-w-3xl">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-semibold">
            Cannot Edit Appointment
          </h2>
          <p className="mt-2 text-muted-foreground">
            Only scheduled appointments can be edited. This appointment is{" "}
            <span className="font-medium">
              {appointment.status.toLowerCase()}
            </span>
            .
          </p>
          <Button className="mt-4" asChild>
            <Link href={`/admin/appointments/${id}`}>View Appointment</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: FormValues) => {
    const appointmentTime =
      format(data.appointmentDate, "yyyy-MM-dd") +
      "T" +
      data.appointmentTime +
      ":00";

    updateMutation.mutate(
      {
        id,
        data: {
          appointmentTime,
          type: data.type,
          reason: data.reason,
          notes: data.notes,
        },
      },
      {
        onSuccess: () => {
          router.push(`/admin/appointments/${id}`);
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/appointments/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Reschedule Appointment
          </h1>
          <p className="text-muted-foreground">Update appointment details</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Read-only Patient & Doctor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Appointment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Patient</Label>
                  <p className="font-medium">{appointment.patient.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.patient.phoneNumber}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Doctor</Label>
                  <p className="font-medium">{appointment.doctor.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {appointment.doctor.department}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                * Patient and doctor cannot be changed. If needed, cancel this
                appointment and create a new one.
              </p>
            </CardContent>
          </Card>

          {/* Schedule Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date picker */}
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {field.value
                              ? format(field.value, "MMMM d, yyyy")
                              : "Select a date"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time slots */}
              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Slot *</FormLabel>
                    {loadingSlots ? (
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <Skeleton key={i} className="h-10" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                        {timeSlots?.map((slot) => (
                          <Button
                            key={slot.time}
                            type="button"
                            variant={
                              field.value === slot.time
                                ? "default"
                                : slot.current
                                ? "secondary"
                                : "outline"
                            }
                            className={cn(
                              "h-10",
                              !slot.available &&
                                !slot.current &&
                                "opacity-50 cursor-not-allowed",
                              slot.current && "border-primary"
                            )}
                            disabled={!slot.available && !slot.current}
                            onClick={() => field.onChange(slot.time)}
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            {slot.time}
                            {slot.current && " ★"}
                          </Button>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      ★ Current time slot
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-wrap gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value="CONSULTATION"
                            id="consultation"
                          />
                          <Label
                            htmlFor="consultation"
                            className="cursor-pointer"
                          >
                            Consultation
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="FOLLOW_UP" id="follow_up" />
                          <Label htmlFor="follow_up" className="cursor-pointer">
                            Follow-up
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="EMERGENCY" id="emergency" />
                          <Label htmlFor="emergency" className="cursor-pointer">
                            Emergency
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Visit *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe symptoms or reason for this appointment..."
                        className="min-h-[100px] resize-none"
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <FormMessage />
                      <span>{field.value?.length || 0}/500</span>
                    </div>
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Staff Only)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes..."
                        className="min-h-[80px] resize-none"
                        maxLength={1000}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <FormMessage />
                      <span>{field.value?.length || 0}/1000</span>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/appointments/${id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
