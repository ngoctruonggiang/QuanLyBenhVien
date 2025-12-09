# AI Coding Standards & Conventions

**Project:** Hospital Management System - Frontend  
**Purpose:** Ensure consistency when multiple AI agents work on the same codebase  
**Last Updated:** December 9, 2025  
**Status:** MANDATORY - All AI agents must follow these standards

---

## 🎯 Critical Rule

**BEFORE making ANY changes, read this entire document first.**  
**When in doubt, check existing implementations in the codebase and follow the same pattern.**

---

## 📅 Date & Time Handling (CRITICAL - MOST COMMON ERROR)

### **Standard Formats**

| Context                  | Format         | Example                  | Library         |
| ------------------------ | -------------- | ------------------------ | --------------- |
| **API Request/Response** | ISO 8601       | `"2025-12-09T14:30:00"`  | Native JS       |
| **Database Storage**     | ISO 8601       | `"2025-12-09T14:30:00Z"` | Backend handles |
| **Form Input (Date)**    | `Date` object  | `new Date("2025-12-09")` | React Hook Form |
| **Form Input (Time)**    | String `HH:mm` | `"14:30"`                | React Hook Form |
| **Display to User**      | Localized      | `"Dec 9, 2025 2:30 PM"`  | `date-fns`      |
| **Calendar Component**   | `Date` object  | `new Date()`             | shadcn Calendar |

### **DateTime Assembly Pattern**

```typescript
// ✅ CORRECT: Assemble datetime from separate date and time inputs
import { format } from "date-fns";

// Form schema
const schema = z.object({
  appointmentDate: z.date(), // Date object from Calendar
  appointmentTime: z.string(), // "HH:mm" string from TimePicker
});

// Form submit handler
const onSubmit = (data: FormValues) => {
  // Assemble ISO datetime string
  const appointmentTime =
    format(data.appointmentDate, "yyyy-MM-dd") +
    "T" +
    data.appointmentTime +
    ":00";

  // Result: "2025-12-09T14:30:00" ✅

  api.createAppointment({
    ...otherData,
    appointmentTime, // Send as ISO string
  });
};
```

```typescript
// ❌ WRONG: Don't concatenate full datetime strings
const appointmentTime = data.appointmentDate + "T" + data.appointmentTime;
// If appointmentTime already contains date:
// "2025-12-09T2025-12-09T14:30:00" ❌ DUPLICATE!
```

### **Date Display Pattern**

```typescript
// ✅ CORRECT: Format dates for display
import { format, parseISO } from "date-fns";

// From API (ISO string) → Display
const displayDate = format(parseISO(appointment.appointmentTime), "PPp");
// Result: "Dec 9, 2025, 2:30 PM" ✅

// Common formats
format(date, "yyyy-MM-dd"); // "2025-12-09"
format(date, "PP"); // "Dec 9, 2025"
format(date, "PPp"); // "Dec 9, 2025, 2:30 PM"
format(date, "HH:mm"); // "14:30"
```

### **Time Slot Component Pattern**

```typescript
// ✅ CORRECT: TimeSlotPicker returns ONLY time (HH:mm)
interface TimeSlotPickerProps {
  onSelect: (time: string) => void; // "14:30", NOT full datetime
}

// Implementation
<TimeSlotPicker
  doctorId={doctorId}
  date={selectedDate} // YYYY-MM-DD string
  selectedSlot={selectedTime} // "14:30"
  onSelect={(time) => form.setValue("appointmentTime", time)}
/>

// ❌ WRONG: Don't return full datetime from TimeSlotPicker
onSelect: (datetime: string) => void; // ❌ NO!
```

### **Common Pitfalls to Avoid**

```typescript
// ❌ WRONG PATTERN 1: Double date concatenation
const datetime = date + "T" + fullDatetimeString;
// Results in: "2025-12-09T2025-12-09T14:30:00"

// ❌ WRONG PATTERN 2: Mixing Date objects and strings
const datetime = dateObject + "T" + timeString;
// Results in: "[object Date]T14:30"

// ❌ WRONG PATTERN 3: Wrong ISO format
const datetime = "12/09/2025T14:30:00";
// Should be: "2025-12-09T14:30:00"

// ❌ WRONG PATTERN 4: Adding seconds when not needed
const datetime = date + "T" + time + ":00:00";
// Should be: date + "T" + time + ":00"
```

---

## 🏗️ Component Architecture

### **File Structure**

```
app/
├── (auth)/              # Public routes
├── admin/               # Admin dashboard
│   └── [module]/
│       ├── page.tsx     # List page
│       ├── new/
│       │   └── page.tsx # Create page
│       ├── [id]/
│       │   ├── page.tsx # Detail page
│       │   └── edit/
│       │       └── page.tsx # Edit page
│       └── _components/ # Module-specific components
│           ├── columns.tsx
│           ├── [module]-form.tsx
│           └── [module]-card.tsx
├── doctor/              # Doctor-specific routes
└── patient/             # Patient-specific routes

components/
├── ui/                  # shadcn/ui base components (DON'T MODIFY)
├── auth/                # Auth-related (RoleGuard)
└── [domain]/            # Domain-specific shared components
    ├── PatientSearchSelect.tsx
    ├── DoctorSearchSelect.tsx
    └── TimeSlotPicker.tsx
```

### **Component Naming Conventions**

```typescript
// ✅ CORRECT
export function PatientForm({ ... }) { }          // PascalCase for components
export const usePatients = () => { };              // camelCase for hooks
export const patientService = { };                 // camelCase for services
export interface Patient { }                       // PascalCase for interfaces
export type UserRole = "ADMIN" | "DOCTOR";         // PascalCase for types

// ❌ WRONG
export function patient_form() { }                 // ❌ snake_case
export const UsePatients = () => { };              // ❌ PascalCase for hooks
export const PatientService = { };                 // ❌ PascalCase for services
```

---

## 📝 Form Implementation Standards

### **Form Schema Pattern**

```typescript
// ✅ CORRECT: Use Zod with react-hook-form
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Define schema
const formSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  doctorId: z.string().min(1, "Please select a doctor"),
  appointmentDate: z.date({ message: "Please select a date" }),
  appointmentTime: z.string().min(1, "Please select a time slot"),
  type: z.enum(["CONSULTATION", "FOLLOW_UP", "EMERGENCY"]),
  reason: z
    .string()
    .min(1, "Please enter reason")
    .max(500, "Reason cannot exceed 500 characters"),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Use in component
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    patientId: "",
    doctorId: "",
    appointmentTime: "",
    type: "CONSULTATION",
    reason: "",
    notes: "",
  },
});
```

### **Form Submit Pattern**

```typescript
// ✅ CORRECT: Mutation with error handling
const createMutation = useCreateAppointment();

const onSubmit = async (data: FormValues) => {
  // Transform data before sending
  const payload = {
    ...data,
    appointmentTime: format(data.appointmentDate, "yyyy-MM-dd") +
                     "T" + data.appointmentTime + ":00",
  };

  createMutation.mutate(payload, {
    onSuccess: () => {
      toast.success("Appointment created successfully");
      router.push("/admin/appointments");
    },
    onError: (error: any) => {
      // Error already handled by mutation hook
      console.error("Submit error:", error);
    },
  });
};

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Creating..." : "Create Appointment"}
      </Button>
    </form>
  </Form>
);
```

---

## 🔐 Role-Based Access Control

### **Role Check Patterns**

```typescript
// ✅ CORRECT: Consistent role checking
import { useAuth } from "@/contexts/AuthContext";

// Pattern 1: Single role
{user?.role === "ADMIN" && (
  <Button>Admin Only Action</Button>
)}

// Pattern 2: Multiple roles (use array.includes)
{["ADMIN", "RECEPTIONIST"].includes(user?.role) && (
  <Button>Staff Action</Button>
)}

// Pattern 3: Exclude roles
{user?.role !== "PATIENT" && (
  <Button>All Staff Action</Button>
)}

// ❌ WRONG: Inconsistent patterns
{user?.role == "ADMIN" && ...}              // ❌ Use ===, not ==
{user.role === "ADMIN" && ...}              // ❌ No optional chaining
{["ADMIN", "RECEPTIONIST"].indexOf(user?.role) >= 0 && ...} // ❌ Use includes()
```

### **RoleGuard Usage**

```typescript
// ✅ CORRECT: Wrap protected routes
export default function AppointmentsPage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]}>
      <div className="container">
        {/* Page content */}
      </div>
    </RoleGuard>
  );
}

// ❌ WRONG: Don't put RoleGuard inside conditional
{someCondition && (
  <RoleGuard allowedRoles={["ADMIN"]}>  // ❌ NO!
    <Content />
  </RoleGuard>
)}
```

---

## 🎨 UI Component Standards

### **Import Order**

```typescript
// ✅ CORRECT: Organized imports
// 1. React & Next.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. External libraries
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 3. UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

// 4. Icons
import { Plus, Search, Calendar } from "lucide-react";

// 5. Domain components
import { PatientSearchSelect } from "@/components/patient/PatientSearchSelect";

// 6. Hooks & services
import { usePatients, useCreatePatient } from "@/hooks/queries/usePatient";
import { patientService } from "@/services/patient.service";

// 7. Interfaces & types
import { Patient, PatientCreateRequest } from "@/interfaces/patient";

// 8. Utils
import { cn } from "@/lib/utils";
```

### **Component Structure Template**

```typescript
"use client"; // If using client-side features

import { /* imports */ } from "...";

// Interfaces/Types (if component-specific)
interface MyComponentProps {
  id: string;
  onSuccess?: () => void;
}

export function MyComponent({ id, onSuccess }: MyComponentProps) {
  // 1. Hooks (order matters)
  const router = useRouter();
  const { user } = useAuth();

  // 2. State
  const [loading, setLoading] = useState(false);

  // 3. Queries
  const { data, isLoading } = useMyData(id);

  // 4. Mutations
  const createMutation = useCreateMutation();

  // 5. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 6. Handlers
  const handleSubmit = async () => {
    // Logic
  };

  // 7. Early returns
  if (isLoading) return <Skeleton />;
  if (!data) return <NotFound />;

  // 8. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### **Styling Conventions**

```typescript
// ✅ CORRECT: Use Tailwind + cn() for conditional classes
import { cn } from "@/lib/utils";

<Button
  className={cn(
    "px-4 py-2 rounded-md", // Base styles
    {
      "bg-primary text-primary-foreground": isActive,
      "bg-gray-100 text-gray-400": !isActive,
    }
  )}
>
  Click me
</Button>

// ❌ WRONG: Inline conditional strings
<Button
  className={isActive ? "bg-primary text-white" : "bg-gray-100"}
>

// ❌ WRONG: Inline styles
<Button style={{ backgroundColor: isActive ? "blue" : "gray" }}>
```

---

## 🔄 Data Fetching Patterns

### **React Query Standard**

```typescript
// ✅ CORRECT: Consistent query/mutation structure

// hooks/queries/useAppointment.ts
export const useAppointments = (params?: AppointmentListParams) => {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointmentService.list(params),
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AppointmentCreateRequest) =>
      appointmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment created successfully");
    },
    onError: (error: any) => {
      const message = getAppointmentErrorMessage(
        error?.response?.data?.error?.code
      );
      toast.error(message);
    },
  });
};

// ❌ WRONG: Inconsistent patterns
export const getAppointments = () => {  // ❌ Should be useAppointments
  return useQuery(...)
};

export function CreateAppointment() {   // ❌ Not a hook, wrong naming
  return useMutation(...)
}
```

### **Service Layer Pattern**

```typescript
// ✅ CORRECT: Consistent service structure
// services/appointment.service.ts

const BASE_URL = "/api/appointments";

export const appointmentService = {
  list: async (params: AppointmentListParams) => {
    const response = await axiosInstance.get(BASE_URL, { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  create: async (data: AppointmentCreateRequest) => {
    const response = await axiosInstance.post(BASE_URL, data);
    return response.data;
  },

  update: async (id: string, data: AppointmentUpdateRequest) => {
    const response = await axiosInstance.patch(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
};

// ❌ WRONG: Inconsistent function names
export async function getAppointmentList() {} // ❌ Not part of service object
export const createNewAppointment = () => {}; // ❌ Inconsistent naming
```

---

## 🧪 Error Handling Standards

### **Error Message Mapping**

```typescript
// ✅ CORRECT: Centralized error messages
function getAppointmentErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    VALIDATION_ERROR: "Please check your input and try again",
    PAST_APPOINTMENT: "Cannot book appointments in the past",
    PATIENT_NOT_FOUND: "Patient not found",
    DOCTOR_NOT_AVAILABLE: "Doctor is not available on the selected date",
    TIME_SLOT_TAKEN: "Selected time slot is already booked",
    FORBIDDEN: "You do not have permission to perform this action",
  };

  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
}

// Usage in mutation
onError: (error: any) => {
  const message = getAppointmentErrorMessage(
    error?.response?.data?.error?.code,
  );
  toast.error(message);
};

// ❌ WRONG: Hardcoded messages everywhere
onError: (error) => {
  toast.error("Error creating appointment"); // ❌ Not specific
};
```

---

## 📊 State Management

### **Form State**

```typescript
// ✅ CORRECT: Use react-hook-form for forms
const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    /* ... */
  },
});

// ❌ WRONG: Manual state for complex forms
const [patientId, setPatientId] = useState("");
const [doctorId, setDoctorId] = useState("");
const [errors, setErrors] = useState({});
```

### **Component State**

```typescript
// ✅ CORRECT: Separate concerns
const [filters, setFilters] = useState({ status: "ALL", search: "" });
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);

// ❌ WRONG: One giant state object
const [state, setState] = useState({
  filters: {},
  pagination: {},
  data: [],
  loading: false,
  error: null,
}); // Hard to manage
```

---

## 🎯 TypeScript Standards

### **Interface vs Type**

```typescript
// ✅ Use interface for object shapes
interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
}

// ✅ Use type for unions, primitives, utility types
type UserRole = "ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "PATIENT";
type AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

// ❌ WRONG: Using type for simple object (prefer interface)
type Patient = {
  id: string;
  name: string;
};
```

### **Type Safety**

```typescript
// ✅ CORRECT: Proper typing
const handleSubmit = async (data: FormValues) => {
  const response = await appointmentService.create(data);
  return response;
};

// ❌ WRONG: Using 'any'
const handleSubmit = async (data: any) => {
  // ❌ NO!
  const response = await appointmentService.create(data);
  return response;
};
```

---

## 📁 File Naming Conventions

```
✅ CORRECT:
components/appointment/TimeSlotPicker.tsx    (PascalCase)
hooks/queries/useAppointment.ts              (camelCase)
services/appointment.service.ts              (kebab-case)
interfaces/appointment.ts                    (kebab-case)
app/admin/appointments/page.tsx              (kebab-case)
app/admin/appointments/_components/columns.tsx

❌ WRONG:
components/appointment/time-slot-picker.tsx  (use PascalCase)
hooks/queries/UseAppointment.ts              (use camelCase)
services/AppointmentService.ts               (use kebab-case)
```

---

## 🚀 Performance Best Practices

### **Debouncing Search**

```typescript
// ✅ CORRECT: Use custom debounce hook
import { useDebounce } from "@/hooks/useDebounce";

const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 300);

// Use debouncedSearch in query
const { data } = useAppointments({ search: debouncedSearch });

// ❌ WRONG: No debouncing
const { data } = useAppointments({ search }); // Fires on every keystroke
```

### **Pagination**

```typescript
// ✅ CORRECT: Server-side pagination
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);

const { data } = useAppointments({ page, size: pageSize });

// ❌ WRONG: Client-side pagination of all data
const { data: allData } = useAllAppointments();
const paginatedData = allData.slice(page * pageSize, (page + 1) * pageSize);
```

---

## ✅ Checklist Before Committing Code

- [ ] **Date/Time**: Checked all datetime handling follows ISO 8601 format
- [ ] **Types**: No `any` types used (except unavoidable cases with comment)
- [ ] **Imports**: Organized in correct order
- [ ] **Naming**: Consistent with project conventions
- [ ] **Role Checks**: Using `user?.role` with optional chaining
- [ ] **Error Handling**: User-friendly messages, not raw errors
- [ ] **Forms**: Using react-hook-form + Zod
- [ ] **Queries**: Using React Query hooks pattern
- [ ] **Components**: Proper structure (hooks → state → effects → handlers → render)
- [ ] **No Console Errors**: Checked browser console
- [ ] **No Lint Errors**: Run `npm run lint`
- [ ] **Type Check**: Run `npx tsc --noEmit`

---

## 🔍 When in Doubt

1. **Search the codebase**: Find similar implementations

   ```bash
   grep -r "useForm" app/
   grep -r "appointmentTime" services/
   ```

2. **Check existing patterns**: Look at implemented features
   - Patient service: Reference for CRUD operations
   - Appointment service: Reference for datetime handling
   - Billing service: Reference for complex forms

3. **Read the specs**: Check `DOCS/fe-specs/*.md` for requirements

4. **Ask for clarification**: Better to ask than implement incorrectly

---

## 📚 Reference Files

### **Must-Read Before Coding**

| File                                       | Purpose                               |
| ------------------------------------------ | ------------------------------------- |
| `DOCS/AI-AGENT-OPERATIONS-GUIDE.md`        | Overall project structure & workflows |
| `DOCS/fe-specs/*.md`                       | Feature requirements & API contracts  |
| `DOCS/fe-specs/ROLE-PERMISSIONS-MATRIX.md` | Role-based access rules               |
| `hooks/use-auth.ts`                        | Auth context & UserRole type          |
| `lib/utils.ts`                             | Utility functions                     |

### **Reference Implementations**

| Feature            | Reference File                                   |
| ------------------ | ------------------------------------------------ |
| Form with datetime | `app/admin/appointments/new/page.tsx`            |
| List with filters  | `app/admin/appointments/page.tsx`                |
| Detail view        | `app/admin/appointments/[id]/page.tsx`           |
| Time picker        | `components/appointment/TimeSlotPicker.tsx`      |
| Search select      | `components/appointment/PatientSearchSelect.tsx` |
| Service layer      | `services/appointment.service.ts`                |
| React Query hooks  | `hooks/queries/useAppointment.ts`                |

---

## 🎓 Common Mistakes Reference

### **Top 10 Mistakes to Avoid**

1. **DateTime duplication**: `"2025-12-09T2025-12-09T14:30:00"`
2. **Missing optional chaining**: `user.role` instead of `user?.role`
3. **Using `==` instead of `===`**
4. **Hardcoded error messages** instead of centralized mapping
5. **No debouncing on search inputs**
6. **Client-side pagination of large datasets**
7. **Inline styles instead of Tailwind classes**
8. **Using `any` type without justification**
9. **Inconsistent naming conventions**
10. **Forgetting to invalidate queries after mutations**

---

## 📞 Getting Help

If you encounter an issue not covered here:

1. **Check browser console** for errors
2. **Check network tab** for API call details
3. **Search this document** for related patterns
4. **Check reference implementations** in the codebase
5. **Read the spec** for that feature
6. **Ask with context**: Include error messages, code snippets, and what you've tried

---

**Last Updated:** December 9, 2025  
**Maintained by:** Project AI Agents  
**Status:** Living document - updated as patterns evolve

**Remember:** Consistency > Cleverness. Follow the established patterns even if you think you have a "better" way. The goal is maintainability across multiple AI agents and human developers.
