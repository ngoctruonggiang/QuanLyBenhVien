"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Thermometer, Heart, Activity, Loader2 } from "lucide-react";
import { useCreateMedicalExam, useMedicalExamByAppointment } from "@/hooks/queries/useMedicalExam";
import { toast } from "sonner";

// Vital signs only schema - use number().optional() for proper typing
const vitalSignsSchema = z.object({
  temperature: z.coerce.number().min(30, "Tối thiểu 30°C").max(45, "Tối đa 45°C").optional(),
  bloodPressureSystolic: z.coerce.number().min(50).max(250).optional(),
  bloodPressureDiastolic: z.coerce.number().min(30).max(150).optional(),
  heartRate: z.coerce.number().min(30).max(200).optional(),
  weight: z.coerce.number().min(0.1).max(500).optional(),
  height: z.coerce.number().min(1).max(300).optional(),
});

type VitalSignsFormValues = z.infer<typeof vitalSignsSchema>;

interface VitalSignsDialogProps {
  appointmentId: string;
  patientName: string;
  children?: React.ReactNode;
  // Controlled mode props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function VitalSignsDialog({
  appointmentId,
  patientName,
  children,
  open: controlledOpen,
  onOpenChange,
}: VitalSignsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled or uncontrolled mode
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;
  
  const createExamMutation = useCreateMedicalExam();
  
  // Check if exam already exists for this appointment
  const { data: existingExam, isLoading: checkingExam } = useMedicalExamByAppointment(
    appointmentId,
    open // Only fetch when dialog is open
  );

  const form = useForm<VitalSignsFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(vitalSignsSchema) as any,
    defaultValues: {
      temperature: undefined,
      bloodPressureSystolic: undefined,
      bloodPressureDiastolic: undefined,
      heartRate: undefined,
      weight: undefined,
      height: undefined,
    },
  });

  const onSubmit = async (data: VitalSignsFormValues) => {
    const cleanData = {
      appointmentId,
      temperature: data.temperature,
      bloodPressureSystolic: data.bloodPressureSystolic, 
      bloodPressureDiastolic: data.bloodPressureDiastolic,
      heartRate: data.heartRate,
      weight: data.weight,
      height: data.height,
    };

    try {
      await createExamMutation.mutateAsync({
        data: cleanData,
      });
      toast.success("Đã lưu chỉ số vital signs thành công");
      setOpen(false);
      form.reset();
    } catch {
      toast.error("Không thể lưu vital signs");
    }
  };

  // Access vitals from existingExam.vitals
  const vitals = existingExam?.vitals;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only show trigger when not in controlled mode or has children */}
      {(!isControlled || children) && (
        <DialogTrigger asChild>
          {children || (
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Vital Signs
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent 
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-500" />
            Điền Vital Signs
          </DialogTitle>
          <DialogDescription>
            Bệnh nhân: <strong>{patientName}</strong>
          </DialogDescription>
        </DialogHeader>

        {checkingExam ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : existingExam ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-2">
              Cuộc hẹn này đã có phiếu khám bệnh.
            </p>
            <p className="text-sm">
              Vital signs: {vitals?.temperature ?? "-"}°C, {vitals?.bloodPressureSystolic ?? "-"}/{vitals?.bloodPressureDiastolic ?? "-"} mmHg, {vitals?.heartRate ?? "-"} bpm
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Temperature */}
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-red-500" />
                        Nhiệt độ (°C)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="37.0"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Heart Rate */}
                <FormField
                  control={form.control}
                  name="heartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        Nhịp tim (bpm)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="75"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Blood Pressure Systolic */}
                <FormField
                  control={form.control}
                  name="bloodPressureSystolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Huyết áp tâm thu (mmHg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="120"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Blood Pressure Diastolic */}
                <FormField
                  control={form.control}
                  name="bloodPressureDiastolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Huyết áp tâm trương (mmHg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="80"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Weight */}
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cân nặng (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="65"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Height */}
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chiều cao (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="170"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={createExamMutation.isPending}
                >
                  {createExamMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu Vital Signs"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
