// components/medical-exam/VitalsForm.tsx
import { Control, Controller, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Assuming Label component exists

interface VitalsFormProps {
  control: Control<any>; // Use appropriate type for form control
  errors: FieldErrors; // Use appropriate type for form errors
}

const vitalFields = [
  { name: 'temperature', label: 'Temperature', unit: '°C', min: 30, max: 45, step: 0.1, icon: '🌡️' },
  { name: 'bloodPressureSystolic', label: 'BP Systolic', unit: 'mmHg', min: 50, max: 250, step: 1, icon: '📊' },
  { name: 'bloodPressureDiastolic', label: 'BP Diastolic', unit: 'mmHg', min: 30, max: 150, step: 1, icon: '📊' },
  { name: 'heartRate', label: 'Heart Rate', unit: 'bpm', min: 30, max: 200, step: 1, icon: '❤️' },
  { name: 'weight', label: 'Weight', unit: 'kg', min: 0.1, max: 500, step: 0.1, icon: '⚖️' },
  { name: 'height', label: 'Height', unit: 'cm', min: 1, max: 300, step: 0.1, icon: '📏' },
];

export function VitalsForm({ control, errors }: VitalsFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vitalFields.map((field) => (
        <Controller
          key={field.name}
          name={field.name}
          control={control}
          render={({ field: { onChange, value } }) => (
            <div className="space-y-1">
              <Label htmlFor={field.name} className="flex items-center gap-1">
                {field.icon} {field.label}
              </Label>
              <div className="relative">
                <Input
                  id={field.name}
                  type="number"
                  step={field.step}
                  min={field.min}
                  max={field.max}
                  value={value ?? ''}
                  onChange={(e) => onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                  placeholder={`${field.min}-${field.max}`}
                  className="pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {field.unit}
                </span>
              </div>
              {errors[field.name] && (
                <p className="text-destructive text-sm">{errors[field.name]?.message as string}</p>
              )}
            </div>
          )}
        />
      ))}
    </div>
  );
}
