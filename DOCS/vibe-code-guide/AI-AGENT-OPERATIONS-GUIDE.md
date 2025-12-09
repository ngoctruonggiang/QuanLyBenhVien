# AI Agent Operations Guide for HMS_FE Project

> **Target Audience:** AI assistants (Claude, GPT, Gemini, etc.) assigned to work on this Hospital Management System Frontend codebase
>
> **Last Updated:** December 6, 2025
>
> **Project:** HMS_FE (Hospital Management System - Frontend)

---

## 🎯 Mission Statement

You are an AI agent tasked with maintaining and enhancing a Next.js-based Hospital Management System frontend. This guide provides you with the operational knowledge to:

1. Navigate the codebase efficiently
2. Understand architectural patterns
3. Make safe, spec-compliant changes
4. Maintain code quality and consistency
5. Follow established workflows

---

## ⚠️ CRITICAL: Read First

**Before doing ANY work on this project, you MUST read:**

1. **This file** (AI-AGENT-OPERATIONS-GUIDE.md) - How to operate on the codebase
2. **`DOCS/AI-CODING-STANDARDS.md`** ⭐ - Coding conventions & standards (MANDATORY)

These documents ensure consistency when multiple AI agents work on the same project.

---

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Project Architecture](#project-architecture)
3. [Critical Files & Directories](#critical-files--directories)
4. [Role-Based Access Control](#role-based-access-control)
5. [Operational Workflows](#operational-workflows)
6. [Code Modification Protocols](#code-modification-protocols)
7. [Testing & Validation](#testing--validation)
8. [Common Tasks & Solutions](#common-tasks--solutions)
9. [Error Handling Patterns](#error-handling-patterns)
10. [Do's and Don'ts](#dos-and-donts)

---

## 🚀 Quick Reference

### Tech Stack

```yaml
Framework: Next.js 14+ (App Router)
Language: TypeScript
Styling: Tailwind CSS + shadcn/ui components
State Management: React Query (TanStack Query)
Auth: Cookie-based with JWT
HTTP Client: Axios with interceptors
Testing: Playwright (E2E)
Package Manager: pnpm
```

### Key Commands

```bash
# Development
pnpm dev                    # Start dev server (port 3000)
pnpm build                  # Production build
pnpm start                  # Start production server

# Code Quality
pnpm lint                   # ESLint check
pnpm format                 # Prettier format
pnpm type-check            # TypeScript check (if available)

# Testing
pnpm test:e2e              # Run Playwright tests
pnpm test:ui               # Run Playwright with UI

# Dependencies
pnpm install <package>     # Add new package
pnpm update                # Update dependencies
```

### Directory Structure Map

```
HMS_FE/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Public auth routes (login, signup)
│   ├── admin/             # Admin dashboard & modules
│   ├── doctor/            # Doctor-specific pages
│   └── page.tsx           # Landing page with role redirects
├── components/            # React components
│   ├── ui/                # shadcn/ui base components
│   └── auth/              # Auth-related components (RoleGuard)
├── services/              # API service layers
├── hooks/                 # Custom React hooks
│   └── queries/           # React Query hooks
├── interfaces/            # TypeScript type definitions
├── lib/                   # Utility functions & schemas
├── config/                # Configuration files
├── DOCS/                  # Documentation & specifications
│   └── fe-specs/          # Frontend specifications
└── tests/                 # E2E test suites
```

---

## 🏗️ Project Architecture

### 1. App Router Structure (Next.js 14+)

**Pattern:** File-system based routing with route groups

```typescript
// Route Mapping
/login                    → app/(auth)/login/page.tsx
/admin/patients           → app/admin/patients/page.tsx
/admin/patients/[id]      → app/admin/patients/[id]/page.tsx
/doctor/schedules         → app/doctor/schedules/page.tsx
```

**Layout Hierarchy:**

```
app/layout.tsx (Root)
  └── app/admin/layout.tsx (Admin sidebar + RoleGuard)
      └── app/admin/patients/page.tsx (Patient list)
```

### 2. Component Architecture

**Atomic Design Influence:**

- **UI Primitives:** `components/ui/` (button, card, dialog, etc.)
- **Feature Components:** `app/[module]/_components/` (domain-specific)
- **Shared Components:** `components/` (cross-module utilities)

**Example Component Structure:**

```typescript
// components/ui/button.tsx (Base UI)
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...);

// app/admin/patients/_components/patient-card.tsx (Feature)
import { Button } from "@/components/ui/button";
export function PatientCard({ patient, onEdit, onDelete }) {...}
```

### 3. Data Flow Architecture

```
┌─────────────┐
│   Page      │ ← React Query hooks (usePatients)
│  Component  │
└──────┬──────┘
       │
┌──────▼──────┐
│   Service   │ ← Axios + interceptors
│    Layer    │   (patientService.getAll)
└──────┬──────┘
       │
┌──────▼──────┐
│     API     │ ← Backend endpoints
│  (Backend)  │   (http://api/patients)
└─────────────┘
```

**Key Principles:**

- Pages call **hooks** (`usePatients`, `useCreatePatient`)
- Hooks call **services** (`patientService.getAll()`)
- Services use **Axios** with auth interceptors
- Auth context provides global user state

---

## 📁 Critical Files & Directories

### Must-Read Before Any Work

| File                                       | Purpose                   | Why Critical                                                |
| ------------------------------------------ | ------------------------- | ----------------------------------------------------------- |
| **`DOCS/AI-CODING-STANDARDS.md`**          | **Coding conventions**    | **MANDATORY** - Ensures consistency across AI agents        |
| `DOCS/fe-specs/*.md`                       | Feature specifications    | **SOURCE OF TRUTH** for permissions, routes, business logic |
| `DOCS/fe-specs/ROLE-PERMISSIONS-MATRIX.md` | Role permission reference | Defines who can access what                                 |
| `hooks/use-auth.ts`                        | Auth hook & UserRole type | Central auth state, role definitions                        |
| `config/axios.ts`                          | HTTP client config        | Auth interceptors, base URL, error handling                 |
| `app/admin/layout.tsx`                     | Admin shell               | Nav menu with role-based visibility                         |
| `components/auth/RoleGuard.tsx`            | Route protection          | Enforces role-based access                                  |
| `package.json`                             | Dependencies              | Available libraries, scripts                                |

### Frequently Modified Files

**When adding a new feature:**

1. Create route in `app/[role]/[module]/`
2. Add service in `services/[module].service.ts`
3. Add React Query hooks in `hooks/queries/use[Module].ts`
4. Add TypeScript interfaces in `interfaces/[module].ts`
5. Update navigation in `app/admin/layout.tsx` (if admin feature)

---

## 🔐 Role-Based Access Control

### Role Definitions (from `hooks/use-auth.ts`)

```typescript
export type UserRole =
  | "ADMIN" // Full system access
  | "DOCTOR" // Clinical data + own schedules
  | "NURSE" // Patient vitals + assist doctors
  | "RECEPTIONIST" // Front desk: patients, appointments, billing
  | "PATIENT" // Own data only
  | "UNKNOWN"; // Unauthenticated
```

### Permission Matrix Summary

| Module            | ADMIN       | DOCTOR                | NURSE         | RECEPTIONIST             | PATIENT      |
| ----------------- | ----------- | --------------------- | ------------- | ------------------------ | ------------ |
| **Patients**      | Full CRUD   | View + Update         | View + Update | View + Register + Update | Own only     |
| **Appointments**  | Full CRUD   | View + Complete       | View          | Full CRUD                | Own only     |
| **Medical Exams** | View All    | Full CRUD             | Draft Vitals  | ❌ No Access             | Own Results  |
| **Billing**       | Full CRUD   | ❌ No Access          | ❌ No Access  | View + Record Payments   | Own Invoices |
| **HR Management** | Full CRUD   | View (for scheduling) | View          | View (read-only)         | ❌ No Access |
| **Reports**       | Full Access | Limited (own stats)   | ❌ No Access  | ❌ No Access             | ❌ No Access |
| **Medicines**     | Full CRUD   | ❌ No Access          | ❌ No Access  | ❌ No Access             | ❌ No Access |

### Implementing Role Checks

#### Pattern 1: Route-Level Protection (RoleGuard)

```tsx
// app/admin/layout.tsx
export default function AdminLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]}>
      {/* Admin content */}
    </RoleGuard>
  );
}
```

#### Pattern 2: Navigation Item Visibility

```typescript
// app/admin/layout.tsx
const allNavItems = [
  {
    title: "Patients",
    href: "/admin/patients",
    icon: NAV_ICONS.patients,
    roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"], // Who can see this
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: NAV_ICONS.reports,
    roles: ["ADMIN", "DOCTOR"], // Only admin and doctors
  },
];
```

#### Pattern 3: UI Element Visibility (Buttons, Actions)

```tsx
// Hide delete button from non-admins
import { useAuth } from "@/hooks/use-auth";

function PatientDetail() {
  const { user } = useAuth();

  return (
    <>
      {/* Everyone can see view button */}
      <Button onClick={handleView}>View</Button>

      {/* Only admin can see delete button */}
      {user?.role === "ADMIN" && (
        <Button onClick={handleDelete} variant="destructive">
          Delete
        </Button>
      )}

      {/* Multiple roles */}
      {["ADMIN", "RECEPTIONIST"].includes(user?.role) && (
        <Button onClick={handleEdit}>Edit</Button>
      )}
    </>
  );
}
```

#### Pattern 4: Service-Level Checks

```typescript
// services/patient.service.ts
export const deletePatient = async (id: string) => {
  // Optional frontend validation (backend always validates)
  const user = getCurrentUser();
  if (user?.role !== "ADMIN") {
    throw new Error("Only ADMIN can delete patients");
  }

  return axiosInstance.delete(`/patients/${id}`);
};
```

---

## ⚙️ Operational Workflows

### Workflow 1: Understanding a New Task

**Steps to take BEFORE writing any code:**

1. **Read the Specification**

   ```bash
   # Find relevant spec file
   grep -r "keyword" DOCS/fe-specs/
   # Read the full spec
   cat DOCS/fe-specs/fe-spec-[module]-service.md
   ```

2. **Check Role Permissions**

   ```bash
   # Consult the matrix
   cat DOCS/fe-specs/ROLE-PERMISSIONS-MATRIX.md
   ```

3. **Locate Existing Code**

   ```bash
   # Find related files
   find app -name "*[module]*"
   find services -name "*[module]*"
   ```

4. **Understand Data Models**

   ```bash
   # Check interfaces
   cat interfaces/[module].ts
   ```

5. **Review Similar Implementations**
   - Look at analogous features in other modules
   - Check `app/admin/patients/` as reference implementation

### Workflow 2: Adding a New Route

**Example: Add `/admin/appointments/[id]/edit` page**

```typescript
// Step 1: Create file structure
// File: app/admin/appointments/[id]/edit/page.tsx

import { RoleGuard } from "@/components/auth/RoleGuard";
import { AppointmentForm } from "../_components/appointment-form";

export default function EditAppointmentPage({ params }: { params: { id: string } }) {
  return (
    <RoleGuard allowedRoles={["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"]}>
      <div className="container py-6">
        <h1>Edit Appointment</h1>
        <AppointmentForm appointmentId={params.id} mode="edit" />
      </div>
    </RoleGuard>
  );
}

// Step 2: Update navigation (if needed)
// File: app/admin/layout.tsx
// Add to allNavItems array (already exists for appointments)

// Step 3: Ensure service method exists
// File: services/appointment.service.ts
export const updateAppointment = async (id: string, data: UpdateAppointmentDto) => {
  return axiosInstance.put(`/appointments/${id}`, data);
};

// Step 4: Create React Query hook
// File: hooks/queries/useAppointment.ts
export const useUpdateAppointment = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentDto }) =>
      appointmentService.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
};
```

### Workflow 3: Updating Role Permissions

**Scenario: Give NURSE access to a new feature**

```typescript
// 1. Update spec documentation
// File: DOCS/fe-specs/ROLE-PERMISSIONS-MATRIX.md
// Add NURSE to the relevant permission table

// 2. Update route protection
// File: app/admin/[module]/layout.tsx or page.tsx
<RoleGuard allowedRoles={["ADMIN", "DOCTOR", "NURSE"]}>

// 3. Update navigation visibility
// File: app/admin/layout.tsx
{
  title: "Module",
  href: "/admin/module",
  roles: ["ADMIN", "DOCTOR", "NURSE"], // Add NURSE here
}

// 4. Update UI element visibility
// File: app/admin/[module]/_components/component.tsx
{["ADMIN", "NURSE"].includes(user?.role) && (
  <Button>Action</Button>
)}

// 5. Test with NURSE account
// Create a test NURSE user and verify access
```

### Workflow 4: Debugging an Error

**Systematic approach:**

```bash
# 1. Reproduce the error
# - Note the exact user action
# - Note the user's role
# - Capture full error message

# 2. Check browser console
# - Look for network errors (401, 403, 500)
# - Look for JavaScript errors (line numbers)

# 3. Check backend logs (if accessible)
# - API endpoint being called
# - Request payload
# - Response status

# 4. Trace the code path
# Component → Hook → Service → API

# Example trace:
# app/admin/patients/[id]/page.tsx
#   → uses usePatient(id)
#     → hooks/queries/usePatient.ts
#       → calls patientService.getById(id)
#         → services/patient.service.ts
#           → axiosInstance.get(`/patients/${id}`)

# 5. Check for common issues
# - Missing RoleGuard?
# - Wrong role in allowedRoles array?
# - Service method not handling errors?
# - Axios interceptor issue?
```

### Workflow 5: Adding a New Component

**Best practices for component creation:**

```typescript
// Pattern 1: Use existing shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Pattern 2: Place feature components in _components folder
// File: app/admin/patients/_components/patient-stats-card.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Patient } from "@/interfaces/patient";

interface PatientStatsCardProps {
  patient: Patient;
  onViewDetails?: () => void;
}

export function PatientStatsCard({ patient, onViewDetails }: PatientStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{patient.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
        {onViewDetails && (
          <Button onClick={onViewDetails}>View Details</Button>
        )}
      </CardContent>
    </Card>
  );
}

// Pattern 3: Export from index if there are multiple components
// File: app/admin/patients/_components/index.ts
export { PatientStatsCard } from "./patient-stats-card";
export { PatientForm } from "./patient-form";
export { PatientList } from "./patient-list";
```

---

## 🔧 Code Modification Protocols

### Protocol 1: Safe Editing with Context

**ALWAYS include 3-5 lines of context before and after the change:**

```typescript
// ❌ BAD: No context
oldString: "roles: ['ADMIN']";
newString: "roles: ['ADMIN', 'RECEPTIONIST']";

// ✅ GOOD: Clear context
oldString: `
  {
    title: "Billing",
    href: "/admin/billing",
    icon: NAV_ICONS.billing,
    roles: ["ADMIN"],
  },
`;
newString: `
  {
    title: "Billing",
    href: "/admin/billing",
    icon: NAV_ICONS.billing,
    roles: ["ADMIN", "RECEPTIONIST"],
  },
`;
```

### Protocol 2: Batch Independent Changes

**Use multi_replace_string_in_file for multiple independent edits:**

```typescript
// When updating multiple nav items in layout.tsx
multi_replace_string_in_file({
  filePath: "app/admin/layout.tsx",
  replacements: [
    {
      // Change 1: Update Appointments
      oldString: `roles: ["ADMIN", "DOCTOR", "NURSE"],\n  },\n  {\n    title: "Examinations"`,
      newString: `roles: ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"],\n  },\n  {\n    title: "Examinations"`,
    },
    {
      // Change 2: Update Billing
      oldString: `roles: ["ADMIN"],\n  },\n  {\n    title: "Reports"`,
      newString: `roles: ["ADMIN", "RECEPTIONIST"],\n  },\n  {\n    title: "Reports"`,
    },
  ],
});
```

### Protocol 3: Type-Safe Changes

**Always respect TypeScript types:**

```typescript
// When adding a new interface property
// File: interfaces/patient.ts

// ✅ GOOD: Check existing type first
interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  // Adding new field with correct type
  emergencyContact?: {
    name: string;
    phone: string;
  };
}

// Then update all usages to match
// - Update API responses
// - Update form schemas
// - Update component props
```

### Protocol 4: Preserving Code Style

**Match existing patterns:**

```typescript
// Existing pattern analysis
// File: services/patient.service.ts

// Pattern observed:
export const getPatients = async (params?: PatientQueryParams) => {
  const response = await axiosInstance.get<ApiResponse<Patient[]>>(
    "/patients",
    { params },
  );
  return response.data;
};

// When adding new method, MATCH this pattern:
export const searchPatients = async (query: string) => {
  const response = await axiosInstance.get<ApiResponse<Patient[]>>(
    "/patients/search",
    {
      params: { q: query },
    },
  );
  return response.data;
};

// ❌ DON'T break pattern:
export async function searchPatients(query) {
  // Wrong: different syntax
  return axiosInstance.get("/patients/search?q=" + query); // Wrong: no types
}
```

---

## ✅ Testing & Validation

### Pre-Commit Checklist

Before considering a task complete:

```bash
# 1. Type check (if tsc script exists)
pnpm run type-check || npx tsc --noEmit

# 2. Lint check
pnpm lint

# 3. Build verification
pnpm build

# 4. Run affected E2E tests
pnpm test:e2e -- tests/e2e/[module]

# 5. Manual testing checklist
# - Test with each affected role
# - Test error cases (no permissions, network error)
# - Test edge cases (empty data, invalid input)
```

### Role-Based Testing Matrix

**For any feature change, test with ALL relevant roles:**

| Role                     | Test Scenarios                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------- |
| **ADMIN**                | - Can access feature<br>- Can perform all actions<br>- Can see all data                                 |
| **DOCTOR**               | - Can access if permitted<br>- Can perform allowed actions<br>- Cannot perform restricted actions       |
| **NURSE**                | - Can access if permitted<br>- Can perform allowed actions<br>- Cannot see admin-only features          |
| **RECEPTIONIST**         | - Can access patients/appointments/billing<br>- CANNOT access exams/reports<br>- CANNOT delete patients |
| **PATIENT**              | - Can only access own data<br>- Cannot see other patients' data                                         |
| **UNKNOWN** (logged out) | - Redirected to login<br>- Cannot access protected routes                                               |

### E2E Test Pattern

**Reference existing tests in `tests/e2e/`:**

```typescript
// tests/e2e/appointments.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Appointments - Admin Role", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@test.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
  });

  test("should display all appointments", async ({ page }) => {
    await page.goto("/admin/appointments");
    await expect(page.locator("h1")).toContainText("Appointments");
    // More assertions...
  });
});

test.describe("Appointments - Receptionist Role", () => {
  test.beforeEach(async ({ page }) => {
    // Login as receptionist
    await page.goto("/login");
    await page.fill('input[name="email"]', "receptionist@test.com");
    await page.fill('input[name="password"]', "password");
    await page.click('button[type="submit"]');
  });

  test("should create new appointment", async ({ page }) => {
    await page.goto("/admin/appointments/new");
    // Fill form and submit...
  });

  test("should NOT see delete button", async ({ page }) => {
    await page.goto("/admin/appointments/123");
    await expect(page.locator('button:has-text("Delete")')).not.toBeVisible();
  });
});
```

---

## 🎓 Common Tasks & Solutions

### Task 1: Add a new field to a form

**Complete workflow:**

```typescript
// 1. Update interface
// File: interfaces/patient.ts
export interface Patient {
  // ... existing fields
  bloodType?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
}

// 2. Update Zod schema
// File: lib/schemas/patient.schema.ts
import { z } from "zod";

export const patientSchema = z.object({
  // ... existing validations
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
});

// 3. Update form component
// File: app/admin/patients/_components/patient-form.tsx
<FormField
  control={form.control}
  name="bloodType"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Blood Type</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select blood type" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="A+">A+</SelectItem>
          <SelectItem value="A-">A-</SelectItem>
          {/* ... other options */}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

// 4. Update API service (if backend supports it)
// File: services/patient.service.ts
// No changes needed if using generic Patient type

// 5. Update spec documentation
// File: DOCS/fe-specs/fe-spec-patient-service.md
// Add bloodType to data models section
```

### Task 2: Hide a button based on role

**Pattern to follow:**

```tsx
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user } = useAuth();

  return (
    <div>
      {/* Method 1: Single role check */}
      {user?.role === "ADMIN" && <Button onClick={handleDelete}>Delete</Button>}

      {/* Method 2: Multiple roles */}
      {["ADMIN", "DOCTOR"].includes(user?.role) && (
        <Button onClick={handleApprove}>Approve</Button>
      )}

      {/* Method 3: Inverse check (everyone except...) */}
      {user?.role !== "PATIENT" && <Button onClick={handleEdit}>Edit</Button>}

      {/* Method 4: Complex logic */}
      {(user?.role === "ADMIN" || (user?.role === "DOCTOR" && isAssigned)) && (
        <Button onClick={handleComplete}>Complete</Button>
      )}
    </div>
  );
}
```

### Task 3: Fetch data with React Query

**Standard pattern:**

```typescript
// 1. Define service method
// File: services/appointment.service.ts
export const getAppointments = async (params?: AppointmentQueryParams) => {
  const response = await axiosInstance.get<ApiResponse<Appointment[]>>(
    "/appointments",
    { params }
  );
  return response.data;
};

// 2. Create React Query hook
// File: hooks/queries/useAppointment.ts
import { useQuery } from "@tanstack/react-query";
import { appointmentService } from "@/services/appointment.service";

export const useAppointments = (params?: AppointmentQueryParams) => {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: () => appointmentService.getAppointments(params),
  });
};

// 3. Use in component
// File: app/admin/appointments/page.tsx
import { useAppointments } from "@/hooks/queries/useAppointment";

export default function AppointmentsPage() {
  const { data: appointments, isLoading, error } = useAppointments();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {appointments?.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}
```

### Task 4: Handle form submission with mutations

**Standard pattern:**

```typescript
// 1. Create mutation hook
// File: hooks/queries/usePatient.ts
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientDto) =>
      patientService.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success("Patient created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create patient");
    },
  });
};

// 2. Use in form component
import { useCreatePatient } from "@/hooks/queries/usePatient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema } from "@/lib/schemas/patient.schema";

export function PatientForm() {
  const createPatient = useCreatePatient();
  const form = useForm({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = (data: z.infer<typeof patientSchema>) => {
    createPatient.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
        <Button type="submit" disabled={createPatient.isPending}>
          {createPatient.isPending ? "Creating..." : "Create Patient"}
        </Button>
      </form>
    </Form>
  );
}
```

### Task 5: Add a new navigation item

**Complete workflow:**

```typescript
// File: app/admin/layout.tsx

// 1. Import icon (if new)
import { Stethoscope } from "lucide-react";

// 2. Add to NAV_ICONS (if new icon)
const NAV_ICONS = {
  // ... existing icons
  newModule: Stethoscope,
};

// 3. Add to allNavItems array
const allNavItems = [
  // ... existing items
  {
    title: "New Module",
    href: "/admin/new-module",
    icon: NAV_ICONS.newModule,
    roles: ["ADMIN", "DOCTOR"], // Specify who can see this
  },
];

// 4. Create the actual page
// File: app/admin/new-module/page.tsx
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function NewModulePage() {
  return (
    <RoleGuard allowedRoles={["ADMIN", "DOCTOR"]}>
      <div className="container py-6">
        <h1>New Module</h1>
        {/* Module content */}
      </div>
    </RoleGuard>
  );
}

// 5. Update spec documentation
// File: DOCS/fe-specs/ROLE-PERMISSIONS-MATRIX.md
// Add new module to permission table
```

---

## 🚨 Error Handling Patterns

### Pattern 1: API Error Handling

**Axios interceptor handles most errors globally:**

```typescript
// File: config/axios.ts
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = "/login";
    }
    if (error.response?.status === 403) {
      // Show permission denied
      toast.error("You don't have permission to perform this action");
    }
    return Promise.reject(error);
  },
);
```

**Component-level error handling:**

```typescript
// For queries
const { data, error, isError } = usePatients();

if (isError) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error.message || "Failed to load patients"}
      </AlertDescription>
    </Alert>
  );
}

// For mutations
const createPatient = useCreatePatient();

const onSubmit = async (data) => {
  try {
    await createPatient.mutateAsync(data);
    router.push("/admin/patients");
  } catch (error: any) {
    // Error already shown by mutation onError
    console.error("Submit error:", error);
  }
};
```

### Pattern 2: Permission Errors

**Show graceful messages instead of throwing:**

```tsx
// ❌ BAD: Crashes the app
if (user?.role !== "ADMIN") {
  throw new Error("Permission denied");
}

// ✅ GOOD: Show message and hide feature
if (user?.role !== "ADMIN") {
  return (
    <Alert variant="warning">
      <AlertTitle>Permission Required</AlertTitle>
      <AlertDescription>
        You need administrator privileges to access this feature.
      </AlertDescription>
    </Alert>
  );
}

// ✅ BETTER: Use RoleGuard component
<RoleGuard
  allowedRoles={["ADMIN"]}
  fallback={
    <Alert variant="warning">
      <AlertTitle>Access Denied</AlertTitle>
      <AlertDescription>
        This page is only accessible to administrators.
      </AlertDescription>
    </Alert>
  }
>
  {/* Protected content */}
</RoleGuard>;
```

### Pattern 3: Form Validation Errors

**Use react-hook-form with Zod:**

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  age: z.number().min(0, "Age must be positive").max(150, "Age too high"),
});

const form = useForm({
  resolver: zodResolver(formSchema),
});

// Errors automatically shown via FormMessage component
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage /> {/* Shows validation error */}
    </FormItem>
  )}
/>;
```

---

## ✅ Do's and Don'ts

### ✅ DO's

1. **DO read specifications first**
   - Every feature has a spec in `DOCS/fe-specs/`
   - Specs define permissions, routes, and business logic
   - Specs are the source of truth

2. **DO check role permissions**
   - Use `ROLE-PERMISSIONS-MATRIX.md` as reference
   - Verify who can access before implementing
   - Test with multiple roles

3. **DO use existing patterns**
   - Look at similar implemented features
   - Match code style and structure
   - Reuse components from `components/ui/`

4. **DO provide context in edits**
   - Include 3-5 lines before and after changes
   - Ensure changes are unambiguous
   - Use multi_replace for batch changes

5. **DO validate before submitting**
   - Run linter and type checker
   - Build the project
   - Test with affected roles

6. **DO update documentation**
   - Update specs when changing features
   - Update comments in complex logic
   - Update permission matrix if roles change

7. **DO use TypeScript properly**
   - Define interfaces for all data structures
   - Use type inference where possible
   - Avoid `any` type

8. **DO handle errors gracefully**
   - Show user-friendly messages
   - Log errors for debugging
   - Don't crash the app

### ❌ DON'Ts

1. **DON'T bypass role checks**
   - Never remove RoleGuard for convenience
   - Never hardcode admin access
   - Always verify permissions

2. **DON'T modify core files without understanding**
   - `config/axios.ts` - auth interceptor
   - `hooks/use-auth.ts` - auth context
   - `components/auth/RoleGuard.tsx` - access control
   - These are critical infrastructure

3. **DON'T break existing patterns**
   - Don't mix arrow functions and function declarations
   - Don't use different import styles
   - Don't change naming conventions

4. **DON'T skip validation**
   - Don't assume input is correct
   - Don't skip type checking
   - Don't skip testing

5. **DON'T create duplicate code**
   - Reuse existing components
   - Extract common logic to hooks
   - Use utility functions from `lib/utils.ts`

6. **DON'T ignore errors**
   - Don't use empty catch blocks
   - Don't suppress TypeScript errors
   - Don't ignore lint warnings

7. **DON'T hardcode values**
   - Use constants from `config/`
   - Use environment variables for API URLs
   - Use theme tokens for styles

8. **DON'T modify package.json without reason**
   - Don't add unnecessary dependencies
   - Don't update major versions without testing
   - Use pnpm, not npm or yarn

---

## 📚 Reference Quick Links

### Internal Documentation

- `/DOCS/fe-specs/` - Feature specifications
- `/DOCS/fe-specs/ROLE-PERMISSIONS-MATRIX.md` - Role permissions
- `/DOCS/api-contracts-complete.md` - API documentation
- `/DOCS/data-models-complete.md` - Data structure definitions
- `/DOCS/design_guidelines.md` - UI/UX guidelines

### Key Code Files

- `/hooks/use-auth.ts` - Auth hook & UserRole type
- `/config/axios.ts` - HTTP client configuration
- `/components/auth/RoleGuard.tsx` - Route protection
- `/app/admin/layout.tsx` - Admin navigation
- `/lib/utils.ts` - Utility functions

### External Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🎯 Decision Trees

### "Where should I add this code?"

```
New feature?
├─ Is it a page/route?
│  └─ Create in app/[role]/[module]/page.tsx
├─ Is it a reusable UI component?
│  ├─ Generic (button, card)?
│  │  └─ Use existing from components/ui/
│  └─ Feature-specific?
│     └─ Create in app/[module]/_components/
├─ Is it API logic?
│  └─ Create in services/[module].service.ts
├─ Is it a React Query hook?
│  └─ Create in hooks/queries/use[Module].ts
├─ Is it a type definition?
│  └─ Create in interfaces/[module].ts
└─ Is it a utility function?
   └─ Add to lib/utils.ts or create new file
```

### "Can this role access this feature?"

```
Check ROLE-PERMISSIONS-MATRIX.md
├─ Feature listed?
│  ├─ Yes: Follow the matrix
│  └─ No: Ask for clarification
├─ Multiple roles allowed?
│  └─ Add all to RoleGuard allowedRoles array
├─ Role-specific actions?
│  └─ Use conditional rendering with user?.role check
└─ Unsure?
   └─ Default to most restrictive (ADMIN only)
```

### "How do I debug this error?"

```
Error type?
├─ TypeScript error?
│  ├─ Check interface definitions
│  ├─ Verify import paths
│  └─ Run: npx tsc --noEmit
├─ Runtime error?
│  ├─ Check browser console
│  ├─ Check network tab for API errors
│  └─ Add console.log for debugging
├─ Permission error (403)?
│  ├─ Check user role
│  ├─ Check RoleGuard allowedRoles
│  └─ Verify backend permissions
├─ API error (401)?
│  ├─ Check auth token in cookies
│  ├─ Check axios interceptor
│  └─ Try re-login
└─ Build error?
   ├─ Check syntax errors
   ├─ Check missing imports
   └─ Run: pnpm build
```

---

## 🔄 Version History

| Version | Date        | Changes                             |
| ------- | ----------- | ----------------------------------- |
| 1.0     | Dec 6, 2025 | Initial comprehensive guide created |

---

## 📞 Getting Help

When you're stuck:

1. **Check the specs** - `DOCS/fe-specs/`
2. **Search existing code** - Find similar implementations
3. **Check this guide** - Review relevant sections
4. **Look at tests** - `tests/e2e/` for examples
5. **Ask for clarification** - Better to ask than implement incorrectly

---

**Remember:** You are maintaining a healthcare system. Precision, security, and reliability are paramount. When in doubt, ask for clarification rather than making assumptions.

**Good luck, AI agent! 🤖**
