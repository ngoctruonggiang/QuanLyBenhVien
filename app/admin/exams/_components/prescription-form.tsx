"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PrescriptionFormValues,
  prescriptionSchema,
} from "@/lib/schemas/medical-exam";
import { useQuery } from "@tanstack/react-query";
import { getMedicines } from "@/services/medicine.service";
import { Medicine } from "@/interfaces/medicine";
import { useState } from "react";
import { Pill, FileText } from "lucide-react";

interface PrescriptionFormProps {
  onSubmit: (data: PrescriptionFormValues) => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<PrescriptionFormValues>;
}

export function PrescriptionForm({
  onSubmit,
  isSubmitting,
  defaultValues,
}: PrescriptionFormProps) {
  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema) as any,
    defaultValues: defaultValues || {
      items: [
        {
          medicineId: "",
          quantity: 1,
          dosage: "",
          duration: "",
          notes: "",
        },
      ],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { data: medicinesData } = useQuery({
    queryKey: ["medicines-list"],
    queryFn: () => getMedicines({ page: 1, size: 100 }),
  });

  const medicines: Medicine[] = medicinesData?.content || [];
  const [openMedicine, setOpenMedicine] = useState<number | null>(null);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="form-section-card">
          <div className="form-section-card-title">
            <Pill className="h-5 w-5 text-emerald-500" />
            Prescription Items
          </div>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-col gap-4 rounded-lg border border-slate-200 p-4 bg-slate-50/50"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-slate-700">Medicine {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="form-grid">
                  <FormField
                    control={form.control}
                    name={`items.${index}.medicineId`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="form-label form-label-required">Medicine</FormLabel>
                        <Popover
                          open={openMedicine === index}
                          onOpenChange={(open) =>
                            setOpenMedicine(open ? index : null)
                          }
                        >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? medicines.find(
                                    (m) => m.id.toString() === field.value,
                                  )?.name
                                : "Select medicine"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                          <Command>
                            <CommandInput placeholder="Search medicine..." />
                            <CommandList>
                              <CommandEmpty>No medicine found.</CommandEmpty>
                              <CommandGroup>
                                {medicines.map((medicine) => (
                                  <CommandItem
                                    value={medicine.name}
                                    key={medicine.id}
                                    onSelect={() => {
                                      form.setValue(
                                        `items.${index}.medicineId`,
                                        medicine.id.toString(),
                                      );
                                      setOpenMedicine(null);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        medicine.id.toString() === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    {medicine.name}
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

                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label form-label-required">Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.dosage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label form-label-required">Dosage</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 1 tablet 3x daily"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`items.${index}.duration`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="form-label form-label-required">Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 5 days" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name={`items.${index}.notes`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="form-label">Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Special instructions..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() =>
                append({
                  medicineId: "",
                  quantity: 1,
                  dosage: "",
                  duration: "",
                  notes: "",
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Medicine
            </Button>
          </div>
        </div>

        <div className="form-section-card">
          <div className="form-section-card-title">
            <FileText className="h-5 w-5 text-amber-500" />
            Prescription Notes
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes for the prescription..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0"
        >
          {isSubmitting ? "Saving..." : "Save Prescription"}
        </Button>
      </form>
    </Form>
  );
}
