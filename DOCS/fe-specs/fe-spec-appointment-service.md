# Appointment Service - Frontend Specification

**Project:** Hospital Management System  
**Service:** Appointment Service (Patient Appointment Booking & Management)  
**Version:** 1.1  
**Last Updated:** December 6, 2025  
**Target Users:** ADMIN, DOCTOR, NURSE, RECEPTIONIST (full access), PATIENT (own appointments only)

---

## 1. Overview & Screen Inventory

### 1.1 Service Scope

The Appointment Service manages patient appointment bookings with doctors. It provides:

- Appointment creation (book new appointments)
- Appointment listing with filters (by patient, doctor, status, date range)
- Appointment details view
- Appointment rescheduling (update time/type)
- Appointment cancellation
- Appointment completion (doctor marks consultation done)
- Doctor availability checking (cross-service with HR)

### 1.2 Related Backend

| Item          | Value               |
| ------------- | ------------------- |
| **Service**   | appointment-service |
| **Port**      | 8085                |
| **Base Path** | `/api/appointments` |
| **Database**  | `appointment_db`    |
| **Tables**    | `appointments`      |

### 1.3 Cross-Service Dependencies

| Service             | Purpose                   | Endpoints Used                                               |
| ------------------- | ------------------------- | ------------------------------------------------------------ |
| **HR Service**      | Doctor list, availability | `GET /api/hr/employees?role=DOCTOR`, `GET /api/hr/schedules` |
| **Patient Service** | Patient lookup            | `GET /api/patients`, `GET /api/patients/{id}`                |

### 1.4 Screen Inventory

| Route                           | Screen Name                  | Component                | Access                             | Priority |
| ------------------------------- | ---------------------------- | ------------------------ | ---------------------------------- | -------- |
| `/admin/appointments`           | Appointment List (Admin)     | `AppointmentListPage`    | ADMIN, NURSE, RECEPTIONIST         | P0       |
| `/admin/appointments/new`       | Create Appointment           | `AppointmentFormPage`    | ADMIN, DOCTOR, NURSE, RECEPTIONIST | P0       |
| `/admin/appointments/{id}`      | Appointment Detail           | `AppointmentDetailPage`  | ADMIN, DOCTOR, NURSE, RECEPTIONIST | P0       |
| `/admin/appointments/{id}/edit` | Edit Appointment             | `AppointmentFormPage`    | ADMIN, DOCTOR, NURSE, RECEPTIONIST | P1       |
| `/doctor/appointments`          | Doctor Appointments          | `DoctorAppointmentPage`  | DOCTOR                             | P0       |
| `/doctor/appointments/{id}`     | Appointment Detail (Doctor)  | `AppointmentDetailPage`  | DOCTOR                             | P0       |
| `/patient/appointments`         | My Appointments              | `PatientAppointmentPage` | PATIENT                            | P0       |
| `/patient/appointments/new`     | Book Appointment             | `PatientBookingPage`     | PATIENT                            | P0       |
| `/patient/appointments/{id}`    | Appointment Detail (Patient) | `AppointmentDetailPage`  | PATIENT                            | P1       |

### 1.5 Screen Hierarchy Diagram

```
/admin
└── /appointments
    ├── (list view with DataTable - all appointments)
    ├── /new (form - create appointment for any patient)
    ├── /{id} (detail view with actions)
    └── /{id}/edit (form - reschedule/update)

/doctor
└── /appointments
    ├── (list view - doctor's own appointments)
    └── /{id} (detail view with complete action)

/patient
└── /appointments
    ├── (list view - patient's own appointments)
    ├── /new (simplified booking form)
    └── /{id} (detail view with cancel action)
```

---

## 2. User Flows & Acceptance Criteria

### 2.1 Flow: View Appointment List (Admin/Staff)

```
┌─────────────────────────────────────────────────────────────┐
│ Staff navigates to /admin/appointments                      │
│                          ↓                                  │
│ System loads appointment list with pagination               │
│                          ↓                                  │
│ Staff can: Search, Filter by status/doctor/date, Sort       │
│                          ↓                                  │
│ Staff clicks row → Navigate to detail OR                    │
│ Staff clicks "Edit" → Navigate to edit form OR              │
│ Staff clicks "Book Appointment" → Navigate to create form   │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Page loads within 2 seconds
- [ ] Table displays: Patient Name, Doctor Name, Date/Time, Type, Status, Actions
- [ ] Search filters by patient name (debounced 300ms)
- [ ] Status filter: All, SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
- [ ] Doctor filter: Dropdown of active doctors
- [ ] Date range filter: Start date, End date
- [ ] Pagination: 10, 20, 50 items per page
- [ ] Sort by: Date/Time (default desc), Patient Name, Status
- [ ] Empty state shown when no appointments match filters
- [ ] Loading skeleton shown while fetching data
- [ ] Status badges with distinct colors (SCHEDULED=blue, COMPLETED=green, CANCELLED=red, NO_SHOW=gray)

---

### 2.2 Flow: Create Appointment (Admin/Staff)

```
┌─────────────────────────────────────────────────────────────┐
│ Staff clicks "Book Appointment" button                      │
│                          ↓                                  │
│ Navigate to /admin/appointments/new                         │
│                          ↓                                  │
│ Staff selects Patient (search/dropdown)                     │
│                          ↓                                  │
│ Staff selects Doctor (filtered by department optional)      │
│                          ↓                                  │
│ System shows Doctor's available time slots                  │
│                          ↓                                  │
│ Staff selects Date & Time slot                              │
│                          ↓                                  │
│ Staff selects Type (CONSULTATION/FOLLOW_UP/EMERGENCY)       │
│                          ↓                                  │
│ Staff enters Reason (chief complaint)                       │
│                          ↓                                  │
│ Staff clicks "Book Appointment"                             │
│         ↓                              ↓                    │
│   [Validation Pass]            [Validation Fail]            │
│         ↓                              ↓                    │
│   POST /api/appointments        Show field errors           │
│         ↓                                                   │
│   ┌─────────┐    ┌──────────────┐                          │
│   │ Success │    │    Error     │                          │
│   └────┬────┘    └──────┬───────┘                          │
│        ↓                ↓                                   │
│   Toast "Booked"    Toast error message                     │
│   Redirect to list  Stay on form                            │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Patient field: Searchable dropdown with patient name/phone
- [ ] Doctor field: Searchable dropdown showing name + department
- [ ] After doctor selection, system loads available time slots
- [ ] Time slots shown in 30-minute intervals within doctor's schedule
- [ ] Unavailable/booked slots shown as disabled
- [ ] Type field: Radio buttons or dropdown (CONSULTATION default)
- [ ] Reason field: Textarea, max 500 characters
- [ ] Success: Show toast "Appointment booked successfully", redirect to list
- [ ] Error 404 PATIENT_NOT_FOUND: Show "Patient not found"
- [ ] Error 404 EMPLOYEE_NOT_FOUND: Show "Doctor not found"
- [ ] Error 409 DOCTOR_NOT_AVAILABLE: Show "Doctor is not available on selected date"
- [ ] Error 409 TIME_SLOT_TAKEN: Show "Selected time slot is already booked"
- [ ] Error 400 PAST_APPOINTMENT: Show "Cannot book appointments in the past"
- [ ] "Cancel" button returns to list without saving

---

### 2.3 Flow: Book Appointment (Patient Self-Service)

```
┌─────────────────────────────────────────────────────────────┐
│ Patient navigates to /patient/appointments/new              │
│                          ↓                                  │
│ System auto-fills patient info from logged-in user          │
│                          ↓                                  │
│ Patient selects Department (optional filter)                │
│                          ↓                                  │
│ Patient selects Doctor                                      │
│                          ↓                                  │
│ System shows Doctor's available dates (calendar view)       │
│                          ↓                                  │
│ Patient selects Date                                        │
│                          ↓                                  │
│ System shows available time slots for selected date         │
│                          ↓                                  │
│ Patient selects Time slot                                   │
│                          ↓                                  │
│ Patient selects Type & enters Reason                        │
│                          ↓                                  │
│ Patient clicks "Confirm Booking"                            │
│         ↓                              ↓                    │
│   [Success]                      [Error]                    │
│      ↓                              ↓                       │
│   Show confirmation          Show error message             │
│   Redirect to my appointments                               │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Patient ID auto-populated from session (cannot change)
- [ ] Department filter optional (shows all doctors if not selected)
- [ ] Doctor cards show: Photo placeholder, Name, Specialization, Department
- [ ] Calendar shows dates with available slots highlighted
- [ ] Dates without doctor schedules shown as disabled
- [ ] Time slot buttons: Available (clickable), Booked (disabled/grayed)
- [ ] Confirmation modal before final booking
- [ ] Success: Show success message, redirect to /patient/appointments
- [ ] Same error handling as Admin flow

---

### 2.4 Flow: View Appointment Detail

```
┌─────────────────────────────────────────────────────────────┐
│ User clicks appointment row or navigates to /{id}           │
│                          ↓                                  │
│ System fetches appointment detail (GET /api/appointments/{id})│
│         ↓                              ↓                    │
│   [Found]                        [Not Found]                │
│      ↓                                ↓                     │
│   Display detail page            Show 404 page              │
│      ↓                                                      │
│   Show available actions based on status & role:            │
│   - SCHEDULED: Edit, Cancel, Complete (doctor only)         │
│   - COMPLETED: View only (link to medical exam)             │
│   - CANCELLED: View only                                    │
│   - NO_SHOW: View only                                      │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Display: Patient info, Doctor info, Date/Time, Type, Status, Reason, Notes
- [ ] SCHEDULED status: Show "Edit", "Cancel" buttons
- [ ] SCHEDULED status + DOCTOR role: Show "Mark as Completed" button
- [ ] COMPLETED status: Show link to medical exam (if exists)
- [ ] CANCELLED status: Show cancellation reason and timestamp
- [ ] Status badge prominently displayed
- [ ] Back button returns to appropriate list (admin/doctor/patient)

---

### 2.5 Flow: Reschedule Appointment

```
┌─────────────────────────────────────────────────────────────┐
│ Staff clicks "Edit" on SCHEDULED appointment                │
│                          ↓                                  │
│ Navigate to /admin/appointments/{id}/edit                   │
│                          ↓                                  │
│ System loads appointment data                               │
│                          ↓                                  │
│ Staff can modify: Date/Time, Type, Reason, Notes            │
│ (Patient and Doctor are read-only)                          │
│                          ↓                                  │
│ If date/time changed, validate doctor availability          │
│                          ↓                                  │
│ Staff clicks "Save Changes"                                 │
│         ↓                              ↓                    │
│   [Success]                      [Error]                    │
│      ↓                              ↓                       │
│   Toast "Rescheduled"        Show error message             │
│   Redirect to detail                                        │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Only SCHEDULED appointments can be edited
- [ ] Patient and Doctor fields are read-only (display only)
- [ ] Time slots show current appointment's slot as "Current"
- [ ] Error 400 APPOINTMENT_NOT_MODIFIABLE: Show "Cannot modify completed/cancelled appointments"
- [ ] Error 409 TIME_SLOT_TAKEN: Show "New time slot is already booked"
- [ ] Notes field: Textarea, max 1000 characters
- [ ] Success: Toast "Appointment rescheduled successfully"

---

### 2.6 Flow: Cancel Appointment

```
┌─────────────────────────────────────────────────────────────┐
│ User clicks "Cancel" on SCHEDULED appointment               │
│                          ↓                                  │
│ Show confirmation modal with reason input                   │
│                          ↓                                  │
│ User enters cancellation reason (required)                  │
│                          ↓                                  │
│ User confirms cancellation                                  │
│         ↓                              ↓                    │
│   PATCH /api/appointments/{id}/cancel                       │
│         ↓                              ↓                    │
│   [Success]                      [Error]                    │
│      ↓                              ↓                       │
│   Toast "Cancelled"          Show error message             │
│   Refresh detail page                                       │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Confirmation modal with warning message
- [ ] Reason field required, max 500 characters
- [ ] Error 400 APPOINTMENT_NOT_CANCELLABLE: Show "Cannot cancel completed or no-show appointments"
- [ ] Error 400 ALREADY_CANCELLED: Show "Appointment is already cancelled"
- [ ] Patients can only cancel their own appointments
- [ ] Success: Toast "Appointment cancelled successfully", update status badge

---

### 2.7 Flow: Complete Appointment (Doctor Only)

```
┌─────────────────────────────────────────────────────────────┐
│ Doctor clicks "Mark as Completed" on SCHEDULED appointment  │
│                          ↓                                  │
│ Show confirmation modal                                     │
│                          ↓                                  │
│ Doctor confirms completion                                  │
│         ↓                              ↓                    │
│   PATCH /api/appointments/{id}/complete                     │
│         ↓                              ↓                    │
│   [Success]                      [Error]                    │
│      ↓                              ↓                       │
│   Toast "Completed"          Show error message             │
│   Prompt to create medical exam                             │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Only visible to the assigned doctor
- [ ] Confirmation modal: "Mark this appointment as completed?"
- [ ] Error 400 ALREADY_COMPLETED: Show "Appointment is already completed"
- [ ] Error 400 APPOINTMENT_CANCELLED: Show "Cannot complete a cancelled appointment"
- [ ] Error 400 APPOINTMENT_NO_SHOW: Show "Cannot complete a no-show appointment"
- [ ] Error 403 FORBIDDEN: Show "Only the assigned doctor can complete this appointment"
- [ ] Success: Update status badge, show "Create Medical Exam" button/link

---

### 2.8 Flow: View My Appointments (Patient)

```
┌─────────────────────────────────────────────────────────────┐
│ Patient navigates to /patient/appointments                  │
│                          ↓                                  │
│ System loads patient's appointments only                    │
│                          ↓                                  │
│ Display appointment cards (upcoming first, then past)       │
│                          ↓                                  │
│ Patient can filter by status                                │
│                          ↓                                  │
│ Patient clicks card → View detail                           │
│ Patient clicks "Book New" → Navigate to booking form        │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Appointments auto-filtered to logged-in patient
- [ ] Upcoming appointments shown first (sorted by date ascending)
- [ ] Past appointments shown below (sorted by date descending)
- [ ] Card view with: Doctor name, Department, Date/Time, Status
- [ ] "Book New Appointment" prominent CTA button
- [ ] SCHEDULED appointments show "Cancel" quick action

---

## 3. Screen Specifications

### 3.1 Appointment List Page (Admin/Staff)

**Route:** `/admin/appointments`  
**Component:** `AppointmentListPage`  
**Access:** ADMIN, DOCTOR, NURSE, RECEPTIONIST

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: "Appointments"                          [Book Appointment]  │
├─────────────────────────────────────────────────────────────────────┤
│ Filters Row:                                                        │
│ [Search Patient...] [Status ▼] [Doctor ▼] [Start Date] [End Date]  │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Patient      │ Doctor       │ Date/Time    │ Type   │ Status   │ │
│ ├──────────────┼──────────────┼──────────────┼────────┼──────────┤ │
│ │ Nguyen Van A │ Dr. Hung     │ Dec 5, 09:00 │ CONSUL │ 🔵SCHED  │ │
│ │ Tran Thi B   │ Dr. Mai      │ Dec 5, 10:00 │ FOLLOW │ 🟢COMPL  │ │
│ │ Le Van C     │ Dr. Hung     │ Dec 4, 14:00 │ CONSUL │ 🔴CANCEL │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ Showing 1-10 of 50                              [< 1 2 3 4 5 >]     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Filter Components

| Filter     | Type        | Options                                       | Default |
| ---------- | ----------- | --------------------------------------------- | ------- |
| Search     | Text Input  | Patient name search                           | Empty   |
| Status     | Select      | All, SCHEDULED, COMPLETED, CANCELLED, NO_SHOW | All     |
| Doctor     | Select      | List of active doctors                        | All     |
| Start Date | Date Picker | Any date                                      | Empty   |
| End Date   | Date Picker | Any date                                      | Empty   |

#### Table Columns

| Column    | Field                                   | Sortable           | Width |
| --------- | --------------------------------------- | ------------------ | ----- |
| Patient   | `patient.fullName`                      | Yes                | 20%   |
| Doctor    | `doctor.fullName` + `doctor.department` | Yes                | 20%   |
| Date/Time | `appointmentTime`                       | Yes (default desc) | 18%   |
| Type      | `type`                                  | No                 | 12%   |
| Status    | `status`                                | Yes                | 12%   |
| Actions   | -                                       | No                 | 18%   |

#### Action Buttons per Row

| Status    | Actions Available  |
| --------- | ------------------ |
| SCHEDULED | View, Edit, Cancel |
| COMPLETED | View               |
| CANCELLED | View               |
| NO_SHOW   | View               |

#### Status Badge Styles

| Status    | Color                                 | Icon      |
| --------- | ------------------------------------- | --------- |
| SCHEDULED | Blue (`bg-blue-100 text-blue-800`)    | 🕐 Clock  |
| COMPLETED | Green (`bg-green-100 text-green-800`) | ✓ Check   |
| CANCELLED | Red (`bg-red-100 text-red-800`)       | ✕ X       |
| NO_SHOW   | Gray (`bg-gray-100 text-gray-800`)    | ⚠ Warning |

---

### 3.2 Appointment Form Page (Create/Edit)

**Route:** `/admin/appointments/new` or `/admin/appointments/{id}/edit`  
**Component:** `AppointmentFormPage`  
**Access:** ADMIN, DOCTOR, NURSE, RECEPTIONIST

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: "Book Appointment" / "Reschedule Appointment"               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Patient Information                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Patient*        [Search patient by name or phone...    ▼]   │   │
│  │                 Selected: Nguyen Van A - 0901234567          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Doctor Selection                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Department      [All Departments                        ▼]   │   │
│  │ Doctor*         [Select doctor...                       ▼]   │   │
│  │                 Selected: Dr. Nguyen Van Hung - Cardiology   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Schedule Selection                                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Date*           [December 2025        ]                      │   │
│  │                 [S] [M] [T] [W] [T] [F] [S]                  │   │
│  │                      1   2   3   4   5   6                   │   │
│  │                  7   8   9  10  11  12  13                   │   │
│  │                                                              │   │
│  │ Time Slot*      [08:00] [08:30] [09:00] [09:30] ...         │   │
│  │                 (Booked slots shown disabled)                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Appointment Details                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Type*           (●) Consultation  ( ) Follow-up  ( ) Emergency│  │
│  │ Reason*         [Chief complaint / reason for visit...    ]  │   │
│  │ Notes           [Additional notes (staff only)...         ]  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                              [Cancel]  [Book Appointment]           │
└─────────────────────────────────────────────────────────────────────┘
```

#### Form Fields

| Field             | Type              | Required | Validation                         | Edit Mode |
| ----------------- | ----------------- | -------- | ---------------------------------- | --------- |
| `patientId`       | Searchable Select | Yes      | Must exist                         | Read-only |
| `doctorId`        | Searchable Select | Yes      | Must exist                         | Read-only |
| `appointmentTime` | DateTime Picker   | Yes      | Future date, within schedule       | Editable  |
| `type`            | Radio Group       | Yes      | CONSULTATION, FOLLOW_UP, EMERGENCY | Editable  |
| `reason`          | Textarea          | Yes      | Max 500 chars                      | Editable  |
| `notes`           | Textarea          | No       | Max 1000 chars                     | Editable  |

#### Field Specifications

**Patient Select:**

```typescript
interface PatientOption {
  value: string; // patient.id
  label: string; // patient.fullName
  subLabel: string; // patient.phoneNumber
}
// Search API: GET /api/patients?search={query}&size=10
```

**Doctor Select:**

```typescript
interface DoctorOption {
  value: string; // employee.id
  label: string; // employee.fullName
  subLabel: string; // department.name + specialization
}
// Filter API: GET /api/hr/employees?role=DOCTOR&departmentId={id}&status=ACTIVE
```

**Time Slot Grid:**

```typescript
interface TimeSlot {
  time: string; // "09:00"
  available: boolean; // false if booked
  current: boolean; // true if this is current appointment (edit mode)
}
// Duration: 30 minutes per slot
// Generate slots from schedule.startTime to schedule.endTime
// Check availability: GET /api/appointments?doctorId={id}&startDate={date}&endDate={date}
```

#### Validation Rules

| Field           | Rule     | Error Message                         |
| --------------- | -------- | ------------------------------------- |
| patientId       | Required | "Please select a patient"             |
| doctorId        | Required | "Please select a doctor"              |
| appointmentTime | Required | "Please select date and time"         |
| appointmentTime | Future   | "Appointment must be in the future"   |
| type            | Required | "Please select appointment type"      |
| reason          | Required | "Please enter reason for visit"       |
| reason          | Max 500  | "Reason cannot exceed 500 characters" |
| notes           | Max 1000 | "Notes cannot exceed 1000 characters" |

---

### 3.3 Appointment Detail Page

**Route:** `/admin/appointments/{id}` or `/doctor/appointments/{id}` or `/patient/appointments/{id}`  
**Component:** `AppointmentDetailPage`  
**Access:** ADMIN, DOCTOR, NURSE, RECEPTIONIST (all), PATIENT (own only)

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ [← Back]                                              [Edit] [Cancel]│
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────┐  ┌───────────────────────────┐│
│  │ Appointment #APT001             │  │ Status: 🔵 SCHEDULED      ││
│  │ Booked on Dec 2, 2025           │  │                           ││
│  └─────────────────────────────────┘  └───────────────────────────┘│
│                                                                     │
│  Patient Information                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Name:        Nguyen Van A                                    │   │
│  │ Phone:       0901234567                                      │   │
│  │ [View Patient Profile →]                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Doctor Information                                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Name:        Dr. Nguyen Van Hung                             │   │
│  │ Department:  Cardiology                                      │   │
│  │ Phone:       0901111111                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Appointment Details                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Date & Time: December 5, 2025 at 09:00 AM                    │   │
│  │ Type:        Consultation                                    │   │
│  │ Reason:      Chest pain                                      │   │
│  │ Notes:       Rescheduled per patient request                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  (If CANCELLED)                                                     │
│  Cancellation Details                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Cancelled At: December 4, 2025 at 11:00 AM                   │   │
│  │ Reason:       Patient recovered                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  (If COMPLETED - Link to Medical Exam)                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ [📋 View Medical Exam Record →]  [➕ Create Medical Exam]    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Actions (Based on Status & Role)                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ [Reschedule]  [Cancel Appointment]  [Mark as Completed]      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Audit Information                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Created: Dec 2, 2025 10:30 AM                                │   │
│  │ Last Updated: Dec 3, 2025 02:15 PM by admin@hms.com          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Conditional Actions by Status & Role

| Status    | ADMIN        | DOCTOR (Assigned)      | DOCTOR (Other) | NURSE        | PATIENT (Own) |
| --------- | ------------ | ---------------------- | -------------- | ------------ | ------------- |
| SCHEDULED | Edit, Cancel | Edit, Cancel, Complete | View           | Edit, Cancel | Cancel        |
| COMPLETED | View         | View, Create Exam      | View           | View         | View          |
| CANCELLED | View         | View                   | View           | View         | View          |
| NO_SHOW   | View         | View                   | View           | View         | View          |

---

### 3.4 Patient Booking Page

**Route:** `/patient/appointments/new`  
**Component:** `PatientBookingPage`  
**Access:** PATIENT only

#### Layout Structure (Step Wizard)

```
Step 1: Select Doctor
┌─────────────────────────────────────────────────────────────────────┐
│ Book an Appointment                                                 │
│ ─────────────────────────────────────────────────────────────────── │
│ Step 1 of 3: Choose Your Doctor                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Filter by Department: [All Departments ▼]                          │
│                                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │ 👤                   │  │ 👤                   │                  │
│  │ Dr. Nguyen Van Hung  │  │ Dr. Tran Thi Mai    │                  │
│  │ Cardiology           │  │ Pediatrics          │                  │
│  │ Interventional       │  │                     │                  │
│  │ Cardiology           │  │                     │                  │
│  │ [Select Doctor]      │  │ [Select Doctor]     │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
│                                                                     │
│                                           [Cancel]  [Next →]        │
└─────────────────────────────────────────────────────────────────────┘

Step 2: Select Date & Time
┌─────────────────────────────────────────────────────────────────────┐
│ Book an Appointment                                                 │
│ ─────────────────────────────────────────────────────────────────── │
│ Step 2 of 3: Choose Date & Time                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Selected Doctor: Dr. Nguyen Van Hung - Cardiology                  │
│                                                                     │
│  Select Date:                                                       │
│  ┌──────────────────────────────────────┐                          │
│  │        December 2025                  │                          │
│  │  Su  Mo  Tu  We  Th  Fr  Sa          │                          │
│  │       1   2   3   4  [5]  6          │  (Available dates        │
│  │   7   8  [9] 10  11  12  13          │   highlighted)           │
│  │  14  15  16  17  18  19  20          │                          │
│  └──────────────────────────────────────┘                          │
│                                                                     │
│  Available Time Slots (December 5):                                 │
│  [08:00] [08:30] [09:00] [̶0̶9̶:̶3̶0̶] [10:00] [10:30]                   │
│  [11:00] [11:30] [̶1̶3̶:̶0̶0̶] [13:30] [14:00] [14:30]                   │
│  (Strikethrough = booked)                                           │
│                                                                     │
│                                      [← Back]  [Cancel]  [Next →]   │
└─────────────────────────────────────────────────────────────────────┘

Step 3: Confirm Details
┌─────────────────────────────────────────────────────────────────────┐
│ Book an Appointment                                                 │
│ ─────────────────────────────────────────────────────────────────── │
│ Step 3 of 3: Confirm Your Appointment                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Appointment Summary                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Doctor:      Dr. Nguyen Van Hung                             │   │
│  │ Department:  Cardiology                                      │   │
│  │ Date:        December 5, 2025                                │   │
│  │ Time:        09:00 AM (30 minutes)                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Appointment Type*                                                  │
│  (●) Consultation  ( ) Follow-up  ( ) Emergency                     │
│                                                                     │
│  Reason for Visit*                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Describe your symptoms or reason for this appointment...     │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  0/500 characters                                                   │
│                                                                     │
│                                [← Back]  [Cancel]  [Confirm Booking]│
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.5 Patient Appointments List Page

**Route:** `/patient/appointments`  
**Component:** `PatientAppointmentPage`  
**Access:** PATIENT only

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ My Appointments                                  [Book Appointment] │
├─────────────────────────────────────────────────────────────────────┤
│ Filter: [All] [Upcoming] [Past] [Cancelled]                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Upcoming Appointments                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📅 December 5, 2025 at 09:00 AM           🔵 SCHEDULED      │   │
│  │ Dr. Nguyen Van Hung - Cardiology                            │   │
│  │ Consultation • Chest pain                                   │   │
│  │                                          [View] [Cancel]    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Past Appointments                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📅 November 28, 2025 at 10:00 AM          🟢 COMPLETED      │   │
│  │ Dr. Tran Thi Mai - Pediatrics                               │   │
│  │ Follow-up • Blood pressure check                            │   │
│  │                                          [View]             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📅 November 20, 2025 at 14:00 PM          🔴 CANCELLED      │   │
│  │ Dr. Nguyen Van Hung - Cardiology                            │   │
│  │ Consultation • Headache                                     │   │
│  │ Cancelled: Patient recovered                                │   │
│  │                                          [View]             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.6 Doctor Appointments Page

**Route:** `/doctor/appointments`  
**Component:** `DoctorAppointmentPage`  
**Access:** DOCTOR only

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ My Appointments                                   Today: Dec 4, 2025│
├─────────────────────────────────────────────────────────────────────┤
│ View: [Today] [This Week] [Calendar]     Filter: [All Statuses ▼]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Today's Schedule                                                   │
│  ┌──────────┬──────────────────────────────────────────────────┐   │
│  │ 09:00 AM │ Nguyen Van A • Consultation         🔵 SCHEDULED │   │
│  │          │ Chest pain                          [Start Visit]│   │
│  ├──────────┼──────────────────────────────────────────────────┤   │
│  │ 09:30 AM │ Tran Thi B • Follow-up              🔵 SCHEDULED │   │
│  │          │ Blood pressure check                             │   │
│  ├──────────┼──────────────────────────────────────────────────┤   │
│  │ 10:00 AM │ Le Van C • Consultation             🟢 COMPLETED │   │
│  │          │ Annual checkup                [View Exam Record] │   │
│  ├──────────┼──────────────────────────────────────────────────┤   │
│  │ 10:30 AM │ (Available)                                      │   │
│  ├──────────┼──────────────────────────────────────────────────┤   │
│  │ 11:00 AM │ Pham Van D • Emergency              🔵 SCHEDULED │   │
│  │          │ Severe headache                                  │   │
│  └──────────┴──────────────────────────────────────────────────┘   │
│                                                                     │
│  Statistics Today                                                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │ 5 Total    │ │ 3 Pending  │ │ 1 Completed│ │ 1 Cancelled│      │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Doctor-Specific Actions

| Action           | Description                                         |
| ---------------- | --------------------------------------------------- |
| Start Visit      | Mark as completed + redirect to create medical exam |
| View Exam Record | Navigate to medical exam detail (if exists)         |
| Cancel           | Cancel appointment with reason                      |

---

## 4. API Integration

### 4.1 API Service File

**File:** `services/appointment.service.ts`

```typescript
import api from "@/config/axios";

const BASE_URL = "/api/appointments";

export interface AppointmentCreateRequest {
  patientId: string;
  doctorId: string;
  appointmentTime: string; // ISO 8601: "2025-12-05T09:00:00"
  type: "CONSULTATION" | "FOLLOW_UP" | "EMERGENCY";
  reason: string;
}

export interface AppointmentUpdateRequest {
  appointmentTime?: string;
  type?: "CONSULTATION" | "FOLLOW_UP" | "EMERGENCY";
  reason?: string;
  notes?: string;
}

export interface AppointmentCancelRequest {
  cancelReason: string;
}

export interface AppointmentListParams {
  patientId?: string;
  doctorId?: string;
  status?: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  page?: number;
  size?: number;
  sort?: string;
}

export interface PatientSummary {
  id: string;
  fullName: string;
  phoneNumber?: string;
}

export interface DoctorSummary {
  id: string;
  fullName: string;
  department?: string;
  phoneNumber?: string;
}

export interface Appointment {
  id: string;
  patient: PatientSummary;
  doctor: DoctorSummary;
  appointmentTime: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  type: "CONSULTATION" | "FOLLOW_UP" | "EMERGENCY";
  reason: string;
  notes?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

const appointmentService = {
  // Create new appointment
  create: (data: AppointmentCreateRequest) =>
    api.post<{ status: string; data: Appointment }>(BASE_URL, data),

  // Get appointment by ID
  getById: (id: string) =>
    api.get<{ status: string; data: Appointment }>(`${BASE_URL}/${id}`),

  // List appointments with filters
  getList: (params: AppointmentListParams) =>
    api.get<{ status: string; data: PaginatedResponse<Appointment> }>(
      BASE_URL,
      { params },
    ),

  // Update appointment (reschedule)
  update: (id: string, data: AppointmentUpdateRequest) =>
    api.patch<{ status: string; data: Appointment }>(`${BASE_URL}/${id}`, data),

  // Cancel appointment
  cancel: (id: string, data: AppointmentCancelRequest) =>
    api.patch<{ status: string; data: Appointment }>(
      `${BASE_URL}/${id}/cancel`,
      data,
    ),

  // Complete appointment (doctor only)
  complete: (id: string) =>
    api.patch<{ status: string; data: Appointment }>(
      `${BASE_URL}/${id}/complete`,
    ),
};

export default appointmentService;
```

### 4.2 React Query Hooks

**File:** `hooks/queries/useAppointment.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import appointmentService, {
  AppointmentCreateRequest,
  AppointmentUpdateRequest,
  AppointmentCancelRequest,
  AppointmentListParams,
} from "@/services/appointment.service";
import { toast } from "sonner";

// Query Keys
export const appointmentKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentKeys.all, "list"] as const,
  list: (params: AppointmentListParams) =>
    [...appointmentKeys.lists(), params] as const,
  details: () => [...appointmentKeys.all, "detail"] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
};

// Get appointment list
export const useAppointmentList = (params: AppointmentListParams) => {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => appointmentService.getList(params),
    select: (response) => response.data.data,
  });
};

// Get appointment by ID
export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentService.getById(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

// Create appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AppointmentCreateRequest) =>
      appointmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      toast.success("Appointment booked successfully");
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = getAppointmentErrorMessage(errorCode);
      toast.error(errorMessage);
    },
  });
};

// Update appointment
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: AppointmentUpdateRequest;
    }) => appointmentService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      toast.success("Appointment rescheduled successfully");
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = getAppointmentErrorMessage(errorCode);
      toast.error(errorMessage);
    },
  });
};

// Cancel appointment
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: AppointmentCancelRequest;
    }) => appointmentService.cancel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      toast.success("Appointment cancelled successfully");
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = getAppointmentErrorMessage(errorCode);
      toast.error(errorMessage);
    },
  });
};

// Complete appointment
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      toast.success("Appointment marked as completed");
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = getAppointmentErrorMessage(errorCode);
      toast.error(errorMessage);
    },
  });
};

// Error message mapping
function getAppointmentErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    VALIDATION_ERROR: "Please check your input and try again",
    PAST_APPOINTMENT: "Cannot book appointments in the past",
    PATIENT_NOT_FOUND: "Patient not found",
    EMPLOYEE_NOT_FOUND: "Doctor not found",
    DOCTOR_NOT_AVAILABLE: "Doctor is not available on the selected date",
    TIME_SLOT_TAKEN: "Selected time slot is already booked",
    APPOINTMENT_NOT_FOUND: "Appointment not found",
    APPOINTMENT_NOT_MODIFIABLE:
      "Cannot modify completed, cancelled, or no-show appointments",
    APPOINTMENT_NOT_CANCELLABLE:
      "Cannot cancel completed or no-show appointments",
    ALREADY_CANCELLED: "Appointment is already cancelled",
    ALREADY_COMPLETED: "Appointment is already completed",
    APPOINTMENT_CANCELLED: "Cannot complete a cancelled appointment",
    APPOINTMENT_NO_SHOW: "Cannot complete a no-show appointment",
    FORBIDDEN: "You do not have permission to perform this action",
    UNAUTHORIZED: "Please log in to continue",
  };

  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
}
```

### 4.3 API Endpoints Reference

#### 4.3.1 Create Appointment

**Endpoint:** `POST /api/appointments`  
**Access:** ADMIN, DOCTOR, NURSE, RECEPTIONIST, PATIENT (own)

**Request:**

```json
{
  "patientId": "p001",
  "doctorId": "emp001",
  "appointmentTime": "2025-12-05T09:00:00",
  "type": "CONSULTATION",
  "reason": "Chest pain"
}
```

**Success Response:** `201 Created`

```json
{
  "status": "success",
  "data": {
    "id": "apt001",
    "patient": {
      "id": "p001",
      "fullName": "Nguyen Van A"
    },
    "doctor": {
      "id": "emp001",
      "fullName": "Dr. Nguyen Van Hung",
      "department": "Cardiology"
    },
    "appointmentTime": "2025-12-05T09:00:00",
    "status": "SCHEDULED",
    "type": "CONSULTATION",
    "reason": "Chest pain",
    "createdAt": "2025-12-02T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Code                 | Message                                   | UI Action                 |
| ------ | -------------------- | ----------------------------------------- | ------------------------- |
| 400    | VALIDATION_ERROR     | Field validation failed                   | Show field errors         |
| 400    | PAST_APPOINTMENT     | appointmentTime cannot be in the past     | Show toast error          |
| 404    | PATIENT_NOT_FOUND    | Patient ID doesn't exist                  | Show toast error          |
| 404    | EMPLOYEE_NOT_FOUND   | Doctor ID doesn't exist                   | Show toast error          |
| 409    | DOCTOR_NOT_AVAILABLE | Doctor has no schedule for this date/time | Show toast error          |
| 409    | TIME_SLOT_TAKEN      | Time slot already booked                  | Show toast, refresh slots |

---

#### 4.3.2 Get Appointment by ID

**Endpoint:** `GET /api/appointments/{id}`  
**Access:** Authenticated (own) | ADMIN, DOCTOR, NURSE, RECEPTIONIST (all)

**Success Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "apt001",
    "patient": {
      "id": "p001",
      "fullName": "Nguyen Van A",
      "phoneNumber": "0901234567"
    },
    "doctor": {
      "id": "emp001",
      "fullName": "Dr. Nguyen Van Hung",
      "department": "Cardiology",
      "phoneNumber": "0901111111"
    },
    "appointmentTime": "2025-12-05T09:00:00",
    "status": "SCHEDULED",
    "type": "CONSULTATION",
    "reason": "Chest pain",
    "notes": null,
    "cancelledAt": null,
    "cancelReason": null,
    "createdAt": "2025-12-02T10:30:00Z",
    "updatedAt": "2025-12-02T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Code                  | Message                                      | UI Action         |
| ------ | --------------------- | -------------------------------------------- | ----------------- |
| 401    | UNAUTHORIZED          | Missing or invalid access token              | Redirect to login |
| 403    | FORBIDDEN             | User not authorized to view this appointment | Show 403 page     |
| 404    | APPOINTMENT_NOT_FOUND | Appointment doesn't exist                    | Show 404 page     |

---

#### 4.3.3 List Appointments

**Endpoint:** `GET /api/appointments`  
**Access:** Authenticated (PATIENT sees own only, Staff sees all)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| patientId | string | No | - | Filter by patient (ignored for PATIENT role) |
| doctorId | string | No | - | Filter by doctor |
| status | string | No | - | SCHEDULED, COMPLETED, CANCELLED, NO_SHOW |
| startDate | date | No | - | Filter from date (YYYY-MM-DD) |
| endDate | date | No | - | Filter until date (YYYY-MM-DD) |
| page | integer | No | 0 | Page number (0-indexed) |
| size | integer | No | 20 | Page size (max: 100) |
| sort | string | No | appointmentTime,desc | Sort field and direction |

**Success Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "content": [
      {
        "id": "apt001",
        "patient": {
          "id": "p001",
          "fullName": "Nguyen Van A"
        },
        "doctor": {
          "id": "emp001",
          "fullName": "Dr. Nguyen Van Hung",
          "department": "Cardiology"
        },
        "appointmentTime": "2025-12-05T09:00:00",
        "status": "SCHEDULED",
        "type": "CONSULTATION",
        "reason": "Chest pain"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
}
```

**Error Responses:**

| Status | Code             | Message                         | UI Action         |
| ------ | ---------------- | ------------------------------- | ----------------- |
| 401    | UNAUTHORIZED     | Missing or invalid access token | Redirect to login |
| 400    | VALIDATION_ERROR | Invalid query parameters        | Show toast error  |

**Validation Error Details:**

- `page must be >= 0`
- `size must be between 1 and 100`
- `startDate must be valid ISO 8601 date`
- `endDate must be valid ISO 8601 date`
- `startDate cannot be after endDate`

---

#### 4.3.4 Update Appointment

**Endpoint:** `PATCH /api/appointments/{id}`  
**Access:** ADMIN, DOCTOR, NURSE, RECEPTIONIST

**Request:** (All fields optional)

```json
{
  "appointmentTime": "2025-12-05T10:00:00",
  "type": "FOLLOW_UP",
  "reason": "Follow-up consultation",
  "notes": "Rescheduled per patient request"
}
```

**Success Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "apt001",
    "patient": {
      "id": "p001",
      "fullName": "Nguyen Van A"
    },
    "doctor": {
      "id": "emp001",
      "fullName": "Dr. Nguyen Van Hung",
      "department": "Cardiology"
    },
    "appointmentTime": "2025-12-05T10:00:00",
    "status": "SCHEDULED",
    "type": "FOLLOW_UP",
    "reason": "Follow-up consultation",
    "notes": "Rescheduled per patient request",
    "createdAt": "2025-12-02T10:30:00Z",
    "updatedAt": "2025-12-02T11:00:00Z",
    "updatedBy": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

**Error Responses:**

| Status | Code                       | Message                                   | UI Action                 |
| ------ | -------------------------- | ----------------------------------------- | ------------------------- |
| 401    | UNAUTHORIZED               | Missing or invalid access token           | Redirect to login         |
| 400    | VALIDATION_ERROR           | Field validation failed                   | Show field errors         |
| 400    | PAST_APPOINTMENT           | appointmentTime cannot be in the past     | Show toast error          |
| 400    | APPOINTMENT_NOT_MODIFIABLE | Cannot modify COMPLETED/CANCELLED/NO_SHOW | Show toast error          |
| 403    | FORBIDDEN                  | User role not authorized                  | Show 403 page             |
| 404    | APPOINTMENT_NOT_FOUND      | Appointment doesn't exist                 | Show 404 page             |
| 409    | DOCTOR_NOT_AVAILABLE       | Doctor has no schedule for new date/time  | Show toast error          |
| 409    | TIME_SLOT_TAKEN            | New time slot already booked              | Show toast, refresh slots |

**Validation Error Details:**

- `appointmentTime must be valid ISO 8601 datetime`
- `type must be one of [CONSULTATION, FOLLOW_UP, EMERGENCY]`
- `reason exceeds maximum length (500 characters)`
- `notes exceeds maximum length (1000 characters)`

---

#### 4.3.5 Cancel Appointment

**Endpoint:** `PATCH /api/appointments/{id}/cancel`  
**Access:** ADMIN, DOCTOR, NURSE, RECEPTIONIST, PATIENT (own)

**Request:**

```json
{
  "cancelReason": "Patient recovered"
}
```

**Success Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "apt001",
    "status": "CANCELLED",
    "cancelledAt": "2025-12-02T11:00:00Z",
    "cancelReason": "Patient recovered",
    "updatedAt": "2025-12-02T11:00:00Z",
    "updatedBy": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

**Error Responses:**

| Status | Code                        | Message                                 | UI Action         |
| ------ | --------------------------- | --------------------------------------- | ----------------- |
| 401    | UNAUTHORIZED                | Missing or invalid access token         | Redirect to login |
| 400    | VALIDATION_ERROR            | cancelReason is required                | Show field error  |
| 400    | APPOINTMENT_NOT_CANCELLABLE | Cannot cancel COMPLETED or NO_SHOW      | Show toast error  |
| 400    | ALREADY_CANCELLED           | Appointment is already cancelled        | Show toast info   |
| 403    | FORBIDDEN                   | User not authorized (patients own only) | Show toast error  |
| 404    | APPOINTMENT_NOT_FOUND       | Appointment doesn't exist               | Show 404 page     |

**Validation Error Details:**

- `cancelReason is required`
- `cancelReason exceeds maximum length (500 characters)`

---

#### 4.3.6 Complete Appointment

**Endpoint:** `PATCH /api/appointments/{id}/complete`  
**Access:** DOCTOR only (assigned doctor)

**Request:** No body required

**Success Response:** `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "apt001",
    "patient": {
      "id": "p001",
      "fullName": "Nguyen Van A"
    },
    "doctor": {
      "id": "emp001",
      "fullName": "Dr. Nguyen Van Hung"
    },
    "appointmentTime": "2025-12-05T09:00:00",
    "status": "COMPLETED",
    "type": "CONSULTATION",
    "reason": "Chest pain",
    "updatedAt": "2025-12-05T10:30:00Z",
    "updatedBy": "emp001"
  }
}
```

**Error Responses:**

| Status | Code                  | Message                               | UI Action         |
| ------ | --------------------- | ------------------------------------- | ----------------- |
| 401    | UNAUTHORIZED          | Missing or invalid access token       | Redirect to login |
| 400    | ALREADY_COMPLETED     | Appointment already completed         | Show toast info   |
| 400    | APPOINTMENT_CANCELLED | Cannot complete cancelled appointment | Show toast error  |
| 400    | APPOINTMENT_NO_SHOW   | Cannot complete no-show appointment   | Show toast error  |
| 403    | FORBIDDEN             | Only assigned doctor can complete     | Show toast error  |
| 404    | APPOINTMENT_NOT_FOUND | Appointment doesn't exist             | Show 404 page     |

---

## 5. Shared Components

### 5.1 Component Registry

| Component                  | Purpose                          | Used In                           |
| -------------------------- | -------------------------------- | --------------------------------- |
| `AppointmentStatusBadge`   | Display status with color coding | List, Detail                      |
| `AppointmentTypeBadge`     | Display type with icon           | List, Detail                      |
| `PatientSearchSelect`      | Searchable patient dropdown      | Create/Edit Form                  |
| `DoctorSearchSelect`       | Searchable doctor dropdown       | Create/Edit Form                  |
| `TimeSlotPicker`           | 30-min slot selection grid       | Create/Edit Form, Patient Booking |
| `AppointmentCalendar`      | Calendar with availability       | Patient Booking                   |
| `CancelAppointmentModal`   | Confirmation with reason input   | Detail Page                       |
| `CompleteAppointmentModal` | Confirmation for completion      | Detail Page (Doctor)              |
| `AppointmentCard`          | Card layout for patient view     | Patient List                      |

### 5.2 AppointmentStatusBadge Component

```typescript
// components/appointment/AppointmentStatusBadge.tsx

interface Props {
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  SCHEDULED: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "🕐",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: "✓",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: "✕",
  },
  NO_SHOW: {
    label: "No Show",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "⚠",
  },
};

export function AppointmentStatusBadge({ status, size = "md" }: Props) {
  const config = statusConfig[status];
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.5",
    lg: "text-base px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.className} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
```

### 5.3 AppointmentTypeBadge Component

```typescript
// components/appointment/AppointmentTypeBadge.tsx

interface Props {
  type: "CONSULTATION" | "FOLLOW_UP" | "EMERGENCY";
}

const typeConfig = {
  CONSULTATION: {
    label: "Consultation",
    className: "bg-purple-100 text-purple-800",
    icon: "🩺",
  },
  FOLLOW_UP: {
    label: "Follow-up",
    className: "bg-cyan-100 text-cyan-800",
    icon: "🔄",
  },
  EMERGENCY: {
    label: "Emergency",
    className: "bg-orange-100 text-orange-800",
    icon: "🚨",
  },
};

export function AppointmentTypeBadge({ type }: Props) {
  const config = typeConfig[type];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
```

### 5.4 TimeSlotPicker Component

```typescript
// components/appointment/TimeSlotPicker.tsx

interface TimeSlot {
  time: string; // "09:00"
  datetime: string; // "2025-12-05T09:00:00"
  available: boolean;
  current?: boolean; // true if editing current appointment
}

interface Props {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelect: (datetime: string) => void;
  disabled?: boolean;
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelect,
  disabled,
}: Props) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
      {slots.map((slot) => (
        <button
          key={slot.datetime}
          type="button"
          disabled={disabled || !slot.available}
          onClick={() => onSelect(slot.datetime)}
          className={cn(
            "px-3 py-2 text-sm font-medium rounded-md border transition-colors",
            {
              "bg-primary text-primary-foreground border-primary":
                selectedSlot === slot.datetime,
              "bg-white hover:bg-gray-50 border-gray-300":
                slot.available && selectedSlot !== slot.datetime,
              "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed":
                !slot.available,
              "ring-2 ring-offset-2 ring-blue-500": slot.current,
            }
          )}
        >
          {slot.time}
          {slot.current && <span className="block text-xs">(Current)</span>}
        </button>
      ))}
    </div>
  );
}

// Utility to generate time slots
export function generateTimeSlots(
  date: string,
  startTime: string,
  endTime: string,
  bookedSlots: string[],
  currentSlot?: string
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    const time = `${String(currentHour).padStart(2, "0")}:${String(
      currentMin
    ).padStart(2, "0")}`;
    const datetime = `${date}T${time}:00`;

    slots.push({
      time,
      datetime,
      available: !bookedSlots.includes(datetime) || datetime === currentSlot,
      current: datetime === currentSlot,
    });

    // Increment by 30 minutes
    currentMin += 30;
    if (currentMin >= 60) {
      currentMin = 0;
      currentHour += 1;
    }
  }

  return slots;
}
```

### 5.5 CancelAppointmentModal Component

```typescript
// components/appointment/CancelAppointmentModal.tsx

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  appointmentInfo?: {
    patientName: string;
    doctorName: string;
    appointmentTime: string;
  };
}

export function CancelAppointmentModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  appointmentInfo,
}: Props) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Please provide a cancellation reason");
      return;
    }
    if (reason.length > 500) {
      setError("Reason cannot exceed 500 characters");
      return;
    }
    onConfirm(reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>

        {appointmentInfo && (
          <div className="bg-gray-50 p-3 rounded-md text-sm">
            <p>
              <strong>Patient:</strong> {appointmentInfo.patientName}
            </p>
            <p>
              <strong>Doctor:</strong> {appointmentInfo.doctorName}
            </p>
            <p>
              <strong>Time:</strong>{" "}
              {formatDateTime(appointmentInfo.appointmentTime)}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="cancelReason">Cancellation Reason *</Label>
          <Textarea
            id="cancelReason"
            placeholder="Please provide a reason for cancellation..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError("");
            }}
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {error && <span className="text-red-500">{error}</span>}
            </span>
            <span>{reason.length}/500</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Cancelling..." : "Cancel Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 5.6 PatientSearchSelect Component

```typescript
// components/appointment/PatientSearchSelect.tsx

interface PatientOption {
  value: string;
  label: string;
  phoneNumber?: string;
}

interface Props {
  value: string | null;
  onChange: (value: string, patient: PatientOption) => void;
  disabled?: boolean;
  error?: string;
}

export function PatientSearchSelect({
  value,
  onChange,
  disabled,
  error,
}: Props) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients", "search", debouncedSearch],
    queryFn: () =>
      patientService.getList({ search: debouncedSearch, size: 10 }),
    select: (response) =>
      response.data.data.content.map((p) => ({
        value: p.id,
        label: p.fullName,
        phoneNumber: p.phoneNumber,
      })),
    enabled: debouncedSearch.length >= 2,
  });

  return (
    <div className="space-y-1">
      <Combobox
        value={value}
        onChange={(val) => {
          const patient = patients?.find((p) => p.value === val);
          if (patient) onChange(val, patient);
        }}
      >
        <ComboboxInput
          placeholder="Search patient by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
        />
        <ComboboxOptions>
          {isLoading && <ComboboxOption disabled>Loading...</ComboboxOption>}
          {patients?.map((patient) => (
            <ComboboxOption key={patient.value} value={patient.value}>
              <div className="flex justify-between">
                <span>{patient.label}</span>
                <span className="text-gray-500">{patient.phoneNumber}</span>
              </div>
            </ComboboxOption>
          ))}
          {patients?.length === 0 && !isLoading && (
            <ComboboxOption disabled>No patients found</ComboboxOption>
          )}
        </ComboboxOptions>
      </Combobox>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

### 5.7 DoctorSearchSelect Component

```typescript
// components/appointment/DoctorSearchSelect.tsx

interface DoctorOption {
  value: string;
  label: string;
  department?: string;
  specialization?: string;
}

interface Props {
  value: string | null;
  onChange: (value: string, doctor: DoctorOption) => void;
  departmentId?: string;
  disabled?: boolean;
  error?: string;
}

export function DoctorSearchSelect({
  value,
  onChange,
  departmentId,
  disabled,
  error,
}: Props) {
  const { data: doctors, isLoading } = useQuery({
    queryKey: ["employees", "doctors", departmentId],
    queryFn: () =>
      employeeService.getList({
        role: "DOCTOR",
        departmentId,
        status: "ACTIVE",
        size: 100,
      }),
    select: (response) =>
      response.data.data.content.map((d) => ({
        value: d.id,
        label: d.fullName,
        department: d.department?.name,
        specialization: d.specialization,
      })),
  });

  return (
    <div className="space-y-1">
      <Select
        value={value ?? ""}
        onValueChange={(val) => {
          const doctor = doctors?.find((d) => d.value === val);
          if (doctor) onChange(val, doctor);
        }}
        disabled={disabled || isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a doctor..." />
        </SelectTrigger>
        <SelectContent>
          {doctors?.map((doctor) => (
            <SelectItem key={doctor.value} value={doctor.value}>
              <div>
                <span className="font-medium">{doctor.label}</span>
                <span className="text-gray-500 ml-2">
                  {doctor.department}
                  {doctor.specialization && ` • ${doctor.specialization}`}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

### 5.8 AppointmentCard Component (Patient View)

```typescript
// components/appointment/AppointmentCard.tsx

interface Props {
  appointment: {
    id: string;
    doctor: { fullName: string; department?: string };
    appointmentTime: string;
    status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
    type: "CONSULTATION" | "FOLLOW_UP" | "EMERGENCY";
    reason: string;
    cancelReason?: string;
  };
  onView: () => void;
  onCancel?: () => void;
}

export function AppointmentCard({ appointment, onView, onCancel }: Props) {
  const isUpcoming =
    appointment.status === "SCHEDULED" &&
    new Date(appointment.appointmentTime) > new Date();

  return (
    <Card
      className={cn("p-4", { "border-blue-200 bg-blue-50/30": isUpcoming })}
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <span className="font-medium">
              {formatDate(appointment.appointmentTime)} at{" "}
              {formatTime(appointment.appointmentTime)}
            </span>
          </div>
          <p className="text-gray-600">
            {appointment.doctor.fullName}
            {appointment.doctor.department &&
              ` - ${appointment.doctor.department}`}
          </p>
          <div className="flex items-center gap-2">
            <AppointmentTypeBadge type={appointment.type} />
            <span className="text-sm text-gray-500">
              • {appointment.reason}
            </span>
          </div>
          {appointment.status === "CANCELLED" && appointment.cancelReason && (
            <p className="text-sm text-red-600">
              Cancelled: {appointment.cancelReason}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <AppointmentStatusBadge status={appointment.status} />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onView}>
              View
            </Button>
            {appointment.status === "SCHEDULED" && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-red-600"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
```

---

## 6. Error Handling & Validation

### 6.1 API Error Response Format

All API errors follow this standard format:

```typescript
interface ApiErrorResponse {
  status: "error";
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}
```

### 6.2 Complete Error Code Reference

#### 6.2.1 Authentication & Authorization Errors

| HTTP Status | Error Code   | Description                               | UI Handling                                                         |
| ----------- | ------------ | ----------------------------------------- | ------------------------------------------------------------------- |
| 401         | UNAUTHORIZED | Missing or invalid access token           | Redirect to `/login`, clear auth state                              |
| 403         | FORBIDDEN    | User role not authorized for action       | Show toast "You don't have permission to perform this action"       |
| 403         | FORBIDDEN    | Patients can only access own appointments | Show toast "You can only view your own appointments"                |
| 403         | FORBIDDEN    | Only assigned doctor can complete         | Show toast "Only the assigned doctor can complete this appointment" |

#### 6.2.2 Validation Errors (400 VALIDATION_ERROR)

**Create Appointment Validation:**

| Field           | Validation Rule | Error Message                                              |
| --------------- | --------------- | ---------------------------------------------------------- |
| patientId       | Required        | "patientId is required"                                    |
| doctorId        | Required        | "doctorId is required"                                     |
| appointmentTime | Required        | "appointmentTime is required"                              |
| appointmentTime | Valid ISO 8601  | "appointmentTime must be valid ISO 8601 datetime"          |
| type            | Required        | "type is required"                                         |
| type            | Enum check      | "type must be one of [CONSULTATION, FOLLOW_UP, EMERGENCY]" |
| reason          | Max length      | "reason exceeds maximum length (500 characters)"           |

**Update Appointment Validation:**

| Field           | Validation Rule | Error Message                                              |
| --------------- | --------------- | ---------------------------------------------------------- |
| appointmentTime | Valid ISO 8601  | "appointmentTime must be valid ISO 8601 datetime"          |
| type            | Enum check      | "type must be one of [CONSULTATION, FOLLOW_UP, EMERGENCY]" |
| reason          | Max length      | "reason exceeds maximum length (500 characters)"           |
| notes           | Max length      | "notes exceeds maximum length (1000 characters)"           |

**Cancel Appointment Validation:**

| Field        | Validation Rule | Error Message                                          |
| ------------ | --------------- | ------------------------------------------------------ |
| cancelReason | Required        | "cancelReason is required"                             |
| cancelReason | Max length      | "cancelReason exceeds maximum length (500 characters)" |

**List Query Parameters Validation:**

| Parameter         | Validation Rule | Error Message                           |
| ----------------- | --------------- | --------------------------------------- |
| page              | Non-negative    | "page must be >= 0"                     |
| size              | Range 1-100     | "size must be between 1 and 100"        |
| startDate         | Valid date      | "startDate must be valid ISO 8601 date" |
| endDate           | Valid date      | "endDate must be valid ISO 8601 date"   |
| startDate/endDate | Date range      | "startDate cannot be after endDate"     |

#### 6.2.3 Business Logic Errors (400)

| Error Code                  | Description                     | When Triggered                     | UI Handling                                                              |
| --------------------------- | ------------------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| PAST_APPOINTMENT            | Appointment time is in the past | Create/Update with past datetime   | Show toast "Cannot book appointments in the past", highlight date field  |
| APPOINTMENT_NOT_MODIFIABLE  | Cannot modify non-SCHEDULED     | Update COMPLETED/CANCELLED/NO_SHOW | Show toast "Cannot modify completed, cancelled, or no-show appointments" |
| APPOINTMENT_NOT_CANCELLABLE | Cannot cancel COMPLETED/NO_SHOW | Cancel COMPLETED or NO_SHOW        | Show toast "Cannot cancel completed or no-show appointments"             |
| ALREADY_CANCELLED           | Appointment already cancelled   | Cancel already cancelled           | Show toast info "Appointment is already cancelled"                       |
| ALREADY_COMPLETED           | Appointment already completed   | Complete already completed         | Show toast info "Appointment is already completed"                       |
| APPOINTMENT_CANCELLED       | Cannot complete cancelled       | Complete cancelled appointment     | Show toast "Cannot complete a cancelled appointment"                     |
| APPOINTMENT_NO_SHOW         | Cannot complete no-show         | Complete no-show appointment       | Show toast "Cannot complete a no-show appointment"                       |

#### 6.2.4 Resource Not Found Errors (404)

| Error Code            | Description               | When Triggered                             | UI Handling                                         |
| --------------------- | ------------------------- | ------------------------------------------ | --------------------------------------------------- |
| APPOINTMENT_NOT_FOUND | Appointment doesn't exist | Get/Update/Cancel/Complete with invalid ID | Show 404 page or toast "Appointment not found"      |
| PATIENT_NOT_FOUND     | Patient doesn't exist     | Create with invalid patientId              | Show toast "Patient not found", clear patient field |
| EMPLOYEE_NOT_FOUND    | Doctor doesn't exist      | Create with invalid doctorId               | Show toast "Doctor not found", clear doctor field   |

#### 6.2.5 Conflict Errors (409)

| Error Code           | Description               | When Triggered                 | UI Handling                                                                                  |
| -------------------- | ------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| DOCTOR_NOT_AVAILABLE | No schedule for date/time | Create/Update outside schedule | Show toast "Doctor is not available on the selected date", prompt to select different date   |
| TIME_SLOT_TAKEN      | Time slot already booked  | Create/Update to booked slot   | Show toast "Selected time slot is already booked", refresh time slots, disable selected slot |

### 6.3 Client-Side Validation

#### 6.3.1 Form Validation Schema (Zod)

```typescript
import { z } from "zod";

// Create Appointment Schema
export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  doctorId: z.string().min(1, "Please select a doctor"),
  appointmentTime: z
    .string()
    .min(1, "Please select date and time")
    .refine((val) => {
      const date = new Date(val);
      return date > new Date();
    }, "Appointment must be in the future"),
  type: z.enum(["CONSULTATION", "FOLLOW_UP", "EMERGENCY"], {
    required_error: "Please select appointment type",
  }),
  reason: z
    .string()
    .min(1, "Please enter reason for visit")
    .max(500, "Reason cannot exceed 500 characters"),
});

// Update Appointment Schema
export const updateAppointmentSchema = z.object({
  appointmentTime: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      return date > new Date();
    }, "Appointment must be in the future"),
  type: z.enum(["CONSULTATION", "FOLLOW_UP", "EMERGENCY"]).optional(),
  reason: z.string().max(500, "Reason cannot exceed 500 characters").optional(),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

// Cancel Appointment Schema
export const cancelAppointmentSchema = z.object({
  cancelReason: z
    .string()
    .min(1, "Please provide a cancellation reason")
    .max(500, "Reason cannot exceed 500 characters"),
});

// Type exports
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
```

#### 6.3.2 Form Implementation with React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function AppointmentForm({ mode, initialData, onSubmit }) {
  const schema =
    mode === "create" ? createAppointmentSchema : updateAppointmentSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      patientId: "",
      doctorId: "",
      appointmentTime: "",
      type: "CONSULTATION",
      reason: "",
      notes: "",
    },
  });

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Handle server-side validation errors
      if (error.response?.data?.error?.code === "VALIDATION_ERROR") {
        const details = error.response.data.error.details;
        details?.forEach(({ field, message }) => {
          form.setError(field, { message });
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

### 6.4 Error Display Components

#### 6.4.1 Field Error Display

```typescript
// components/ui/FormFieldError.tsx
interface Props {
  error?: string;
}

export function FormFieldError({ error }: Props) {
  if (!error) return null;

  return (
    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
      <span>⚠</span>
      <span>{error}</span>
    </p>
  );
}
```

#### 6.4.2 Toast Error Handler

```typescript
// utils/errorHandler.ts
import { toast } from "sonner";

export function handleApiError(
  error: any,
  defaultMessage = "An error occurred",
) {
  const errorCode = error.response?.data?.error?.code;
  const errorMessage = error.response?.data?.error?.message;

  // Map error codes to user-friendly messages
  const errorMessages: Record<string, string> = {
    UNAUTHORIZED: "Please log in to continue",
    FORBIDDEN: "You do not have permission to perform this action",
    VALIDATION_ERROR: errorMessage || "Please check your input",
    PAST_APPOINTMENT: "Cannot book appointments in the past",
    PATIENT_NOT_FOUND: "Patient not found",
    EMPLOYEE_NOT_FOUND: "Doctor not found",
    DOCTOR_NOT_AVAILABLE: "Doctor is not available on the selected date",
    TIME_SLOT_TAKEN: "Selected time slot is already booked",
    APPOINTMENT_NOT_FOUND: "Appointment not found",
    APPOINTMENT_NOT_MODIFIABLE: "Cannot modify this appointment",
    APPOINTMENT_NOT_CANCELLABLE: "Cannot cancel this appointment",
    ALREADY_CANCELLED: "Appointment is already cancelled",
    ALREADY_COMPLETED: "Appointment is already completed",
    APPOINTMENT_CANCELLED: "Cannot complete a cancelled appointment",
    APPOINTMENT_NO_SHOW: "Cannot complete a no-show appointment",
  };

  const message = errorMessages[errorCode] || errorMessage || defaultMessage;

  // Use different toast types based on error severity
  if (errorCode === "UNAUTHORIZED") {
    toast.error(message, {
      action: { label: "Login", onClick: () => router.push("/login") },
    });
  } else if (["ALREADY_CANCELLED", "ALREADY_COMPLETED"].includes(errorCode)) {
    toast.info(message);
  } else {
    toast.error(message);
  }
}
```

### 6.5 Loading States

| State        | UI Behavior                                               |
| ------------ | --------------------------------------------------------- |
| Initial Load | Show skeleton loader for table/cards                      |
| Form Submit  | Disable submit button, show spinner, text "Booking..."    |
| Cancellation | Disable modal buttons, show spinner, text "Cancelling..." |
| Completion   | Disable button, show spinner, text "Completing..."        |
| Refetching   | Show subtle loading indicator (not full skeleton)         |

### 6.6 Empty States

| Scenario                  | Message                               | Action                                     |
| ------------------------- | ------------------------------------- | ------------------------------------------ |
| No appointments (admin)   | "No appointments found"               | "Adjust filters or book a new appointment" |
| No appointments (patient) | "You don't have any appointments yet" | "Book Your First Appointment" button       |
| No upcoming (patient)     | "No upcoming appointments"            | "Book New Appointment" button              |
| Search no results         | "No appointments match your search"   | "Clear filters" link                       |

---

## Appendix A: TypeScript Interfaces

```typescript
// interfaces/appointment.ts

export type AppointmentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
export type AppointmentType = "CONSULTATION" | "FOLLOW_UP" | "EMERGENCY";

export interface PatientSummary {
  id: string;
  fullName: string;
  phoneNumber?: string;
}

export interface DoctorSummary {
  id: string;
  fullName: string;
  department?: string;
  phoneNumber?: string;
}

export interface Appointment {
  id: string;
  patient: PatientSummary;
  doctor: DoctorSummary;
  appointmentTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  notes?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface AppointmentListItem {
  id: string;
  patient: Pick<PatientSummary, "id" | "fullName">;
  doctor: Pick<DoctorSummary, "id" | "fullName" | "department">;
  appointmentTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
}

export interface CreateAppointmentRequest {
  patientId: string;
  doctorId: string;
  appointmentTime: string;
  type: AppointmentType;
  reason: string;
}

export interface UpdateAppointmentRequest {
  appointmentTime?: string;
  type?: AppointmentType;
  reason?: string;
  notes?: string;
}

export interface CancelAppointmentRequest {
  cancelReason: string;
}

export interface AppointmentListParams {
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaginatedAppointments {
  content: AppointmentListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

---

## Appendix B: Implementation Checklist

### B.1 Pages to Implement

- [ ] `/admin/appointments` - AppointmentListPage
- [ ] `/admin/appointments/new` - AppointmentFormPage (create mode)
- [ ] `/admin/appointments/{id}` - AppointmentDetailPage
- [ ] `/admin/appointments/{id}/edit` - AppointmentFormPage (edit mode)
- [ ] `/doctor/appointments` - DoctorAppointmentPage
- [ ] `/doctor/appointments/{id}` - AppointmentDetailPage (doctor context)
- [ ] `/patient/appointments` - PatientAppointmentPage
- [ ] `/patient/appointments/new` - PatientBookingPage
- [ ] `/patient/appointments/{id}` - AppointmentDetailPage (patient context)

### B.2 Components to Build

- [ ] AppointmentStatusBadge
- [ ] AppointmentTypeBadge
- [ ] PatientSearchSelect
- [ ] DoctorSearchSelect
- [ ] TimeSlotPicker
- [ ] AppointmentCalendar
- [ ] CancelAppointmentModal
- [ ] CompleteAppointmentModal
- [ ] AppointmentCard

### B.3 Services & Hooks

- [ ] appointment.service.ts
- [ ] useAppointment.ts (React Query hooks)

### B.4 API Integration Checklist

- [ ] POST /api/appointments (create)
- [ ] GET /api/appointments/{id} (get by ID)
- [ ] GET /api/appointments (list with filters)
- [ ] PATCH /api/appointments/{id} (update)
- [ ] PATCH /api/appointments/{id}/cancel (cancel)
- [ ] PATCH /api/appointments/{id}/complete (complete)

### B.5 Cross-Service Integration

- [ ] GET /api/patients (patient search)
- [ ] GET /api/hr/employees?role=DOCTOR (doctor list)
- [ ] GET /api/hr/schedules (doctor availability)

### B.6 Testing Scenarios

**Happy Path:**

- [ ] Book appointment successfully
- [ ] View appointment list with filters
- [ ] View appointment detail
- [ ] Reschedule appointment
- [ ] Cancel appointment
- [ ] Complete appointment (doctor)

**Error Scenarios:**

- [ ] Validation errors displayed correctly
- [ ] PAST_APPOINTMENT error handling
- [ ] TIME_SLOT_TAKEN error handling (refresh slots)
- [ ] DOCTOR_NOT_AVAILABLE error handling
- [ ] Permission denied (FORBIDDEN) handling
- [ ] Not found (404) handling
- [ ] Network error handling

**Edge Cases:**

- [ ] Patient can only see/cancel own appointments
- [ ] Only assigned doctor can complete
- [ ] Cannot modify COMPLETED/CANCELLED/NO_SHOW
- [ ] Time slots refresh when date changes
- [ ] Concurrent booking conflict handling

Beta
0 / 0
used queries
1
