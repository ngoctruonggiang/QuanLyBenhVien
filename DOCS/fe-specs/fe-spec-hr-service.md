# HR Service - Frontend Specification

**Project:** Hospital Management System  
**Service:** HR Service (Employee & Department Management)  
**Version:** 1.1  
**Last Updated:** December 6, 2025  
**Target Users:** ADMIN (full access), DOCTOR/NURSE/RECEPTIONIST (view for booking), All authenticated users (limited view)

---

## 1. Overview & Screen Inventory

### 1.1 Service Scope

The HR Service manages hospital staff (doctors, nurses, receptionists, admin) and their work schedules. It provides:

- Department management (create, edit, list, deactivate)
- Employee management (create, edit, list, soft delete)
- Work schedule management (create, edit, view availability)
- Doctor availability for appointment booking

### 1.2 Related Backend

| Item          | Value                                            |
| ------------- | ------------------------------------------------ |
| **Service**   | hr-service                                       |
| **Port**      | 8084                                             |
| **Base Path** | `/api/hr`                                        |
| **Database**  | `hr_db`                                          |
| **Tables**    | `departments`, `employees`, `employee_schedules` |

### 1.3 Screen Inventory

| Route                            | Screen Name       | Component              | Access        | Priority |
| -------------------------------- | ----------------- | ---------------------- | ------------- | -------- |
| `/admin/hr/departments`          | Department List   | `DepartmentListPage`   | ADMIN         | P0       |
| `/admin/hr/departments/new`      | Create Department | `DepartmentFormPage`   | ADMIN         | P0       |
| `/admin/hr/departments/:id`      | Department Detail | `DepartmentDetailPage` | Authenticated | P1       |
| `/admin/hr/departments/:id/edit` | Edit Department   | `DepartmentFormPage`   | ADMIN         | P0       |
| `/admin/hr/employees`            | Employee List     | `EmployeeListPage`     | ADMIN         | P0       |
| `/admin/hr/employees/new`        | Create Employee   | `EmployeeFormPage`     | ADMIN         | P0       |
| `/admin/hr/employees/:id`        | Employee Detail   | `EmployeeDetailPage`   | Authenticated | P1       |
| `/admin/hr/employees/:id/edit`   | Edit Employee     | `EmployeeFormPage`     | ADMIN         | P0       |
| `/admin/hr/schedules`            | Schedule Calendar | `ScheduleCalendarPage` | ADMIN         | P0       |
| `/admin/hr/schedules/new`        | Create Schedule   | `ScheduleFormModal`    | ADMIN         | P0       |
| `/doctor/schedules`              | My Schedules      | `MySchedulesPage`      | DOCTOR, NURSE | P1       |

### 1.4 Screen Hierarchy Diagram

```
/admin/hr
├── /departments
│   ├── (list view with DataTable)
│   ├── /new (form - reuses DepartmentFormPage)
│   ├── /:id (detail view)
│   └── /:id/edit (form - reuses DepartmentFormPage)
├── /employees
│   ├── (list view with DataTable)
│   ├── /new (form - reuses EmployeeFormPage)
│   ├── /:id (detail view)
│   └── /:id/edit (form - reuses EmployeeFormPage)
└── /schedules
    ├── (calendar view)
    └── /new (modal form)

/doctor
└── /schedules (personal schedule view)
```

---

## 2. User Flows & Acceptance Criteria

### 2.1 Flow: Manage Departments

#### 2.1.1 View Department List

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN navigates to /admin/hr/departments                    │
│                          ↓                                  │
│ System loads department list with pagination                │
│                          ↓                                  │
│ ADMIN can: Search, Filter by status, Sort columns           │
│                          ↓                                  │
│ ADMIN clicks row → Navigate to detail OR                    │
│ ADMIN clicks "Edit" → Navigate to edit form OR              │
│ ADMIN clicks "Add Department" → Navigate to create form     │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Page loads within 2 seconds
- [ ] Table displays: Name, Location, Status, Head Doctor, Actions
- [ ] Search filters by department name (debounced 300ms)
- [ ] Status filter: All, Active, Inactive
- [ ] Pagination: 10, 20, 50 items per page
- [ ] Sort by: Name (default), Status, Created Date
- [ ] Empty state shown when no departments exist
- [ ] Loading skeleton shown while fetching data

---

#### 2.1.2 Create Department

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN clicks "Add Department" button                        │
│                          ↓                                  │
│ Navigate to /admin/hr/departments/new                       │
│                          ↓                                  │
│ ADMIN fills form: Name*, Description, Location, Phone, Status│
│                          ↓                                  │
│ ADMIN clicks "Save"                                         │
│         ↓                              ↓                    │
│   [Validation Pass]            [Validation Fail]            │
│         ↓                              ↓                    │
│   POST /api/hr/departments      Show field errors           │
│         ↓                                                   │
│   ┌─────────┐    ┌──────────────┐                          │
│   │ Success │    │    Error     │                          │
│   └────┬────┘    └──────┬───────┘                          │
│        ↓                ↓                                   │
│   Toast "Created"   Toast error message                     │
│   Redirect to list  Stay on form                            │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Form validates on blur and on submit
- [ ] Name field is required (red asterisk indicator)
- [ ] Success: Show toast "Department created successfully", redirect to list
- [ ] Error 409 (duplicate name): Show "Department name already exists" under name field
- [ ] Network error: Show toast "Failed to create department. Please try again."
- [ ] "Cancel" button returns to list without saving

---

#### 2.1.3 Edit Department

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN clicks "Edit" on department row                       │
│                          ↓                                  │
│ Navigate to /admin/hr/departments/:id/edit                  │
│                          ↓                                  │
│ System fetches department data (GET /api/hr/departments/{id})│
│         ↓                              ↓                    │
│   [Found]                        [Not Found]                │
│      ↓                                ↓                     │
│   Pre-fill form                  Show 404 page              │
│      ↓                                                      │
│ ADMIN modifies fields and clicks "Save"                     │
│      ↓                                                      │
│ PATCH /api/hr/departments/{id}                              │
│      ↓                                                      │
│ Same success/error handling as Create                       │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Form pre-fills with existing data
- [ ] Head Doctor dropdown shows only ACTIVE doctors
- [ ] Unchanged fields are not sent in PATCH request
- [ ] Success: Toast "Department updated successfully", redirect to list
- [ ] 404: Show "Department not found" page with "Back to list" link

---

#### 2.1.4 Delete Department

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN clicks "Delete" on department row                     │
│                          ↓                                  │
│ Show confirmation dialog:                                   │
│ "Delete department [Name]? This cannot be undone."          │
│         ↓                              ↓                    │
│   [Confirm]                        [Cancel]                 │
│      ↓                                ↓                     │
│ DELETE /api/hr/departments/{id}   Close dialog              │
│      ↓                                                      │
│ ┌─────────┐    ┌─────────────────────┐                     │
│ │ Success │    │ Error 409           │                     │
│ └────┬────┘    │ (has employees)     │                     │
│      ↓         └──────────┬──────────┘                     │
│ Toast "Deleted"           ↓                                 │
│ Remove from list    Toast "Cannot delete department with    │
│                     assigned employees"                     │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Confirmation dialog before delete
- [ ] Success: Toast "Department deleted", remove row from table
- [ ] Error 409: Toast explaining why deletion failed
- [ ] Alternative: Suggest setting status to INACTIVE

---

### 2.2 Flow: Manage Employees

#### 2.2.1 View Employee List

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN navigates to /admin/hr/employees                      │
│                          ↓                                  │
│ System loads employee list with filters                     │
│                          ↓                                  │
│ ADMIN can:                                                  │
│   - Search by name, email, license number                   │
│   - Filter by: Department, Role, Status                     │
│   - Sort by: Name, Role, Department, Hire Date              │
│                          ↓                                  │
│ ADMIN clicks row → Detail OR Edit OR Delete                 │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Table columns: Name, Role, Department, Email, Phone, Status, Actions
- [ ] Role filter: All, Doctor, Nurse, Receptionist, Admin
- [ ] Department filter: Dropdown of all departments
- [ ] Status filter: All, Active, On Leave, Resigned
- [ ] Search is case-insensitive, debounced 300ms
- [ ] Role badge colors: Doctor (blue), Nurse (green), Receptionist (purple), Admin (red)
- [ ] Status badge colors: Active (green), On Leave (yellow), Resigned (gray)

---

#### 2

.2.2 Create Employee

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN clicks "Add Employee"                                 │
│                          ↓                                  │
│ Navigate to /admin/hr/employees/new                         │
│                          ↓                                  │
│ Form sections:                                              │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 1. Basic Information                                    ││
│ │    Full Name*, Email*, Phone, Address                   ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ 2. Employment Details                                   ││
│ │    Role*, Department* (if Doctor/Nurse),                ││
│ │    Specialization, License Number* (if Doctor/Nurse),   ││
│ │    Status, Hire Date                                    ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ 3. Account Linking (Optional)                           ││
│ │    Account ID (dropdown of unlinked accounts)           ││
│ └─────────────────────────────────────────────────────────┘│
│                          ↓                                  │
│ POST /api/hr/employees                                      │
│                          ↓                                  │
│ Handle success/validation/conflict errors                   │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Form has 3 collapsible sections
- [ ] Role change dynamically shows/hides Department and License fields
- [ ] Department dropdown only shows ACTIVE departments
- [ ] License Number required when Role = DOCTOR or NURSE
- [ ] Department required when Role = DOCTOR or NURSE
- [ ] Email validation: valid email format
- [ ] Phone validation: 10-15 digits
- [ ] Error 409 (license exists): Show "License number already in use"
- [ ] Success: Toast + redirect to employee list

---

#### 2.2.3 Edit Employee

Same flow as Create, with additional considerations:

**Acceptance Criteria:**

- [ ] Cannot change Role if employee has future appointments (show warning)
- [ ] Cannot change Department if employee has future appointments in current dept
- [ ] Show "Last updated by [user] at [date]" at bottom

---

#### 2.2.4 Delete Employee (Soft Delete)

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN clicks "Delete" on employee row                       │
│                          ↓                                  │
│ System checks for future appointments                       │
│         ↓                              ↓                    │
│ [Has appointments]            [No appointments]             │
│      ↓                              ↓                       │
│ Show warning:               Show confirmation:              │
│ "Employee has X future      "Delete employee [Name]?"       │
│  appointments. Cancel                                       │
│  them first."                      ↓                        │
│                             DELETE /api/hr/employees/{id}   │
│                                    ↓                        │
│                             Toast "Employee deleted"        │
│                             Remove from list                │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Soft delete only (preserves audit trail)
- [ ] Error 409: Show appointment count and suggest cancelling them first
- [ ] Deleted employees hidden from list (backend filters deleted_at IS NULL)

---

### 2.3 Flow: Manage Schedules

#### 2.3.1 View Schedule Calendar

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN navigates to /admin/hr/schedules                      │
│                          ↓                                  │
│ Calendar view (week or month view)                          │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Filters: Department, Employee, Date Range               ││
│ ├─────────────────────────────────────────────────────────┤│
│ │     Mon 12/2   Tue 12/3   Wed 12/4   Thu 12/5   Fri    ││
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        ││
│ │ │Dr. Hung │ │Dr. Hung │ │ (empty) │ │Dr. Hung │        ││
│ │ │08-12,   │ │08-17    │ │         │ │13-17    │        ││
│ │ │13-17    │ │BOOKED   │ │         │ │AVAILABLE│        ││
│ │ │AVAILABLE│ │         │ │         │ │         │        ││
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘        ││
│ └─────────────────────────────────────────────────────────┘│
│                          ↓                                  │
│ Click on cell → Open Schedule Form Modal                    │
│ Click on schedule → Edit/Delete options                     │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Default view: Current week
- [ ] Week/Month toggle
- [ ] Filter by department (shows all employees in dept)
- [ ] Filter by specific employee
- [ ] Color coding: Available (green), Booked (blue), Cancelled (gray)
- [ ] Click empty cell: Opens "Create Schedule" modal with date pre-filled
- [ ] Click schedule: Opens popover with Edit/Delete options
- [ ] Drag-and-drop to move schedule (stretch goal)

---

#### 2.3.2 Create Schedule

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN clicks on empty calendar cell or "Add Schedule"       │
│                          ↓                                  │
│ Open ScheduleFormModal                                      │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Employee*:    [Dropdown - all employees]                ││
│ │ Work Date*:   [Date picker - pre-filled if clicked cell]││
│ │ Start Time*:  [Time picker - 08:00]                     ││
│ │ End Time*:    [Time picker - 17:00]                     ││
│ │ Status:       [AVAILABLE / CANCELLED]                   ││
│ │ Notes:        [Textarea]                                ││
│ │                                                         ││
│ │ [Cancel]                              [Save Schedule]   ││
│ └─────────────────────────────────────────────────────────┘│
│                          ↓                                  │
│ POST /api/hr/schedules                                      │
│                          ↓                                  │
│ Success → Close modal, refresh calendar                     │
│ Error 409 → "Schedule already exists for this date"         │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Work Date cannot be in the past
- [ ] Start Time must be before End Time
- [ ] Time picker in 30-minute increments
- [ ] Employee dropdown grouped by department
- [ ] Error 409 (duplicate): "Employee already has a schedule for this date"
- [ ] Success: Close modal, add schedule to calendar with animation

---

#### 2.3.3 View My Schedules (Doctor/Nurse)

```
┌─────────────────────────────────────────────────────────────┐
│ DOCTOR navigates to /doctor/schedules                       │
│                          ↓                                  │
│ GET /api/hr/schedules/me?startDate=...&endDate=...         │
│                          ↓                                  │
│ Display personal schedule in calendar or list view          │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ This Week's Schedule                                    ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Mon Dec 2:  08:00 - 12:00 (AVAILABLE)                   ││
│ │             13:00 - 17:00 (BOOKED - 4 appointments)     ││
│ │ Tue Dec 3:  08:00 - 17:00 (AVAILABLE)                   ││
│ │ Wed Dec 4:  No schedule                                 ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ (Read-only - doctors cannot modify their own schedules)     │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Read-only view (no edit/delete buttons)
- [ ] Shows next 2 weeks by default
- [ ] Date range picker to view historical schedules
- [ ] BOOKED status shows appointment count
- [ ] Click BOOKED → Navigate to appointment list filtered by doctor+date

---

## 3. Screen Specifications

### 3.1 Department List Page

**Route:** `/admin/hr/departments`  
**Component:** `DepartmentListPage`

#### 3.1.1 Fields & Data Table Columns

| Column      | Field                 | Type    | Sortable | Filterable  |
| ----------- | --------------------- | ------- | -------- | ----------- |
| Name        | `name`                | string  | ✅       | ✅ (search) |
| Description | `description`         | string  | ❌       | ❌          |
| Location    | `location`            | string  | ❌       | ❌          |
| Phone       | `phoneExtension`      | string  | ❌       | ❌          |
| Status      | `status`              | badge   | ✅       | ✅ (select) |
| Head Doctor | `headDoctor.fullName` | string  | ❌       | ❌          |
| Actions     | -                     | buttons | ❌       | ❌          |

#### 3.1.2 Component Hierarchy

```
DepartmentListPage
├── PageHeader
│   ├── Title ("Departments")
│   └── Button ("Add Department") → navigates to /new
├── FilterBar
│   ├── SearchInput (name search)
│   └── StatusSelect (All, Active, Inactive)
├── DataTable
│   ├── TableHeader (sortable columns)
│   ├── TableBody
│   │   └── TableRow (for each department)
│   │       ├── NameCell
│   │       ├── LocationCell
│   │       ├── StatusBadge
│   │       ├── HeadDoctorCell
│   │       └── ActionButtons (View, Edit, Delete)
│   └── TablePagination
├── DeleteConfirmDialog
└── EmptyState (when no data)
```

#### 3.1.3 Local State

```typescript
interface DepartmentListState {
  // Filter state
  searchQuery: string;
  statusFilter: "ALL" | "ACTIVE" | "INACTIVE";

  // Pagination state
  page: number;
  pageSize: number;
  sortField: string;
  sortDirection: "asc" | "desc";

  // UI state
  deleteDialogOpen: boolean;
  departmentToDelete: Department | null;
}
```

#### 3.1.4 Role-Based Visibility

| Element       | ADMIN | DOCTOR         | NURSE          | PATIENT |
| ------------- | ----- | -------------- | -------------- | ------- |
| Page Access   | ✅    | ✅ (read-only) | ✅ (read-only) | ❌      |
| Add Button    | ✅    | ❌             | ❌             | ❌      |
| Edit Button   | ✅    | ❌             | ❌             | ❌      |
| Delete Button | ✅    | ❌             | ❌             | ❌      |

---

### 3.2 Department Form Page

**Route:** `/admin/hr/departments/new` or `/admin/hr/departments/:id/edit`  
**Component:** `DepartmentFormPage`

#### 3.2.1 Fields Specification

| Field            | Label           | Type     | Required | Validation            | Error Message                                                                                              |
| ---------------- | --------------- | -------- | -------- | --------------------- | ---------------------------------------------------------------------------------------------------------- |
| `name`           | Department Name | text     | ✅       | max 255 chars, unique | "Department name is required" / "Name must be less than 255 characters" / "Department name already exists" |
| `description`    | Description     | textarea | ❌       | max 1000 chars        | "Description must be less than 1000 characters"                                                            |
| `location`       | Location        | text     | ❌       | max 255 chars         | "Location must be less than 255 characters"                                                                |
| `phoneExtension` | Phone Extension | text     | ❌       | numeric, max 20 chars | "Phone extension must be numeric"                                                                          |
| `status`         | Status          | select   | ✅       | enum                  | "Status is required"                                                                                       |
| `headDoctorId`   | Head Doctor     | select   | ❌       | valid doctor ID       | "Selected doctor not found"                                                                                |

#### 3.2.2 Component Hierarchy

```
DepartmentFormPage
├── PageHeader
│   ├── BackButton → navigates to list
│   └── Title ("Create Department" or "Edit Department")
├── Form
│   ├── FormField (name) - TextInput
│   ├── FormField (description) - Textarea
│   ├── FormField (location) - TextInput
│   ├── FormField (phoneExtension) - TextInput
│   ├── FormField (status) - Select
│   │   └── Options: ACTIVE, INACTIVE
│   ├── FormField (headDoctorId) - SearchableSelect
│   │   └── Options: Active doctors from GET /api/hr/doctors
│   └── FormActions
│       ├── CancelButton
│       └── SubmitButton ("Save" or "Create")
└── UnsavedChangesDialog
```

#### 3.2.3 Field Conditional Logic

| Condition             | Field Affected | Behavior                                                           |
| --------------------- | -------------- | ------------------------------------------------------------------ |
| Edit mode             | `name`         | Pre-filled, still editable                                         |
| Status = INACTIVE     | -              | Show warning: "Inactive departments won't accept new appointments" |
| headDoctorId selected | -              | Show doctor's department info                                      |

#### 3.2.4 Form State

```typescript
interface DepartmentFormState {
  // Form values
  values: {
    name: string;
    description: string;
    location: string;
    phoneExtension: string;
    status: "ACTIVE" | "INACTIVE";
    headDoctorId: string | null;
  };

  // Validation errors (field-level)
  errors: Record<string, string>;

  // Form state
  isDirty: boolean;
  isSubmitting: boolean;

  // For edit mode
  isLoading: boolean;
  originalValues: DepartmentFormState["values"] | null;
}
```

---

### 3.3 Employee List Page

**Route:** `/admin/hr/employees`  
**Component:** `EmployeeListPage`

#### 3.3.1 Fields & Data Table Columns

| Column         | Field             | Type    | Sortable | Filterable  |
| -------------- | ----------------- | ------- | -------- | ----------- |
| Name           | `fullName`        | string  | ✅       | ✅ (search) |
| Role           | `role`            | badge   | ✅       | ✅ (select) |
| Department     | `department.name` | string  | ✅       | ✅ (select) |
| Specialization | `specialization`  | string  | ❌       | ❌          |
| Email          | `email`           | string  | ❌       | ✅ (search) |
| Phone          | `phoneNumber`     | string  | ❌       | ❌          |
| Status         | `status`          | badge   | ✅       | ✅ (select) |
| Actions        | -                 | buttons | ❌       | ❌          |

#### 3.3.2 Badge Color Mapping

**Role Badges:**

```typescript
const roleBadgeColors = {
  DOCTOR: "blue",
  NURSE: "green",
  RECEPTIONIST: "purple",
  ADMIN: "red",
};
```

**Status Badges:**

```typescript
const statusBadgeColors = {
  ACTIVE: "green",
  ON_LEAVE: "yellow",
  RESIGNED: "gray",
};
```

#### 3.3.3 Component Hierarchy

```
EmployeeListPage
├── PageHeader
│   ├── Title ("Employees")
│   └── Button ("Add Employee")
├── FilterBar
│   ├── SearchInput (name, email, license search)
│   ├── RoleSelect (All, Doctor, Nurse, Receptionist, Admin)
│   ├── DepartmentSelect (All + department list)
│   └── StatusSelect (All, Active, On Leave, Resigned)
├── DataTable
│   └── ... (similar to DepartmentList)
├── DeleteConfirmDialog
└── EmptyState
```

---

### 3.4 Employee Form Page

**Route:** `/admin/hr/employees/new` or `/admin/hr/employees/:id/edit`  
**Component:** `EmployeeFormPage`

#### 3.4.1 Fields Specification

**Section 1: Basic Information**

| Field         | Label        | Type     | Required | Validation         | Error Message                        |
| ------------- | ------------ | -------- | -------- | ------------------ | ------------------------------------ |
| `fullName`    | Full Name    | text     | ✅       | max 255 chars      | "Full name is required"              |
| `email`       | Email        | email    | ✅       | valid email format | "Please enter a valid email address" |
| `phoneNumber` | Phone Number | tel      | ❌       | 10-15 digits       | "Phone number must be 10-15 digits"  |
| `address`     | Address      | textarea | ❌       | max 500 chars      | -                                    |

**Section 2: Employment Details**

| Field            | Label          | Type   | Required      | Validation               | Error Message                                                                   |
| ---------------- | -------------- | ------ | ------------- | ------------------------ | ------------------------------------------------------------------------------- |
| `role`           | Role           | select | ✅            | enum                     | "Role is required"                                                              |
| `departmentId`   | Department     | select | Conditional\* | valid dept ID            | "Department is required for Doctor/Nurse"                                       |
| `specialization` | Specialization | text   | ❌            | max 100 chars            | -                                                                               |
| `licenseNumber`  | License Number | text   | Conditional\* | format: XX-12345, unique | "License number is required for Doctor/Nurse" / "License number already in use" |
| `status`         | Status         | select | ✅            | enum                     | "Status is required"                                                            |
| `hiredAt`        | Hire Date      | date   | ❌            | valid date, not future   | "Hire date cannot be in the future"                                             |

\*Conditional: Required when Role = DOCTOR or NURSE

**Section 3: Account Linking (Optional)**

| Field       | Label           | Type              | Required | Validation       | Error Message       |
| ----------- | --------------- | ----------------- | -------- | ---------------- | ------------------- |
| `accountId` | Link to Account | searchable-select | ❌       | valid account ID | "Account not found" |

#### 3.4.2 Field Conditional Logic

| Condition                           | Fields Affected                 | Behavior                            |
| ----------------------------------- | ------------------------------- | ----------------------------------- |
| Role = DOCTOR or NURSE              | `departmentId`, `licenseNumber` | Show as required (add red asterisk) |
| Role = RECEPTIONIST or ADMIN        | `departmentId`, `licenseNumber` | Show but optional                   |
| Role = DOCTOR                       | `specialization`                | Show prominently                    |
| Edit mode + has future appointments | `role`, `departmentId`          | Show warning before change          |

#### 3.4.3 Component Hierarchy

```
EmployeeFormPage
├── PageHeader
│   ├── BackButton
│   └── Title
├── Form
│   ├── Accordion/Collapsible Section: "Basic Information"
│   │   ├── FormField (fullName)
│   │   ├── FormField (email)
│   │   ├── FormField (phoneNumber)
│   │   └── FormField (address)
│   ├── Accordion/Collapsible Section: "Employment Details"
│   │   ├── FormField (role) - Select
│   │   ├── FormField (departmentId) - SearchableSelect
│   │   ├── FormField (specialization) - TextInput
│   │   ├── FormField (licenseNumber) - TextInput
│   │   ├── FormField (status) - Select
│   │   └── FormField (hiredAt) - DatePicker
│   ├── Accordion/Collapsible Section: "Account Linking"
│   │   └── FormField (accountId) - SearchableSelect
│   └── FormActions
├── UnsavedChangesDialog
└── FutureAppointmentsWarningDialog (edit mode only)
```

---

### 3.5 Schedule Calendar Page

**Route:** `/admin/hr/schedules`  
**Component:** `ScheduleCalendarPage`

#### 3.5.1 Component Hierarchy

```
ScheduleCalendarPage
├── PageHeader
│   ├── Title ("Work Schedules")
│   └── Button ("Add Schedule") → opens modal
├── CalendarToolbar
│   ├── ViewToggle (Week / Month)
│   ├── DateNavigation (< Today >)
│   ├── DepartmentFilter
│   └── EmployeeFilter
├── CalendarGrid
│   ├── CalendarHeader (day names)
│   └── CalendarBody
│       └── CalendarCell (for each day)
│           └── ScheduleCard (for each schedule)
│               ├── EmployeeName
│               ├── TimeRange
│               └── StatusBadge
├── ScheduleFormModal
└── ScheduleDetailPopover
```

#### 3.5.2 Schedule Card Display

```typescript
interface ScheduleCardProps {
  schedule: {
    id: string;
    employeeId: string;
    employeeName: string;
    workDate: string;
    startTime: string; // "08:00"
    endTime: string; // "17:00"
    status: "AVAILABLE" | "BOOKED" | "CANCELLED";
    notes?: string;
  };
  onClick: () => void;
}

// Display format: "08:00 - 17:00"
// Color based on status
```

#### 3.5.3 Schedule Form Modal Fields

| Field        | Label      | Type              | Required | Validation             |
| ------------ | ---------- | ----------------- | -------- | ---------------------- |
| `employeeId` | Employee   | searchable-select | ✅       | valid employee         |
| `workDate`   | Work Date  | date              | ✅       | not in past            |
| `startTime`  | Start Time | time-select       | ✅       | -                      |
| `endTime`    | End Time   | time-select       | ✅       | > startTime            |
| `status`     | Status     | select            | ✅       | AVAILABLE or CANCELLED |
| `notes`      | Notes      | textarea          | ❌       | max 1000 chars         |

**Time Options:** 30-minute increments from 00:00 to 23:30

---

### 3.6 My Schedules Page (Doctor View)

**Route:** `/doctor/schedules`  
**Component:** `MySchedulesPage`

#### 3.6.1 Component Hierarchy

```
MySchedulesPage
├── PageHeader
│   └── Title ("My Schedule")
├── DateRangePicker
│   └── Default: This week to 2 weeks ahead
├── ScheduleList
│   └── ScheduleGroup (grouped by date)
│       ├── DateHeader ("Monday, December 2, 2025")
│       └── ScheduleItem
│           ├── TimeRange ("08:00 - 12:00")
│           ├── StatusBadge
│           └── AppointmentCount (if BOOKED)
└── EmptyState ("No schedules for selected period")
```

---

## 4. API Integration & Data Mapping

### 4.1 Department APIs

#### 4.1.1 List Departments

| Property         | Value                                               |
| ---------------- | --------------------------------------------------- |
| **Endpoint**     | `GET /api/hr/departments`                           |
| **Used By**      | `DepartmentListPage`, `EmployeeFormPage` (dropdown) |
| **Query Params** | `page`, `size`, `sort`, `status`, `search`          |

**Request → UI Mapping:**

```typescript
// Query params from UI state
const params = {
  page: pagination.page,
  size: pagination.pageSize,
  sort: `${sort.field},${sort.direction}`,
  status: filters.status !== "ALL" ? filters.status : undefined,
  search: filters.search ? `name=like='*${filters.search}*'` : undefined,
};
```

**Response Handling:**

```typescript
// Success (200)
{
  status: 'success',
  data: {
    content: Department[],
    page: number,
    size: number,
    totalElements: number,
    totalPages: number
  }
}
// → Update table data + pagination state

// Error (401)
// → Redirect to login

// Error (Network)
// → Show error toast, allow retry
```

#### 4.1.2 Create Department

| Property     | Value                              |
| ------------ | ---------------------------------- |
| **Endpoint** | `POST /api/hr/departments`         |
| **Used By**  | `DepartmentFormPage` (create mode) |

**UI → Request Mapping:**

```typescript
// Form values to request body
const requestBody = {
  name: form.name.trim(),
  description: form.description?.trim() || undefined,
  location: form.location?.trim() || undefined,
  phoneExtension: form.phoneExtension?.trim() || undefined,
  status: form.status,
};
```

**Response Handling:**

```typescript
// Success (201)
// → Toast "Department created successfully"
// → Navigate to /admin/hr/departments

// Error (400) - Validation
{
  status: 'error',
  errors: [
    { field: 'name', message: 'Department name is required' }
  ]
}
// → Set field errors in form state

// Error (409) - Duplicate name
// → Set error on name field: "Department name already exists"
```

#### 4.1.3 Get Department

| Property     | Value                                                    |
| ------------ | -------------------------------------------------------- |
| **Endpoint** | `GET /api/hr/departments/{id}`                           |
| **Used By**  | `DepartmentFormPage` (edit mode), `DepartmentDetailPage` |

**Response Handling:**

```typescript
// Success (200)
// → Pre-fill form with data

// Error (404)
// → Show 404 page with "Back to list" link
```

#### 4.1.4 Update Department

| Property     | Value                            |
| ------------ | -------------------------------- |
| **Endpoint** | `PATCH /api/hr/departments/{id}` |
| **Used By**  | `DepartmentFormPage` (edit mode) |

**UI → Request Mapping:**

```typescript
// Only send changed fields
const changedFields = getChangedFields(originalValues, currentValues);
const requestBody = changedFields;
```

#### 4.1.5 Delete Department

| Property     | Value                             |
| ------------ | --------------------------------- |
| **Endpoint** | `DELETE /api/hr/departments/{id}` |
| **Used By**  | `DepartmentListPage`              |

**Response Handling:**

```typescript
// Success (204)
// → Toast "Department deleted"
// → Remove row from table

// Error (409)
// → Toast "Cannot delete department with assigned employees"
```

---

### 4.2 Employee APIs

#### 4.2.1 List Employees

| Property         | Value                                                              |
| ---------------- | ------------------------------------------------------------------ |
| **Endpoint**     | `GET /api/hr/employees`                                            |
| **Used By**      | `EmployeeListPage`, `ScheduleFormModal` (dropdown)                 |
| **Query Params** | `page`, `size`, `sort`, `departmentId`, `role`, `status`, `search` |

**RSQL Search Examples:**

```typescript
// Build RSQL from filters
let rsql = [];
if (filters.search) {
  rsql.push(
    `fullName=like='*${filters.search}*',email=like='*${filters.search}*'`,
  );
}
if (filters.role !== "ALL") {
  rsql.push(`role==${filters.role}`);
}
if (filters.status !== "ALL") {
  rsql.push(`status==${filters.status}`);
}
const search = rsql.join(";"); // AND condition
```

#### 4.2.2 List Doctors (for Appointment Booking)

| Property         | Value                                                            |
| ---------------- | ---------------------------------------------------------------- |
| **Endpoint**     | `GET /api/hr/doctors`                                            |
| **Used By**      | `DepartmentFormPage` (head doctor dropdown), Appointment Service |
| **Query Params** | `departmentId`, `specialization`, `status`, `page`, `size`       |

#### 4.2.3 Create Employee

| Property     | Value                            |
| ------------ | -------------------------------- |
| **Endpoint** | `POST /api/hr/employees`         |
| **Used By**  | `EmployeeFormPage` (create mode) |

**UI → Request Mapping:**

```typescript
const requestBody = {
  accountId: form.accountId || undefined,
  fullName: form.fullName.trim(),
  role: form.role,
  departmentId: form.departmentId || undefined,
  specialization: form.specialization?.trim() || undefined,
  licenseNumber: form.licenseNumber?.trim() || undefined,
  email: form.email.trim(),
  phoneNumber: form.phoneNumber?.trim() || undefined,
  address: form.address?.trim() || undefined,
  status: form.status,
  hiredAt: form.hiredAt ? formatDate(form.hiredAt) : undefined,
};
```

**Response Handling:**

```typescript
// Success (201)
// → Toast "Employee created successfully"
// → Navigate to /admin/hr/employees

// Error (400) - Validation
// → Set field errors from response

// Error (404) - Account/Department not found
// → Toast with specific message

// Error (409) - License number exists
// → Set error on licenseNumber field: "License number already in use"
```

#### 4.2.4 Get Employee

| Property     | Value                                                |
| ------------ | ---------------------------------------------------- |
| **Endpoint** | `GET /api/hr/employees/{id}`                         |
| **Used By**  | `EmployeeFormPage` (edit mode), `EmployeeDetailPage` |

**Response Handling:**

```typescript
// Success (200)
// → Pre-fill form with data

// Error (404)
// → Show 404 page with "Back to list" link
```

#### 4.2.5 Update Employee

| Property     | Value                          |
| ------------ | ------------------------------ |
| **Endpoint** | `PATCH /api/hr/employees/{id}` |
| **Used By**  | `EmployeeFormPage` (edit mode) |

**UI → Request Mapping:**

```typescript
// Only send changed fields
const changedFields = getChangedFields(originalValues, currentValues);
const requestBody = changedFields;
```

**Response Handling:**

```typescript
// Success (200)
// → Toast "Employee updated successfully"
// → Navigate to /admin/hr/employees

// Error (404) - Employee/Department not found
// → Show appropriate error

// Error (409) - License number exists
// → Set error on licenseNumber field
```

#### 4.2.6 Delete Employee (Soft Delete)

| Property     | Value                           |
| ------------ | ------------------------------- |
| **Endpoint** | `DELETE /api/hr/employees/{id}` |
| **Used By**  | `EmployeeListPage`              |

**Response Handling:**

```typescript
// Success (200) - Note: Returns 200 with deletedAt info, not 204
{
  status: 'success',
  data: {
    id: string,
    deletedAt: string,
    deletedBy: string
  }
}
// → Toast "Employee deleted"
// → Remove row from table

// Error (404)
// → Toast "Employee not found"

// Error (409) - Has future appointments
// → Toast "Cannot delete employee with X scheduled appointments"
```

---

### 4.3 Schedule APIs

#### 4.3.1 List Doctor Schedules

| Property         | Value                                                                        |
| ---------------- | ---------------------------------------------------------------------------- |
| **Endpoint**     | `GET /api/hr/schedules/doctors`                                              |
| **Used By**      | `ScheduleCalendarPage`                                                       |
| **Query Params** | `departmentId`, `doctorId`, `startDate`, `endDate`, `status`, `page`, `size` |

**Request Example:**

```typescript
const params = {
  startDate: formatDate(weekStart), // "2025-12-02"
  endDate: formatDate(weekEnd), // "2025-12-08"
  departmentId: filters.department || undefined,
  doctorId: filters.employee || undefined,
  status: "AVAILABLE",
};
```

#### 4.3.2 Get My Schedules

| Property         | Value                            |
| ---------------- | -------------------------------- |
| **Endpoint**     | `GET /api/hr/schedules/me`       |
| **Used By**      | `MySchedulesPage`                |
| **Query Params** | `startDate`, `endDate`, `status` |

#### 4.3.3 Create Schedule

| Property     | Value                    |
| ------------ | ------------------------ |
| **Endpoint** | `POST /api/hr/schedules` |
| **Used By**  | `ScheduleFormModal`      |

**UI → Request Mapping:**

```typescript
const requestBody = {
  employeeId: form.employeeId,
  workDate: formatDate(form.workDate), // "2025-12-05"
  startTime: form.startTime, // "08:00"
  endTime: form.endTime, // "17:00"
  status: form.status,
  notes: form.notes?.trim() || undefined,
};
```

**Response Handling:**

```typescript
// Success (201)
// → Close modal
// → Refresh calendar (optimistic update or refetch)
// → Toast "Schedule created"

// Error (409) - Duplicate
// → Show error in modal: "Employee already has schedule for this date"
```

#### 4.3.4 Update Schedule

| Property     | Value                           |
| ------------ | ------------------------------- |
| **Endpoint** | `PATCH /api/hr/schedules/{id}`  |
| **Used By**  | `ScheduleFormModal` (edit mode) |

**Response Handling:**

```typescript
// Error (409) - Has appointments
// → Show warning: "Cannot modify schedule with booked appointments"
```

#### 4.3.5 Delete Schedule

| Property     | Value                           |
| ------------ | ------------------------------- |
| **Endpoint** | `DELETE /api/hr/schedules/{id}` |
| **Used By**  | `ScheduleDetailPopover`         |

---

### 4.4 Mock Data Examples

#### Department Mock

```json
{
  "id": "dept001",
  "name": "Cardiology",
  "description": "Heart and cardiovascular diseases",
  "location": "Building A - Floor 3",
  "phoneExtension": "301",
  "status": "ACTIVE",
  "headDoctorId": "emp001",
  "headDoctor": {
    "id": "emp001",
    "fullName": "Dr. Nguyen Van Hung"
  },
  "createdAt": "2025-12-02T10:30:00Z",
  "updatedAt": "2025-12-02T10:30:00Z"
}
```

#### Employee Mock

```json
{
  "id": "emp001",
  "accountId": "550e8400-e29b-41d4-a716-446655440003",
  "fullName": "Dr. Nguyen Van Hung",
  "role": "DOCTOR",
  "department": {
    "id": "dept001",
    "name": "Cardiology"
  },
  "specialization": "Interventional Cardiology",
  "licenseNumber": "MD-12345",
  "email": "dr.hung@hms.com",
  "phoneNumber": "0901111111",
  "address": "456 Hospital St",
  "status": "ACTIVE",
  "hiredAt": "2020-01-15T00:00:00Z",
  "createdAt": "2025-12-02T10:30:00Z",
  "updatedAt": "2025-12-02T10:30:00Z"
}
```

#### Schedule Mock

```json
{
  "id": "sch001",
  "employeeId": "emp001",
  "employee": {
    "id": "emp001",
    "fullName": "Dr. Nguyen Van Hung",
    "role": "DOCTOR",
    "department": {
      "id": "dept001",
      "name": "Cardiology"
    }
  },
  "workDate": "2025-12-05",
  "startTime": "08:00",
  "endTime": "17:00",
  "status": "AVAILABLE",
  "notes": "Regular working hours",
  "createdAt": "2025-12-02T10:30:00Z"
}
```

---

## 5. Shared Components & Global State

### 5.1 Reusable Components

| Component          | Used In                  | Props                                            |
| ------------------ | ------------------------ | ------------------------------------------------ |
| `DataTable`        | All list pages           | columns, data, pagination, sorting, onRowClick   |
| `SearchInput`      | All list pages           | value, onChange, placeholder, debounceMs         |
| `StatusBadge`      | List pages, detail pages | status, colorMap                                 |
| `FormField`        | All form pages           | label, name, error, required, children           |
| `ConfirmDialog`    | Delete actions           | title, message, onConfirm, onCancel              |
| `PageHeader`       | All pages                | title, backLink?, actions?                       |
| `EmptyState`       | List pages               | message, actionLabel?, onAction?                 |
| `LoadingSkeleton`  | All pages                | variant (table, form, card)                      |
| `SearchableSelect` | Form pages               | options, value, onChange, placeholder, isLoading |
| `DatePicker`       | Form pages               | value, onChange, minDate?, maxDate?              |
| `TimePicker`       | Schedule form            | value, onChange, step (30 min)                   |

### 5.2 Global State (React Query Cache Keys)

```typescript
// Cache key patterns
const queryKeys = {
  // Departments
  departments: ["departments"] as const,
  departmentList: (filters: DepartmentFilters) => [
    "departments",
    "list",
    filters,
  ],
  departmentDetail: (id: string) => ["departments", "detail", id],

  // Employees
  employees: ["employees"] as const,
  employeeList: (filters: EmployeeFilters) => ["employees", "list", filters],
  employeeDetail: (id: string) => ["employees", "detail", id],
  doctors: (departmentId?: string) => ["employees", "doctors", departmentId],

  // Schedules
  schedules: ["schedules"] as const,
  scheduleList: (params: ScheduleParams) => ["schedules", "list", params],
  mySchedules: (params: MyScheduleParams) => ["schedules", "me", params],
};

// Invalidation patterns
// After create/update/delete department:
queryClient.invalidateQueries({ queryKey: queryKeys.departments });

// After create/update/delete employee:
queryClient.invalidateQueries({ queryKey: queryKeys.employees });
queryClient.invalidateQueries({ queryKey: ["employees", "doctors"] });

// After create/update/delete schedule:
queryClient.invalidateQueries({ queryKey: queryKeys.schedules });
```

### 5.3 Cross-Service Dependencies

| HR Service Needs           | From Service | Endpoint                             |
| -------------------------- | ------------ | ------------------------------------ |
| Account list (for linking) | Auth Service | `GET /api/auth/accounts` (if exists) |

| Other Services Need | From HR Service       | Endpoint                        |
| ------------------- | --------------------- | ------------------------------- |
| Doctor list         | Appointment Service   | `GET /api/hr/doctors`           |
| Doctor availability | Appointment Service   | `GET /api/hr/schedules/doctors` |
| Employee details    | Medical Exam, Billing | `GET /api/hr/employees/{id}`    |

---

## 6. Error Handling & Edge Cases

### 6.1 API Error Response Format

The backend returns errors in this format:

```typescript
interface ApiErrorResponse {
  status: "error";
  error: {
    code: string; // e.g., "VALIDATION_ERROR", "DEPARTMENT_NOT_FOUND"
    message: string; // Human-readable message
    details?: Array<{
      // For validation errors
      field: string;
      message: string;
    }>;
  };
  timestamp: string;
}
```

### 6.2 Error Code Reference (HR Service)

#### 6.2.1 Department Error Codes

| HTTP | Code                       | When                   | UI Response                                                                        |
| ---- | -------------------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| 400  | `VALIDATION_ERROR`         | Invalid input          | Show field-level errors                                                            |
| 401  | `UNAUTHORIZED`             | Missing/invalid token  | Redirect to `/login`, clear auth state                                             |
| 403  | `FORBIDDEN`                | Not ADMIN role         | Toast "You don't have permission for this action"                                  |
| 404  | `DEPARTMENT_NOT_FOUND`     | ID doesn't exist       | Show 404 page or Toast "Department not found"                                      |
| 404  | `EMPLOYEE_NOT_FOUND`       | Head doctor ID invalid | Set field error on headDoctorId: "Selected doctor not found"                       |
| 409  | `DEPARTMENT_NAME_EXISTS`   | Duplicate name         | Set field error on name: "Department name already exists"                          |
| 409  | `DEPARTMENT_HAS_EMPLOYEES` | Delete with employees  | Toast "Cannot delete department with assigned employees. Set to Inactive instead." |

#### 6.2.2 Employee Error Codes

| HTTP | Code                      | When                     | UI Response                                                         |
| ---- | ------------------------- | ------------------------ | ------------------------------------------------------------------- |
| 400  | `VALIDATION_ERROR`        | Invalid input            | Show field-level errors                                             |
| 401  | `UNAUTHORIZED`            | Missing/invalid token    | Redirect to `/login`                                                |
| 403  | `FORBIDDEN`               | Not ADMIN role           | Toast "You don't have permission for this action"                   |
| 404  | `EMPLOYEE_NOT_FOUND`      | ID doesn't exist         | Show 404 page or Toast "Employee not found"                         |
| 404  | `ACCOUNT_NOT_FOUND`       | Account ID invalid       | Set field error on accountId: "Account not found"                   |
| 404  | `DEPARTMENT_NOT_FOUND`    | Department ID invalid    | Set field error on departmentId: "Department not found"             |
| 409  | `LICENSE_NUMBER_EXISTS`   | Duplicate license        | Set field error on licenseNumber: "License number already in use"   |
| 409  | `HAS_FUTURE_APPOINTMENTS` | Delete with appointments | Toast "Cannot delete employee with X scheduled future appointments" |

#### 6.2.3 Schedule Error Codes

| HTTP | Code                   | When                        | UI Response                                                      |
| ---- | ---------------------- | --------------------------- | ---------------------------------------------------------------- |
| 400  | `VALIDATION_ERROR`     | Invalid input               | Show field/modal errors                                          |
| 401  | `UNAUTHORIZED`         | Missing/invalid token       | Redirect to `/login`                                             |
| 403  | `FORBIDDEN`            | Not ADMIN role              | Toast "You don't have permission for this action"                |
| 404  | `SCHEDULE_NOT_FOUND`   | ID doesn't exist            | Toast "Schedule not found", close modal                          |
| 404  | `EMPLOYEE_NOT_FOUND`   | Employee ID invalid         | Set field error on employeeId: "Employee not found"              |
| 404  | `DEPARTMENT_NOT_FOUND` | Filter dept invalid         | Toast "Department not found"                                     |
| 409  | `SCHEDULE_EXISTS`      | Duplicate date              | Set field error: "Employee already has a schedule for this date" |
| 409  | `HAS_APPOINTMENTS`     | Modify/delete with bookings | Toast "Cannot modify schedule with booked appointments"          |

### 6.3 Validation Error Details (from API Contract)

#### Department Validation Errors

```typescript
const departmentValidationErrors = {
  name: ["name is required", "name exceeds maximum length (255 characters)"],
  status: ["status must be one of [ACTIVE, INACTIVE]"],
};
```

#### Employee Validation Errors

```typescript
const employeeValidationErrors = {
  fullName: [
    "fullName is required",
    "fullName exceeds maximum length (255 characters)",
  ],
  role: [
    "role is required",
    "role must be one of [DOCTOR, NURSE, RECEPTIONIST, ADMIN]",
  ],
  departmentId: ["departmentId is required for DOCTOR and NURSE roles"],
  licenseNumber: ["licenseNumber is required for DOCTOR and NURSE roles"],
  email: ["email must be valid format"],
  phoneNumber: ["phoneNumber must be valid Vietnamese format"],
  hiredAt: ["hiredAt must be valid ISO 8601 date"],
  status: ["status must be one of [ACTIVE, ON_LEAVE, RESIGNED]"],
};
```

#### Schedule Validation Errors

```typescript
const scheduleValidationErrors = {
  employeeId: ["employeeId is required"],
  workDate: [
    "workDate is required",
    "workDate must be valid ISO 8601 date (YYYY-MM-DD)",
    "workDate cannot be in the past",
  ],
  startTime: [
    "startTime is required (format: HH:mm)",
    "startTime must be valid format (HH:mm)",
    "startTime must be before endTime",
  ],
  endTime: [
    "endTime is required (format: HH:mm)",
    "endTime must be valid format (HH:mm)",
  ],
  status: ["status must be one of [AVAILABLE, BOOKED, CANCELLED]"],
  notes: ["notes exceeds maximum length (1000 characters)"],
  // For GET schedules
  startDate: ["startDate is required", "startDate cannot be after endDate"],
  endDate: ["endDate is required"],
  page: ["page must be >= 0"],
  size: ["size must be between 1 and 100"],
};
```

### 6.4 Error Handling Implementation

```typescript
// Centralized error handler for HR Service
function handleApiError(
  error: ApiErrorResponse,
  options?: {
    setFieldErrors?: (errors: Record<string, string>) => void;
    onNotFound?: () => void;
  },
) {
  const { code, message, details } = error.error;

  switch (code) {
    // Authentication errors
    case "UNAUTHORIZED":
      clearAuthState();
      router.push("/login");
      toast.error("Your session has expired. Please log in again.");
      break;

    // Authorization errors
    case "FORBIDDEN":
      toast.error("You don't have permission for this action");
      break;

    // Validation errors - show field-level
    case "VALIDATION_ERROR":
      if (details && options?.setFieldErrors) {
        const fieldErrors = details.reduce(
          (acc, err) => {
            acc[err.field] = err.message;
            return acc;
          },
          {} as Record<string, string>,
        );
        options.setFieldErrors(fieldErrors);
      } else {
        toast.error(message || "Validation failed");
      }
      break;

    // Not found errors
    case "DEPARTMENT_NOT_FOUND":
    case "EMPLOYEE_NOT_FOUND":
    case "SCHEDULE_NOT_FOUND":
    case "ACCOUNT_NOT_FOUND":
      if (options?.onNotFound) {
        options.onNotFound();
      } else {
        toast.error(getNotFoundMessage(code));
      }
      break;

    // Conflict errors - specific messages
    case "DEPARTMENT_NAME_EXISTS":
      options?.setFieldErrors?.({ name: "Department name already exists" });
      break;

    case "LICENSE_NUMBER_EXISTS":
      options?.setFieldErrors?.({
        licenseNumber: "License number already in use",
      });
      break;

    case "SCHEDULE_EXISTS":
      options?.setFieldErrors?.({
        workDate: "Employee already has a schedule for this date",
      });
      break;

    case "DEPARTMENT_HAS_EMPLOYEES":
      toast.warning(
        "Cannot delete department with assigned employees. Consider setting status to Inactive instead.",
      );
      break;

    case "HAS_FUTURE_APPOINTMENTS":
      toast.warning(
        "Cannot delete: Employee has scheduled future appointments. Cancel them first.",
      );
      break;

    case "HAS_APPOINTMENTS":
      toast.warning("Cannot modify schedule with booked appointments");
      break;

    // Generic server error
    default:
      toast.error(message || "Something went wrong. Please try again later.");
      console.error("Unhandled API error:", error);
  }
}

function getNotFoundMessage(code: string): string {
  const messages: Record<string, string> = {
    DEPARTMENT_NOT_FOUND: "Department not found",
    EMPLOYEE_NOT_FOUND: "Employee not found",
    SCHEDULE_NOT_FOUND: "Schedule not found",
    ACCOUNT_NOT_FOUND: "Account not found",
  };
  return messages[code] || "Resource not found";
}
```

### 6.5 HTTP Status Code Quick Reference

| HTTP Code | Meaning      | Default UI Action                              |
| --------- | ------------ | ---------------------------------------------- |
| 200       | Success      | Process response, show success toast           |
| 201       | Created      | Process response, show success toast, redirect |
| 204       | No Content   | Show success toast (for delete)                |
| 400       | Bad Request  | Show validation errors from `details`          |
| 401       | Unauthorized | Redirect to login, clear auth                  |
| 403       | Forbidden    | Toast permission denied                        |
| 404       | Not Found    | Show 404 page OR toast based on context        |
| 409       | Conflict     | Toast with specific conflict message           |
| 500       | Server Error | Toast "Something went wrong" + log error       |

### 6.6 Edge Cases

| Scenario                           | Handling                                                           |
| ---------------------------------- | ------------------------------------------------------------------ |
| Form submitted while loading       | Disable submit button, show spinner                                |
| Navigate away with unsaved changes | Show "Unsaved changes" dialog                                      |
| Delete while viewing detail        | Redirect to list with toast                                        |
| Session expires mid-form           | Save form to localStorage, redirect to login, restore after        |
| API timeout (30s)                  | Toast "Request timed out. Please try again." + Retry button        |
| Network offline                    | Toast "You're offline. Check your connection."                     |
| Empty search results               | Show "No results found" with suggestion to clear filters           |
| Calendar with no schedules         | Show empty state per day/week                                      |
| Concurrent edit conflict           | Toast "Data was modified by another user. Refresh to see changes." |

### 6.7 Toast Messages (Aligned with Error Codes)

```typescript
const toastMessages = {
  // Success messages
  success: {
    departmentCreated: "Department created successfully",
    departmentUpdated: "Department updated successfully",
    departmentDeleted: "Department deleted successfully",
    employeeCreated: "Employee created successfully",
    employeeUpdated: "Employee updated successfully",
    employeeDeleted: "Employee deleted successfully",
    scheduleCreated: "Schedule created successfully",
    scheduleUpdated: "Schedule updated successfully",
    scheduleDeleted: "Schedule deleted successfully",
  },

  // Error messages (mapped from error codes)
  error: {
    UNAUTHORIZED: "Your session has expired. Please log in again.",
    FORBIDDEN: "You don't have permission for this action.",
    DEPARTMENT_NOT_FOUND: "Department not found",
    EMPLOYEE_NOT_FOUND: "Employee not found",
    SCHEDULE_NOT_FOUND: "Schedule not found",
    ACCOUNT_NOT_FOUND: "Account not found",
    VALIDATION_ERROR: "Please check the form for errors",
    NETWORK_ERROR: "Network error. Please check your connection.",
    SERVER_ERROR: "Something went wrong. Please try again later.",
    TIMEOUT: "Request timed out. Please try again.",
  },

  // Warning messages (conflict errors)
  warning: {
    DEPARTMENT_NAME_EXISTS: "A department with this name already exists",
    LICENSE_NUMBER_EXISTS: "This license number is already in use",
    DEPARTMENT_HAS_EMPLOYEES:
      "Cannot delete department with assigned employees. Set to Inactive instead.",
    HAS_FUTURE_APPOINTMENTS:
      "Cannot delete: Employee has scheduled future appointments.",
    SCHEDULE_EXISTS: "Employee already has a schedule for this date",
    HAS_APPOINTMENTS: "Cannot modify schedule with booked appointments",
  },
};
```

---

## Appendix A: TypeScript Interfaces

```typescript
// Department
interface Department {
  id: string;
  name: string;
  description?: string;
  location?: string;
  phoneExtension?: string;
  status: "ACTIVE" | "INACTIVE";
  headDoctorId?: string;
  headDoctor?: {
    id: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DepartmentRequest {
  name: string;
  description?: string;
  location?: string;
  phoneExtension?: string;
  status: "ACTIVE" | "INACTIVE";
  headDoctorId?: string;
}

// Employee
interface Employee {
  id: string;
  accountId?: string;
  fullName: string;
  role: "DOCTOR" | "NURSE" | "RECEPTIONIST" | "ADMIN";
  department?: {
    id: string;
    name: string;
    location?: string;
  };
  specialization?: string;
  licenseNumber?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  status: "ACTIVE" | "ON_LEAVE" | "RESIGNED";
  hiredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface EmployeeRequest {
  accountId?: string;
  fullName: string;
  role: "DOCTOR" | "NURSE" | "RECEPTIONIST" | "ADMIN";
  departmentId?: string;
  specialization?: string;
  licenseNumber?: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  status: "ACTIVE" | "ON_LEAVE" | "RESIGNED";
  hiredAt?: string;
}

// Schedule
interface EmployeeSchedule {
  id: string;
  employeeId: string;
  employee?: {
    id: string;
    fullName: string;
    role: string;
    department?: {
      id: string;
      name: string;
    };
  };
  workDate: string; // "2025-12-05"
  startTime: string; // "08:00"
  endTime: string; // "17:00"
  status: "AVAILABLE" | "BOOKED" | "CANCELLED";
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ScheduleRequest {
  employeeId: string;
  workDate: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "CANCELLED";
  notes?: string;
}

// API Response wrappers
interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  code?: string;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

---

## Appendix B: Checklist for FE Implementation

### Department Management

- [ ] Department list page with search, filter, pagination
- [ ] Create department form with validation
- [ ] Edit department form (pre-fill data)
- [ ] Delete department with confirmation
- [ ] Head doctor selection (searchable dropdown)
- [ ] Status badge colors

### Employee Management

- [ ] Employee list page with multi-filter
- [ ] Create employee form with conditional fields
- [ ] Edit employee form with warnings
- [ ] Delete employee (soft delete) with appointment check
- [ ] Role/Status badge colors
- [ ] Department dropdown
- [ ] License number validation

### Schedule Management

- [ ] Calendar view (week/month)
- [ ] Schedule cards with status colors
- [ ] Create schedule modal
- [ ] Edit schedule modal
- [ ] Delete schedule with confirmation
- [ ] My schedules page (doctor view)
- [ ] Filter by department/employee
- [ ] Date navigation

### General

- [ ] Loading states (skeletons)
- [ ] Error handling (toasts, field errors)
- [ ] Empty states
- [ ] Unsaved changes dialog
- [ ] Role-based visibility
- [ ] Mock data for development
- [ ] React Query cache invalidation
      Beta
      0 / 0
      used queries
      1
