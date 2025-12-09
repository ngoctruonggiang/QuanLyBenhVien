"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  CalendarDays,
  User,
  Briefcase,
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
import { cn } from "@/lib/utils";

import {
  useAppointment,
  useUpdateAppointment,
} from "@/hooks/queries/useAppointment";
import { TimeSlotPicker } from "@/components/appointment/TimeSlotPicker";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AppointmentUpdateRequest } from "@/interfaces/appointment";

const appointmentFormSchema = z.object({
  appointmentDate: z.date({ message: "Please select a date" }),
  appointmentTime: z.string().min(1, "Please select a time slot"),
  type: z.enum(["CONSULTATION", "FOLLOW_UP", "EMERGENCY"]),
  reason: z.string().min(1, "Reason is required").max(500),
  notes: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof appointmentFormSchema>;

const InfoCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        {icon} {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground">
      {children}
    </CardContent>
  </Card>
);

export default function EditAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: appointment, isLoading: isLoadingAppointment } =
    useAppointment(id);
  const updateMutation = useUpdateAppointment();

  const form = useForm<FormValues>({
    resolver: zodResolver(appointmentFormSchema),
  });

  // Pre-fill form with appointment data
  useEffect(() => {
    if (appointment) {
      form.reset({
        appointmentDate: parseISO(appointment.appointmentTime),
        appointmentTime: format(parseISO(appointment.appointmentTime), "HH:mm"),
        type: appointment.type,
        reason: appointment.reason,
        notes: appointment.notes || "",
      });
    }
  }, [appointment, form]);

  const watchedDate = form.watch("appointmentDate");

  // Reset time slot when date changes
  useEffect(() => {
    if (appointment) {
      const originalDate = format(
        parseISO(appointment.appointmentTime),
        "yyyy-MM-dd",
      );
      const newDate = watchedDate ? format(watchedDate, "yyyy-MM-dd") : "";
      if (originalDate !== newDate) {
        form.setValue("appointmentTime", "");
      }
    }
  }, [watchedDate, form, appointment]);

  const onSubmit = async (data: FormValues) => {
    if (!appointment) return;

    const updatedAppointmentTime = `${format(data.appointmentDate, "yyyy-MM-dd")}T${data.appointmentTime}`;

    const payload: Partial<AppointmentUpdateRequest> = {};
    if (updatedAppointmentTime !== appointment.appointmentTime) {
      payload.appointmentTime = updatedAppointmentTime;
    }
    if (data.type !== appointment.type) {
      payload.type = data.type;
    }
    if (data.reason !== appointment.reason) {
      payload.reason = data.reason;
    }
    if (data.notes !== (appointment.notes || "")) {
      payload.notes = data.notes;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No changes were made.");
      return;
    }

    updateMutation.mutate(
      { id, data: payload },
      {
        onSuccess: () => {
          router.push(`/admin/appointments/${id}`);
        },
      },
    );
  };

  if (isLoadingAppointment) {
    return (
      <div className="page-shell">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!appointment) {
    return <div className="page-shell">Appointment not found.</div>;
  }

  if (appointment.status !== "SCHEDULED") {
    return (
      <div className="page-shell text-center">
        <h1 className="text-2xl font-semibold mb-4">
          Cannot Reschedule Appointment
        </h1>
        <p className="text-muted-foreground mb-6">
          This appointment cannot be rescheduled because its status is &quot;
          {appointment.status}&quot;.
        </p>
        <Button asChild>
          <Link href="/admin/appointments">Back to List</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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
          <p className="text-muted-foreground">
            Modify the date, time, or details for this appointment.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="Patient" icon={<User className="h-5 w-5" />}>
          <p className="font-semibold">{appointment.patient.fullName}</p>
          <p>{appointment.patient.phoneNumber}</p>
        </InfoCard>
        <InfoCard title="Doctor" icon={<Briefcase className="h-5 w-5" />}>
          <p className="font-semibold">{appointment.doctor.fullName}</p>
          <p>{appointment.doctor.department}</p>
        </InfoCard>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                              !field.value && "text-muted-foreground",
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

              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Slot *</FormLabel>
                    <TimeSlotPicker
                      doctorId={appointment.doctor.id}
                      date={
                        watchedDate ? format(watchedDate, "yyyy-MM-dd") : ""
                      }
                      selectedSlot={field.value}
                      onSelect={field.onChange}
                      excludeAppointmentId={id}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                          <Label htmlFor="consultation">Consultation</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="FOLLOW_UP" id="follow_up" />
                          <Label htmlFor="follow_up">Follow-up</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="EMERGENCY" id="emergency" />
                          <Label htmlFor="emergency">Emergency</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Visit *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe symptoms..." {...field} />
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
                    <FormLabel>Notes (Staff only)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/appointments">Cancel</Link>
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
