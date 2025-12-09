# Admin FE Spec Checklist

This checklist maps every admin-facing modal/page described in `DOCS/fe-specs/*.md` to the routes/flows implemented under `app/admin`. Use it to confirm that every route, component, and acceptance criterion described in the spec has a corresponding implementation and automated/checklist validation.

## 1. Appointment Service (`DOCS/fe-specs/fe-spec-appointment-service.md`)

| Route                           | Feature / Page                   | Roles                                            | Priority | Notes                                       |
| ------------------------------- | -------------------------------- | ------------------------------------------------ | -------- | ------------------------------------------- |
| `/admin/appointments`           | Appointment List                 | `AppointmentListPage`                            | P0       | `app/admin/appointments/page.tsx`           |
| `/admin/appointments/new`       | Create Appointment               | `AppointmentFormPage`                            | P0       | `app/admin/appointments/new/page.tsx`       |
| `/admin/appointments/{id}`      | Appointment Detail               | `AppointmentDetailPage`                          | P0       | `app/admin/appointments/[id]/page.tsx`      |
| `/admin/appointments/{id}/edit` | Edit Appointment                 | `AppointmentFormPage`                            | P1       | `app/admin/appointments/[id]/edit/page.tsx` |
| `/doctor/appointments`          | Doctor Appointments              | `DoctorAppointmentPage` (shared w/ admin detail) | P0       |
| `/doctor/appointments/{id}`     | Appointment Detail (Doctor)      | `AppointmentDetailPage`                          | P0       |
| `/patient/appointments`         | My Appointments (Patient portal) | `PatientAppointmentPage`                         | P0       |
| `/patient/appointments/new`     | Book Appointment (Patient)       | `PatientBookingPage`                             | P0       |
| `/patient/appointments/{id}`    | Appointment Detail (Patient)     | `AppointmentDetailPage`                          | P1       |

### Checklist

- [ ] `/admin/appointments` loads in ≤2s, renders patient/doctor/date/type/status columns, filters (search, doctor dropdown, status toggle, date range), pagination (10/20/50), sorting, skeleton loading, empty state, and status badges per spec (SCHEDULED=blue, COMPLETED=green, CANCELLED=red, NO_SHOW=gray).
- [ ] `/admin/appointments/new` enforces patient & doctor search dropdowns, loads doctor availability, renders slot grid (30-minute increments), disables unavailable/booked slots, validates type/reason/datetime, surfaces `Booked` toast + redirects, and handles 404/409/400 errors listed in spec.
- [ ] Detail page shows patient/doctor info, datetime, type, status, reason, notes; shows actions per status/role (Edit/Cancel for SCHEDULED, Complete for assigned doctor, Completed links to exam); includes cancel modal & reason capture, and links to exam when available.
- [ ] Edit/reschedule flow restricts to SCHEDULED entries, treats patient/doctor as read-only, validates new slot availability, enforces error handling (TIME_SLOT_TAKEN, APPOINTMENT_NOT_MODIFIABLE), and shows success toast/redirect per spec.
- [ ] Cancel dialog requires reason (≤500 chars), shows warnings about non-cancellable statuses (completed/no-show), updates badge, and surfaces all listed errors.
- [ ] Complete flow exposes button only to assigned doctor, shows confirmation, handles FORBIDDEN/ALREADY_COMPLETED/NO_SHOW errors, marks appointment completed, and surfaces action to create a medical exam.
- [ ] Patient self-service routes (`/patient/appointments`, `/patient/appointments/new`, `/patient/appointments/{id}`) auto-fill patient info, allow department/doctor filtering, show calendar slots, confirm booking with modal, and share the same error handling as the admin flow.

## 2. Patient Service (`DOCS/fe-specs/fe-spec-patient-service.md`)

| Route                         | Feature / Page   | Roles                | Priority | Notes                                      |
| ----------------------------- | ---------------- | -------------------- | -------- | ------------------------------------------ |
| `/admin/patients`             | Patient List     | `PatientListPage`    | P0       | see `app/admin/patients/page.tsx`          |
| `/admin/patients/new`         | Register Patient | `PatientFormPage`    | P0       | `app/admin/patients/new/page.tsx`          |
| `/admin/patients/:id`         | Patient Detail   | `PatientDetailPage`  | P0       | `app/admin/patients/[id]/page.tsx`         |
| `/admin/patients/:id/edit`    | Edit Patient     | `PatientFormPage`    | P0       | `app/admin/patients/[id]/edit/page.tsx`    |
| `/admin/patients/:id/history` | Patient History  | `PatientHistoryPage` | P1       | `app/admin/patients/[id]/history/page.tsx` |
| `/profile`                    | My Profile       | `MyProfilePage`      | P0       | patient self-service                       |
| `/profile/edit`               | Edit My Profile  | `MyProfileEditPage`  | P1       | patient self-service                       |

### Checklist

- [ ] Patient list filters by name/phone/email/ID, provides gender & blood type pickers, pagination (10/20/50), sorting (name, created date, DOB), hides soft-deleted records, and shows loading/empty states per spec Section 2.1.
- [ ] Register form exposes the four collapsible sections (personal info, health info, emergency contact, optional account linking), enforces required fields (Full Name, Phone, DOB), valid email/phone/ISO date, allergy tags, and shows success/error toasts + navigation described in Section 2.2.
- [ ] Patient detail view renders Overview/Health Info/Emergency Contact tabs, quick actions (Edit, View History, Book Appointment), and no gaps between the spec’s tab structure in Section 2.3.
- [ ] Edit page reuses `PatientFormPage`, pre-fills existing info, enforces the same validation as registration, and handles 404/soft delete states as noted in Section 2.4.
- [ ] History page presents the medical history timeline, matches the acceptance list in Section 2.5, and exposes “Back to patient” links.
- [ ] Patient self-service `/profile` and `/profile/edit` allow viewing/updating a subset of fields with same validation + confirm/cancel flows referenced at the bottom of Section 2.
- [ ] Ensure delete/soft-delete flows (if reachable from UI) respect the spec’s requirements (confirmation dialog, toast, no actual hard delete unless documented).

## 3. Billing Service (`DOCS/fe-specs/fe-spec-billing-service.md`)

| Route                         | Feature / Page           | Roles                    | Priority | Notes                                     |
| ----------------------------- | ------------------------ | ------------------------ | -------- | ----------------------------------------- |
| `/admin/billing`              | Invoice List (Admin)     | `InvoiceListPage`        | P0       | `app/admin/billing/page.tsx`              |
| `/admin/billing/{id}`         | Invoice Detail           | `InvoiceDetailPage`      | P0       | `app/admin/billing/[id]/page.tsx`         |
| `/admin/billing/{id}/payment` | Record Payment           | `PaymentFormPage`        | P0       | `app/admin/billing/[id]/payment/page.tsx` |
| `/admin/billing/payments`     | Payment History          | `PaymentListPage`        | P1       | `app/admin/billing/payments/page.tsx`     |
| `/patient/billing`            | My Invoices              | `PatientInvoiceListPage` | P0       | patient portal                            |
| `/patient/billing/{id}`       | Invoice Detail (Patient) | `InvoiceDetailPage`      | P0       | shared                                    |
| `/patient/billing/{id}/pay`   | Make Payment (Patient)   | `PatientPaymentPage`     | P1       | patient portal                            |

### Checklist

- [ ] Invoice list shows Invoice #, Patient, Date, Total, Paid, Balance, Status; supports search (patient/invoice), status filters (UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED), date range filters, pagination, sorting, skeleton, empty state, and quick action buttons per Section 2.1.
- [ ] Invoice detail displays header info, line items, payment history, balance calculation, status badge, and action links (`Record Payment` for outstanding invoices) as described in Section 2.2.
- [ ] Record payment form validates amount ≤ balance, payment method selection, creates payment via `/payment` route, and surfaces success/error toasts (Edge cases: 409 for duplicate, 400 for invalid amount) as described in Section 2.3.
- [ ] Payment history page includes filters, columns (Payment ID, Invoice ID, Amount, Method, Status, Date), and pagination; ties back to spec Section 2.4.
- [ ] Patient portal displays own invoices, detail view, and payment flow (max payment per invoice, OTP/confirmation flows if described); ensure roles/responses follow Section 3.
- [ ] Summary metrics (total/unpaid/overdue) appear in the invoice list header (per screen inventory notes) and stay in sync with backend responses.

## 4. HR Service (`DOCS/fe-specs/fe-spec-hr-service.md`)

| Route                            | Feature / Page       | Roles                  | Priority | Notes                                              |
| -------------------------------- | -------------------- | ---------------------- | -------- | -------------------------------------------------- |
| `/admin/hr/departments`          | Department List      | `DepartmentListPage`   | P0       | `app/admin/hr/departments/page.tsx`                |
| `/admin/hr/departments/new`      | Create Department    | `DepartmentFormPage`   | P0       | `app/admin/hr/departments/new/page.tsx`            |
| `/admin/hr/departments/:id`      | Department Detail    | `DepartmentDetailPage` | P1       | `app/admin/hr/departments/[id]/page.tsx`           |
| `/admin/hr/departments/:id/edit` | Edit Department      | `DepartmentFormPage`   | P0       | `app/admin/hr/departments/[id]/edit/page.tsx`      |
| `/admin/hr/employees`            | Employee List        | `EmployeeListPage`     | P0       | `app/admin/hr/employees/page.tsx`                  |
| `/admin/hr/employees/new`        | Create Employee      | `EmployeeFormPage`     | P0       | `app/admin/hr/employees/new/page.tsx`              |
| `/admin/hr/employees/:id`        | Employee Detail      | `EmployeeDetailPage`   | P1       | `app/admin/hr/employees/[id]/page.tsx`             |
| `/admin/hr/employees/:id/edit`   | Edit Employee        | `EmployeeFormPage`     | P0       | `app/admin/hr/employees/[id]/edit/page.tsx`        |
| `/admin/hr/schedules`            | Schedule Calendar    | `ScheduleCalendarPage` | P0       | `app/admin/hr/schedules/page.tsx`                  |
| `/admin/hr/schedules/new`        | Create Schedule      | `ScheduleFormModal`    | P0       | modal inside `app/admin/hr/schedules/page.tsx`     |
| `/doctor/schedules`              | Doctor Schedule View | `MySchedulesPage`      | P1       | `app/admin/hr/scheduling/page.tsx` / doctor layout |

### Checklist

- [ ] Department list supports pagination/filters, shows Name, Location, Head Doctor, Status, and respects soft-deleted/inactive rows with proper badges (per Section 2.1).
- [ ] Create/Edit Department forms enforce required fields, show Head Doctor dropdown (Active doctors only), handle 409 errors, and show toast+redirects as described in Sections 2.1.2–2.1.3; delete flow shows confirmation modal and handles 409 when departments still have staff.
- [ ] Employee list + filters (department, role, status) and actions match Section 2.2; detail view shows profile info, status pill, and `Edit`/`Back` navigation.
- [ ] Employee creation/edit forms validate required fields, allow department assignment, and enforce role/status constraints; detail layout reuses `EmployeeFormPage`.
- [ ] Schedule calendar renders doctor availability, shows existing events, opens `ScheduleForm` modal for `/admin/hr/schedules/new`, and allows editing/rescheduling (dedicated components in `_components`).
- [ ] ScheduleForm modal validates date/time ranges, shift selection, status (AVAILABLE/BOOKED), saves via API, and reflects on the calendar without full reload.
- [ ] Doctor-facing schedule view (`/doctor/schedules` or `/admin/hr/scheduling`) shows personal roster, separate filtering, and read-only capabilities described under Section 2.3.

## 5. Medical Exam Service (`DOCS/fe-specs/fe-spec-medical-exam.md`)

| Route                             | Feature / Page          | Roles                   | Priority | Notes                                        |
| --------------------------------- | ----------------------- | ----------------------- | -------- | -------------------------------------------- |
| `/admin/exams`                    | Medical Exam List       | `MedicalExamListPage`   | P0       | `app/admin/exams/page.tsx`                   |
| `/admin/exams/new`                | Create Medical Exam     | `MedicalExamFormPage`   | P0       | `app/admin/exams/new/page.tsx`               |
| `/admin/exams/{id}`               | Medical Exam Detail     | `MedicalExamDetailPage` | P0       | `app/admin/exams/[id]/page.tsx`              |
| `/admin/exams/{id}/edit`          | Edit Medical Exam       | `MedicalExamFormPage`   | P1       | `app/admin/exams/[id]/edit/page.tsx`         |
| `/admin/exams/{id}/prescription`  | Manage Prescription     | `PrescriptionFormPage`  | P0       | `app/admin/exams/[id]/prescription/page.tsx` |
| `/doctor/exams`                   | Doctor Exam List        | `DoctorExamListPage`    | P1       | may reuse admin list with filters            |
| `/doctor/appointments/{id}/exam`  | Create from Appointment | `MedicalExamFormPage`   | P0       | route reused by doctor                       |
| `/patient/appointments/{id}/exam` | View Exam Result        | `PatientExamDetailPage` | P1       | patient facing detail                        |

### Checklist

- [ ] Exam list supports filtering by patient/doctor/status/date, shows summary columns, phase badges, pagination, and skeleton states as described in Section 1.4 & 2.1.
- [ ] Create exam form pre-fills appointment/patient/doctor info, enforces required diagnosis/treatment/symptoms fields, validates vitals ranges, and surfaces `Success/Error` toasts + redirection per Section 2.1.
- [ ] Detail page displays vitals, diagnosis, treatment plan, notes, and quick link to prescription (if exists); handles 404 and permission errors gracefully.
- [ ] Edit exam page restricts to editable statuses (PENDING/IN_PROGRESS), keeps appointment/patient read-only, validates changes, and shows `Exam updated successfully` toast as outlined in Section 2.2.
- [ ] Prescription management allows dynamic rows (medicine, dosage, qty, duration), enforces at least one line, validates numeric fields, and saves via POST/PUT (per Section 2.3).
- [ ] Doctor-specific flows (`/doctor/appointments/{id}/exam`, `/doctor/exams`) reuse the same forms with doctor-only permissions and summary views referenced in Section 1.4.
- [ ] Patient-facing exam detail page renders results/prescription, honoring access-control notes in Section 1.4 & 2.4.

## 6. Reports Service (`DOCS/fe-specs/fe-spec-reports-service.md`)

| Route                                | Feature / Page         | Roles                   | Priority | Notes                                            |
| ------------------------------------ | ---------------------- | ----------------------- | -------- | ------------------------------------------------ |
| `/admin/reports`                     | Reports Dashboard      | `ReportsDashboardPage`  | P0       | `app/admin/reports/page.tsx`                     |
| `/admin/reports/revenue`             | Revenue Report         | `RevenueReportPage`     | P0       | `app/admin/reports/revenue/page.tsx`             |
| `/admin/reports/appointments`        | Appointment Statistics | `AppointmentStatsPage`  | P0       | `app/admin/reports/appointments/page.tsx`        |
| `/admin/reports/doctors/performance` | Doctor Performance     | `DoctorPerformancePage` | P1       | `app/admin/reports/doctors/performance/page.tsx` |
| `/admin/reports/patients/activity`   | Patient Activity       | `PatientActivityPage`   | P1       | `app/admin/reports/patients/activity/page.tsx`   |

### Checklist

- [ ] Dashboard loads cached summary cards (revenue, appointments, active patients/doctors), quick charts, and navigation cards; includes refresh button, skeleton states, and partial error handling per Section 2.1.
- [ ] Revenue report exposes filters (date range, department, payment method), default to current month, max one-year window, includes summary metrics + charts, and offers CSV/PDF exports (per Section 2.2).
- [ ] Appointment stats report filters by date range/department/doctor, shows totals, breakdowns by status/type, daily trend, department comparison, and enforces doctor role restrictions per Section 2.3.
- [ ] Doctor performance report surfaces KPIs (appointments handled, exam completion, patient satisfaction if listed), honors admin-only access, and shows caching/loading states.
- [ ] Patient activity report aggregates patient growth, visit frequency, and high-risk flags; ensures filters & export actions work as described in Section 2.4.
- [ ] All reports respect the 12-hour cache TTL, surface loading skeletons, and show error states without blocking other cards per Section 1.1 & 2.1.
