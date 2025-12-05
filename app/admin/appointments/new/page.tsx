"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ArrowLeft, Loader2, CalendarDays, Clock } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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

import { AppointmentType, TimeSlot } from "@/interfaces/appointment";
import {
  useCreateAppointment,
  useTimeSlots,
} from "@/hooks/queries/useAppointment";
import { hrService } from "@/services/hr.service";
import { getPatients } from "@/services/patient.service";
import { Patient } from "@/interfaces/patient";
import { Employee } from "@/interfaces/hr";

// Type alias for patient display
type PatientWithPhone = Patient;

// Form schema
const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  doctorId: z.string().min(1, "Please select a doctor"),
  appointmentDate: z.date({ message: "Please select a date" }),
  appointmentTime: z.string().min(1, "Please select a time slot"),
  type: z.enum(["CONSULTATION", "FOLLOW_UP", "EMERGENCY"], {
    message: "Please select appointment type",
  }),
  reason: z
    .string()
    .min(1, "Please enter reason for visit")
    .max(500, "Reason cannot exceed 500 characters"),
});

type FormValues = z.infer<typeof appointmentFormSchema>;

export default function NewAppointmentPage() {
  const router = useRouter();
  const createMutation = useCreateAppointment();

  // Patient and Doctor search states
  const [patients, setPatients] = useState<PatientWithPhone[]>([]);
  const [doctors, setDoctors] = useState<Employee[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [patientOpen, setPatientOpen] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);

  // Selected patient/doctor display
  const [selectedPatient, setSelectedPatient] =
    useState<PatientWithPhone | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Employee | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(appointmentFormSchema) as any,
    defaultValues: {
      patientId: "",
      doctorId: "",
      appointmentTime: "",
      type: "CONSULTATION",
      reason: "",
    },
  });

  const watchedDoctorId = form.watch("doctorId");
  const watchedDate = form.watch("appointmentDate");

  // Fetch time slots when doctor and date are selected
  const { data: timeSlots, isLoading: loadingSlots } = useTimeSlots(
    watchedDoctorId,
    watchedDate ? format(watchedDate, "yyyy-MM-dd") : ""
  );

  // Load patients on search
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoadingPatients(true);
      try {
        // Mock uses 0-based page; always load first page and filter client-side
        const result = await getPatients({
          page: 0,
          size: 20,
          search: patientSearch || undefined,
        });
        const filtered = result.content.filter((p: PatientWithPhone) =>
          patientSearch
            ? p.fullName.toLowerCase().includes(patientSearch.toLowerCase())
            : true
        ) as PatientWithPhone[];
        setPatients(filtered);
      } catch (error) {
        console.error("Error loading patients:", error);
      } finally {
        setLoadingPatients(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [patientSearch]);

  // Load doctors on search
  useEffect(() => {
    const loadDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const result = await hrService.getDoctors({ status: "ACTIVE" });
        let filtered = result.content;
        if (doctorSearch) {
          filtered = filtered.filter(
            (d: Employee) =>
              d.fullName.toLowerCase().includes(doctorSearch.toLowerCase()) ||
              d.specialization
                ?.toLowerCase()
                .includes(doctorSearch.toLowerCase())
          );
        }
        setDoctors(filtered);
      } catch (error) {
        console.error("Error loading doctors:", error);
      } finally {
        setLoadingDoctors(false);
      }
    };

    loadDoctors();
  }, [doctorSearch]);

  // Reset time slot when date or doctor changes
  useEffect(() => {
    form.setValue("appointmentTime", "");
  }, [watchedDoctorId, watchedDate, form]);

  const onSubmit = async (data: FormValues) => {
    const appointmentTime =
      format(data.appointmentDate, "yyyy-MM-dd") +
      "T" +
      data.appointmentTime +
      ":00";

    createMutation.mutate(
      {
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentTime,
        type: data.type,
        reason: data.reason,
      },
      {
        onSuccess: () => {
          router.push("/admin/appointments");
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/appointments">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Book Appointment
          </h1>
          <p className="text-muted-foreground">
            Schedule a new appointment for a patient
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Patient *</FormLabel>
                    <Popover open={patientOpen} onOpenChange={setPatientOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {selectedPatient
                              ? selectedPatient.fullName
                              : "Search patient by name..."}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search patients..."
                            value={patientSearch}
                            onValueChange={setPatientSearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {loadingPatients
                                ? "Loading..."
                                : "No patient found. Type to search."}
                            </CommandEmpty>
                            <CommandGroup>
                              {patients.map((patient) => (
                                <CommandItem
                                  key={patient.id}
                                  value={patient.id.toString()}
                                  onSelect={() => {
                                    field.onChange(patient.id.toString());
                                    setSelectedPatient(patient);
                                    setPatientOpen(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {patient.fullName}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {patient.gender} • DOB:{" "}
                                      {patient.dateOfBirth}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Doctor Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Doctor Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Doctor *</FormLabel>
                    <Popover open={doctorOpen} onOpenChange={setDoctorOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {selectedDoctor
                              ? `${selectedDoctor.fullName} - ${
                                  selectedDoctor.departmentName ||
                                  selectedDoctor.specialization
                                }`
                              : "Select a doctor..."}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search doctors..."
                            value={doctorSearch}
                            onValueChange={setDoctorSearch}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {loadingDoctors
                                ? "Loading..."
                                : "No doctor found."}
                            </CommandEmpty>
                            <CommandGroup>
                              {doctors.map((doctor) => (
                                <CommandItem
                                  key={doctor.id}
                                  value={doctor.id}
                                  onSelect={() => {
                                    field.onChange(doctor.id);
                                    setSelectedDoctor(doctor);
                                    setDoctorOpen(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {doctor.fullName}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {doctor.departmentName} •{" "}
                                      {doctor.specialization}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Schedule Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule Selection</CardTitle>
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
                    {!watchedDoctorId || !watchedDate ? (
                      <p className="text-sm text-muted-foreground">
                        Please select a doctor and date first
                      </p>
                    ) : loadingSlots ? (
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
                              field.value === slot.time ? "default" : "outline"
                            }
                            className={cn(
                              "h-10",
                              !slot.available && "opacity-50 cursor-not-allowed"
                            )}
                            disabled={!slot.available}
                            onClick={() => field.onChange(slot.time)}
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    )}
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
                        defaultValue={field.value}
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
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/admin/appointments">Cancel</Link>
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Book Appointment
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
