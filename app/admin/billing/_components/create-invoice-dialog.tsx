"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGenerateInvoice } from "@/hooks/queries/useBilling";
import { useAppointmentList } from "@/hooks/queries/useAppointment";
import { Plus, Loader2, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface CreateInvoiceDialogProps {
  onSuccess?: () => void;
}

export function CreateInvoiceDialog({ onSuccess }: CreateInvoiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [appointmentId, setAppointmentId] = useState("");
  const [notes, setNotes] = useState("");

  const generateInvoice = useGenerateInvoice();

  // Fetch completed appointments that might not have invoices
  const { data: appointments, isLoading: appointmentsLoading } =
    useAppointmentList({
      status: "COMPLETED",
      page: 0,
      size: 100,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!appointmentId) {
      toast.error("Please select an appointment");
      return;
    }

    try {
      await generateInvoice.mutateAsync({
        appointmentId,
        notes: notes || undefined,
      });

      toast.success("Invoice created successfully");
      setOpen(false);
      setAppointmentId("");
      setNotes("");
      onSuccess?.();
    } catch (error: any) {
      // Handle "invoice already exists" error gracefully
      if (error?.response?.data?.code === 4009 || 
          error?.message?.includes("already exists")) {
        toast.error("Invoice already exists for this appointment");
      } else {
        toast.error(
          error?.response?.data?.message || 
          error?.message || 
          "Failed to create invoice"
        );
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setAppointmentId("");
      setNotes("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Invoice
          </DialogTitle>
          <DialogDescription>
            Generate a new invoice for a completed appointment. The system will
            automatically include consultation fees and any prescription items.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Invoices are auto-generated after prescription dispense. Use this
                form only if auto-generation failed or for consultation-only exams.
              </AlertDescription>
            </Alert>

            <div className="grid gap-2">
              <Label htmlFor="appointment">Appointment *</Label>
              <Select
                value={appointmentId}
                onValueChange={setAppointmentId}
                disabled={appointmentsLoading}
              >
                <SelectTrigger id="appointment">
                  <SelectValue
                    placeholder={
                      appointmentsLoading
                        ? "Loading appointments..."
                        : "Select an appointment"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {appointments?.content?.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {apt.patient?.fullName || "Unknown Patient"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {apt.appointmentTime
                            ? format(new Date(apt.appointmentTime), "dd/MM/yyyy HH:mm")
                            : "No date"}{" "}
                          • Dr. {apt.doctor?.fullName || "Unknown"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  {!appointmentsLoading &&
                    (!appointments?.content || appointments.content.length === 0) && (
                      <SelectItem value="none" disabled>
                        No completed appointments found
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for this invoice..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={generateInvoice.isPending || !appointmentId}
            >
              {generateInvoice.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
