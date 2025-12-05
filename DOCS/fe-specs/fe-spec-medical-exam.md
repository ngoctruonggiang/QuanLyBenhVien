# Medical Exam Service - Frontend Specification

**Project:** Hospital Management System  
**Service:** Medical Exam Service (Clinical Notes & Prescriptions)  
**Version:** 1.0  
**Last Updated:** December 5, 2025  
**Target Users:** DOCTOR (primary author), NURSE (can draft vitals), ADMIN (oversight), PATIENT (read-only to their own results)

---

## 1. Overview & Screen Inventory

### 1.1 Service Scope

The Medical Exam Service manages clinical encounter records that are created after (or during) an appointment. It provides:

- Medical exam creation and editing (linked to an appointment)
- Vitals capture (temperature, blood pressure, heart rate, weight, height)
- Diagnosis, symptoms, treatment plan, physician notes
- Prescription creation/update (per exam)
- Exam listing with filters (patient, doctor, status, date range)
- Exam detail view with print/export
- Patient-facing view of their own exam results and prescription

### 1.2 Related Backend

| Item          | Value                 |
| ------------- | --------------------- |
| **Service**   | medical-exam-service  |
| **Port**      | 8086                  |
| **Base Path** | `/api/medical-exams`  |
| **Database**  | `medical_exam_db`     |
| **Tables**    | `medical_exams`, `prescriptions`, `prescription_items` |

### 1.3 Cross-Service Dependencies

| Service                 | Purpose                                   | Endpoints Used                                               |
| ----------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| **Appointment Service** | Validate appointment, link status         | `GET /api/appointments/{id}`                                 |
| **HR Service**          | Doctor metadata                            | `GET /api/hr/employees/{id}`                                 |
| **Patient Service**     | Patient metadata                           | `GET /api/patients/{id}`                                     |
| **Pharmacy/Inventory** (if available) | Medicine lookup for prescriptions | `GET /api/pharmacy/medicines?search=`                        |

### 1.4 Screen Inventory

| Route                                        | Screen Name                    | Component                     | Access                 | Priority |
| -------------------------------------------- | ------------------------------ | ----------------------------- | ---------------------- | -------- |
| `/admin/exams`                               | Medical Exam List (Admin)      | `MedicalExamListPage`         | ADMIN, DOCTOR          | P0       |
| `/admin/exams/new`                           | Create Medical Exam            | `MedicalExamFormPage`         | DOCTOR, NURSE*         | P0       |
| `/admin/exams/{id}`                          | Medical Exam Detail            | `MedicalExamDetailPage`       | ADMIN, DOCTOR          | P0       |
| `/admin/exams/{id}/edit`                     | Edit Medical Exam              | `MedicalExamFormPage`         | DOCTOR                 | P1       |
| `/admin/exams/{id}/prescription`             | Manage Prescription            | `PrescriptionFormPage`        | DOCTOR                 | P0       |
| `/doctor/exams`                              | My Exam Records                | `DoctorExamListPage`          | DOCTOR                 | P1       |
| `/doctor/appointments/{id}/exam`             | Create from Appointment        | `MedicalExamFormPage`         | DOCTOR                 | P0       |
| `/patient/appointments/{id}/exam`            | View Exam Result (Patient)     | `PatientExamDetailPage`       | PATIENT (own only)     | P1       |

\*NURSE can draft vitals/symptoms but doctor must finalize.

### 1.5 Screen Hierarchy Diagram

```
/admin
└── /exams
    ├── (list)
    ├── /new (create)
    ├── /{id} (detail)
    ├── /{id}/edit (edit exam)
    └── /{id}/prescription (create/update prescription)

/doctor
└── /appointments/{id}/exam (prefilled create)

/patient
└── /appointments/{id}/exam (read-only result + prescription)
```

---

## 2. User Flows & Acceptance Criteria

### 2.1 Flow: Create Medical Exam (Doctor)

```
Doctor opens /doctor/appointments/{id}/exam
          ↓
System preloads appointment, patient, doctor info
          ↓
Doctor enters vitals, symptoms, diagnosis, treatment, notes
          ↓
Doctor clicks "Save & Finalize"
          ↓
[Validation Pass] → POST /api/medical-exams
          ↓
Toast "Exam saved", redirect to exam detail
```

**Acceptance Criteria:**

- [ ] Appointment ID required; must exist and belong to the doctor (or ADMIN override)
- [ ] Auto-fill patient name/id and doctor name/id from appointment; read-only
- [ ] Default status: PENDING until finalized; FINALIZED after doctor confirms
- [ ] Required fields: appointmentId, diagnosis, symptoms, treatment
- [ ] Vitals optional but validated ranges (see Validation)
- [ ] Success toast: "Medical exam saved successfully"
- [ ] Error APPOINTMENT_NOT_FOUND → show "Appointment not found"
- [ ] Error FORBIDDEN (doctor mismatch) → show "You are not assigned to this appointment"
- [ ] Error EXAM_ALREADY_EXISTS → show "An exam already exists for this appointment"

---

### 2.2 Flow: Edit Medical Exam (Doctor)

```
Doctor navigates to /admin/exams/{id}/edit
          ↓
System loads current exam
          ↓
Doctor updates fields (Vitals, Diagnosis, Treatment, Notes)
          ↓
Doctor clicks "Save Changes"
          ↓
PATCH /api/medical-exams/{id}
          ↓
Toast "Exam updated", redirect to detail
```

**Acceptance Criteria:**

- [ ] Only PENDING or IN_PROGRESS exams can be edited; FINALIZED requires ADMIN override
- [ ] Appointment, patient, doctor fields are read-only
- [ ] Error EXAM_NOT_EDITABLE → show "Exam cannot be edited after finalization or cancellation"
- [ ] Error EXAM_NOT_FOUND → show 404 page or toast
- [ ] Notes max 2000 characters
- [ ] Success toast: "Medical exam updated successfully"

---

### 2.3 Flow: Manage Prescription (Doctor)

```
Doctor opens /admin/exams/{id}/prescription
          ↓
Existing prescription (if any) is loaded
          ↓
Doctor adds medicine rows (medicine, dosage, quantity, duration, notes)
          ↓
Doctor saves
          ↓
POST or PUT /api/medical-exams/{id}/prescription
          ↓
Toast "Prescription saved", return to exam detail
```

**Acceptance Criteria:**

- [ ] At least one medicine item required
- [ ] Fields per item: medicineId (or name), dosage, quantity, duration; notes optional
- [ ] Quantity must be positive integer; dosage/duration required
- [ ] Error MEDICINE_NOT_FOUND (when using medicineId) → show "Medicine not found"
- [ ] Error PRESCRIPTION_ALREADY_EXISTS on POST → show "Prescription already exists, please update instead"
- [ ] Success toast on create/update; exam detail shows prescription badge

---

### 2.4 Flow: View Medical Exam Detail (Doctor/Admin)

```
User opens /admin/exams/{id}
          ↓
GET /api/medical-exams/{id}
          ↓
Show exam summary: patient, doctor, appointment link, status badge
          ↓
Show vitals, diagnosis, symptoms, treatment, notes, timestamps
          ↓
Show prescription section (if present) with print button
          ↓
Actions based on status/role:
  - PENDING/IN_PROGRESS: Edit, Add Prescription
  - FINALIZED: Print/Export only
  - CANCELLED: View only with cancel reason
```

**Acceptance Criteria:**

- [ ] Status badge: PENDING (amber), IN_PROGRESS (blue), FINALIZED (green), CANCELLED (red)
- [ ] Link back to appointment detail
- [ ] Show createdBy/updatedBy with timestamps
- [ ] Print/Export to PDF button visible when data loaded
- [ ] If prescription exists, show items in table with dosage/duration
- [ ] Error 404 → show not found page

---

### 2.5 Flow: List Medical Exams (Admin/Doctor)

```
User opens /admin/exams
          ↓
System loads paginated exams with filters:
  - Search (patient/doctor/diagnosis)
  - Status
  - Date range (examDate)
          ↓
User clicks row → Exam detail
```

**Acceptance Criteria:**

- [ ] Columns: ID, Patient, Doctor, Diagnosis, Exam Date/Time, Status, Actions
- [ ] Search debounced (300ms) across patient, doctor, diagnosis
- [ ] Status filter: All, PENDING, IN_PROGRESS, FINALIZED, CANCELLED
- [ ] Date range filter optional; max range 90 days
- [ ] Pagination sizes: 10, 20, 50
- [ ] Loading skeleton on fetch; empty state with call-to-action "Create Exam"
- [ ] Row click or "View" button navigates to detail
- [ ] DOCTOR role: only see exams where doctorId matches current user

---

### 2.6 Flow: Patient Views Exam Result

```
Patient opens /patient/appointments/{id}/exam
          ↓
GET exam by appointmentId (must belong to patient)
          ↓
Display read-only exam and prescription
```

**Acceptance Criteria:**

- [ ] Patient access restricted to their own appointment/exam
- [ ] Hide internal notes (createdBy, updatedBy) from patient view
- [ ] Show friendly status text and prescription items
- [ ] Show disclaimer: "This summary is for reference; contact your doctor for questions."
- [ ] Error FORBIDDEN → toast and redirect to `/patient/appointments`
- [ ] Error EXAM_NOT_FOUND → show "Exam not available yet"

---

## 3. Screen Specifications

### 3.1 Medical Exam List Page

**Route:** `/admin/exams`  
**Component:** `MedicalExamListPage`

**Component Hierarchy**

```
MedicalExamListPage
├── PageHeader (title, description, "Create Exam" button)
├── FiltersBar
│   ├── SearchInput
│   ├── StatusSelect
│   └── DateRangePicker
├── DataTable
│   ├── Columns: ID, Patient, Doctor, Diagnosis, Exam Date, Status, Actions
│   ├── RowActions: View
│   └── EmptyState
└── Pagination
```

**Behavior**

- Debounced search input
- Table rows clickable
- Status badges color-coded
- Skeleton rows while loading; empty state with CTA when no data
- Error toast on fetch failure; retry button

### 3.2 Medical Exam Form Page

**Routes:** `/admin/exams/new`, `/admin/exams/{id}/edit`, `/doctor/appointments/{id}/exam`  
**Component:** `MedicalExamFormPage`

**Sections**

- Appointment Info (read-only: appointmentId, patient, doctor, scheduled time)
- Vitals (temperature, BP sys/dia, heart rate, weight, height)
- Clinical Details (symptoms, diagnosis, treatment)
- Additional Notes
- Actions: Save Draft, Save & Finalize, Cancel (back)

**Rules**

- Save Draft → status PENDING, stays on page
- Save & Finalize → status FINALIZED, redirect to detail
- Disable buttons while submitting; show spinner text "Saving..."
- Validation errors shown inline; server validation mapped to fields

### 3.3 Exam Detail Page

**Route:** `/admin/exams/{id}`, `/patient/appointments/{id}/exam`  
**Component:** `MedicalExamDetailPage` / `PatientExamDetailPage`

**Layout**

- Header: Status badge, appointment link, patient + doctor summary, timestamps
- Vitals Card: temperature, BP, heart rate, weight, height (hide empty rows)
- Diagnosis & Symptoms Card
- Treatment & Notes Card
- Prescription Card (if exists) with table of medicines
- Actions (role-based): Edit, Manage Prescription, Print PDF
- Audit info (createdBy/At, updatedBy/At) hidden on patient view

**States**

- Loading skeleton
- Error: 404 page or toast
- No prescription: show "No prescription added yet" with button (doctor only)

### 3.4 Prescription Form Page

**Route:** `/admin/exams/{id}/prescription`  
**Component:** `PrescriptionFormPage`

**Features**

- Dynamic rows for medicines
- Autocomplete search for medicine (if backend provided) or free-text name
- Inputs: dosage (text), quantity (number), duration (text), notes
- Add/Remove row buttons
- Summary of exam (patient, doctor, diagnosis) at top
- Buttons: Save, Cancel
- Inline validation errors per row

### 3.5 Patient Exam View

**Route:** `/patient/appointments/{id}/exam`  
**Component:** `PatientExamDetailPage`

- Read-only cards for exam and prescription
- Remove internal identifiers; show friendly labels
- Link back to `/patient/appointments`
- Display disclaimer text and contact CTA

---

## 4. API Integration

### 4.1 Endpoints

| Method | Path                                      | Purpose                       |
| ------ | ----------------------------------------- | ----------------------------- |
| GET    | `/api/medical-exams`                      | List exams with filters       |
| GET    | `/api/medical-exams/{id}`                 | Get exam by ID                |
| GET    | `/api/medical-exams/by-appointment/{id}`  | Get exam by appointment ID    |
| POST   | `/api/medical-exams`                      | Create exam                   |
| PATCH  | `/api/medical-exams/{id}`                 | Update exam                   |
| POST   | `/api/medical-exams/{id}/prescription`    | Create prescription           |
| PUT    | `/api/medical-exams/{id}/prescription`    | Update prescription           |
| DELETE | `/api/medical-exams/{id}/prescription`    | Delete prescription (optional)|

### 4.2 List Query Params

| Param       | Type   | Notes                                       |
| ----------- | ------ | ------------------------------------------- |
| `page`      | number | 0-based                                     |
| `size`      | number | 1-100                                       |
| `search`    | string | patient/doctor/diagnosis                    |
| `status`    | string | PENDING, IN_PROGRESS, FINALIZED, CANCELLED  |
| `startDate` | date   | ISO date (examDate >= start)                |
| `endDate`   | date   | ISO date (examDate <= end)                  |
| `doctorId`  | string | Restrict to doctor                          |
| `patientId` | string | Restrict to patient                         |

### 4.3 Client Hook Expectations

- Use React Query with cache keys:
  - `["medical-exams", page, size, search, status, startDate, endDate]`
  - `["medical-exam", id]`
  - `["medical-exam-by-appointment", appointmentId]`
- Retry: none on 4xx, up to 1 retry on 5xx
- Stale time: 2 minutes for list, 1 minute for detail
- Invalidations: after create/update/prescription update, invalidate list and detail

---

## 5. Error Handling & Validation

### 5.1 API Error Format

```typescript
interface ApiErrorResponse {
  status: "error";
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}
```

### 5.2 Error Codes

| HTTP | Code                       | Description                                    | UI Handling                                           |
| ---- | -------------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| 401  | UNAUTHORIZED               | Missing/invalid token                          | Redirect to `/login`, clear auth                      |
| 403  | FORBIDDEN                  | Access denied (role/ownership)                 | Toast "You don't have permission"                     |
| 403  | APPOINTMENT_OWNER_MISMATCH | Doctor not assigned to appointment             | Toast "You are not assigned to this appointment"      |
| 404  | APPOINTMENT_NOT_FOUND      | Appointment ID invalid                         | Toast "Appointment not found", highlight field        |
| 404  | EXAM_NOT_FOUND             | Exam ID invalid                                | 404 page or toast                                     |
| 404  | PRESCRIPTION_NOT_FOUND     | No prescription exists when updating/deleting  | Toast "Prescription not found"                        |
| 409  | EXAM_ALREADY_EXISTS        | Exam already created for appointment           | Toast "Exam already exists for this appointment"      |
| 409  | PRESCRIPTION_ALREADY_EXISTS| Prescription exists (POST)                     | Toast "Prescription already exists, please update"    |
| 400  | VALIDATION_ERROR           | Field validation failed                        | Map details to form fields                            |
| 400  | EXAM_NOT_EDITABLE          | Attempt to edit finalized/cancelled exam       | Toast "Exam cannot be edited after finalization"      |

### 5.3 Validation Rules

**Exam**

| Field                 | Rule                                            | Message                                            |
| --------------------- | ----------------------------------------------- | -------------------------------------------------- |
| appointmentId         | Required                                        | "appointmentId is required"                        |
| diagnosis             | Required, max 1000 chars                        | "diagnosis is required" / "diagnosis too long"     |
| symptoms              | Required, max 2000 chars                        | "symptoms are required"                            |
| treatment             | Required, max 2000 chars                        | "treatment is required"                            |
| notes                 | Max 2000 chars                                  | "notes exceeds maximum length"                     |
| temperature           | Number 30-45                                    | "temperature must be between 30 and 45"            |
| bloodPressureSystolic | Number 50-250                                   | "bloodPressureSystolic must be between 50 and 250" |
| bloodPressureDiastolic| Number 30-150                                   | "bloodPressureDiastolic must be between 30 and 150"|
| heartRate             | Number 30-250                                   | "heartRate must be between 30 and 250"             |
| weight                | Number 1-500                                    | "weight must be between 1 and 500"                 |
| height                | Number 1-300                                    | "height must be between 1 and 300"                 |

**Prescription Item**

| Field      | Rule                    | Message                                  |
| ---------- | ----------------------- | ---------------------------------------- |
| medicineId | Required                | "medicineId is required"                 |
| quantity   | Integer >=1             | "quantity must be at least 1"            |
| dosage     | Required, max 255 chars | "dosage is required"                     |
| duration   | Required, max 255 chars | "duration is required"                   |
| notes      | Max 500 chars           | "notes exceeds maximum length"           |

### 5.4 Client-Side Schemas (Zod)

```typescript
export const medicalExamSchema = z.object({
  appointmentId: z.string().min(1, "Please select an appointment"),
  diagnosis: z.string().min(1, "Diagnosis is required").max(1000),
  symptoms: z.string().min(1, "Symptoms are required").max(2000),
  treatment: z.string().min(1, "Treatment plan is required").max(2000),
  temperature: z.coerce.number().min(30).max(45).optional(),
  bloodPressureSystolic: z.coerce.number().min(50).max(250).optional(),
  bloodPressureDiastolic: z.coerce.number().min(30).max(150).optional(),
  heartRate: z.coerce.number().min(30).max(250).optional(),
  weight: z.coerce.number().min(1).max(500).optional(),
  height: z.coerce.number().min(1).max(300).optional(),
  notes: z.string().max(2000).optional(),
});

export const prescriptionItemSchema = z.object({
  medicineId: z.string().min(1, "Medicine is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  dosage: z.string().min(1, "Dosage is required").max(255),
  duration: z.string().min(1, "Duration is required").max(255),
  notes: z.string().max(500).optional(),
});

export const prescriptionSchema = z.object({
  items: z.array(prescriptionItemSchema).min(1, "At least one medicine is required"),
  notes: z.string().max(1000).optional(),
});
```

### 5.5 Loading & Empty States

| Scenario        | UI Behavior                                        |
| --------------- | -------------------------------------------------- |
| Initial load    | Skeleton cards/table rows, disabled actions        |
| Form submit     | Disable buttons, show spinner text (Saving...)     |
| Detail refetch  | Subtle spinner in header                           |
| Empty list      | Message "No exams found" + "Create Exam" CTA       |
| No prescription | Message with "Add Prescription" button (doctor)    |

---

## Appendix A: TypeScript Interfaces

```typescript
export type ExamStatus = "PENDING" | "IN_PROGRESS" | "FINALIZED" | "CANCELLED";

export interface MedicalExam {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  status: ExamStatus;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  weight?: number;
  height?: number;
  notes?: string;
  examDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  prescription?: Prescription;
}

export interface MedicalExamRequest {
  appointmentId: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  weight?: number;
  height?: number;
  notes?: string;
  status?: ExamStatus; // optional for finalize
}

export interface PrescriptionItem {
  medicineId: string;
  medicineName?: string; // For display
  quantity: number;
  dosage: string;
  duration: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  medicalExamId: string;
  items: PrescriptionItem[];
  notes?: string;
  createdAt: string;
}

export interface CreatePrescriptionRequest {
  medicalExamId: string;
  items: Omit<PrescriptionItem, "medicineName">[];
  notes?: string;
}

export interface MedicalExamListItem {
  id: string;
  patient: { id: string; fullName: string };
  doctor: { id: string; fullName: string };
  diagnosis: string;
  examDate: string;
  status: ExamStatus;
}

export interface PaginatedExams {
  content: MedicalExamListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
```

---

## Appendix B: Implementation Checklist

- [ ] Exam list page with filters, pagination, loading/empty states
- [ ] Exam form page (create/edit) with validation and draft/finalize actions
- [ ] Detail page showing vitals, diagnosis, treatment, notes, prescription
- [ ] Prescription form with dynamic rows and validation
- [ ] Patient exam view (read-only, own appointment only)
- [ ] React Query hooks for list/detail/create/update/prescription
- [ ] Status badges and role-based action visibility
- [ ] Error handling mapped to codes (forbidden, not found, already exists, not editable)
- [ ] Print/Export action (PDF) placeholder
- [ ] E2E happy paths: create exam, edit exam, add prescription, patient view result
- [ ] Error scenarios: EXAM_ALREADY_EXISTS, EXAM_NOT_EDITABLE, medicine not found
