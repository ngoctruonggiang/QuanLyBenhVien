# Role Permissions Matrix - Hospital Management System

**Version:** 1.0  
**Last Updated:** December 6, 2025  
**Purpose:** Clarify role mappings and permissions across the system

---

## 🎯 Role Mapping

### Auth Service Roles → Business Roles

| Auth Role      | Business Title   | Description                                                   |
| -------------- | ---------------- | ------------------------------------------------------------- |
| `ADMIN`        | Administrator    | Full system access                                            |
| `DOCTOR`       | Doctor           | Medical staff with clinical access                            |
| `NURSE`        | Nurse            | Medical staff assisting doctors                               |
| `RECEPTIONIST` | **Receptionist** | Front desk staff handling patient registration & appointments |
| `PATIENT`      | Patient          | End users accessing their own records                         |

> **✅ Updated December 6, 2025:** Backend now uses `RECEPTIONIST` role (previously was `EMPLOYEE`). All specs have been updated to reflect this change.

---

## 📋 Permissions Matrix

### Legend

- ✅ Full Access (Create, Read, Update, Delete)
- 👁️ Read Only
- ✏️ Limited Write (specific fields/conditions)
- ❌ No Access

### Patient Service

| Feature                  | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PATIENT             |
| ------------------------ | ----- | ------ | ----- | ------------ | ------------------- |
| **View Patient List**    | ✅    | ✅     | ✅    | ✅           | ❌                  |
| **View Patient Detail**  | ✅    | ✅     | ✅    | ✅           | Own only            |
| **Register New Patient** | ✅    | ✅     | ✅    | ✅           | ❌                  |
| **Update Patient Info**  | ✅    | ✅     | ✅    | ✅           | ❌                  |
| **Update Own Profile**   | ❌    | ❌     | ❌    | ❌           | ✏️ Limited fields\* |
| **Delete Patient**       | ✅    | ❌     | ❌    | ❌           | ❌                  |
| **View Medical History** | ✅    | ✅     | ✅    | ❌           | Own only            |

\*Limited fields: phoneNumber, address, allergies, emergency contact

### Appointment Service

| Feature                   | ADMIN | DOCTOR        | NURSE | RECEPTIONIST | PATIENT     |
| ------------------------- | ----- | ------------- | ----- | ------------ | ----------- |
| **View All Appointments** | ✅    | Own only      | ✅    | ✅           | Own only    |
| **Create Appointment**    | ✅    | ✅            | ✅    | ✅           | ✅ Book own |
| **Update Appointment**    | ✅    | ✅            | ✅    | ✅           | ❌          |
| **Cancel Appointment**    | ✅    | ✅            | ✅    | ✅           | Own only    |
| **Complete Appointment**  | ❌    | Assigned only | ❌    | ❌           | ❌          |
| **View Doctor Schedules** | ✅    | ✅            | ✅    | ✅           | Limited     |

### Medical Exam Service

| Feature                 | ADMIN | DOCTOR   | NURSE           | RECEPTIONIST | PATIENT  |
| ----------------------- | ----- | -------- | --------------- | ------------ | -------- |
| **View Exam List**      | ✅    | Own only | 👁️              | ❌           | ❌       |
| **View Exam Detail**    | ✅    | Own only | 👁️              | ❌           | Own only |
| **Create Exam**         | ✅    | ✅       | ✏️ Draft vitals | ❌           | ❌       |
| **Update Exam**         | ✅    | Own only | ✏️ Draft vitals | ❌           | ❌       |
| **Create Prescription** | ❌    | ✅       | ❌              | ❌           | ❌       |
| **View Prescription**   | ✅    | ✅       | 👁️              | ❌           | Own only |

### Billing Service

| Feature                  | ADMIN | DOCTOR | NURSE | RECEPTIONIST | PATIENT  |
| ------------------------ | ----- | ------ | ----- | ------------ | -------- |
| **View Invoice List**    | ✅    | ❌     | ❌    | 👁️           | Own only |
| **View Invoice Detail**  | ✅    | ❌     | ❌    | 👁️           | Own only |
| **Record Payment**       | ✅    | ❌     | ❌    | ✅           | ❌       |
| **Process Refund**       | ✅    | ❌     | ❌    | ❌           | ❌       |
| **View Payment History** | ✅    | ❌     | ❌    | 👁️           | Own only |

### HR Service

| Feature                  | ADMIN | DOCTOR   | NURSE    | RECEPTIONIST | PATIENT |
| ------------------------ | ----- | -------- | -------- | ------------ | ------- |
| **View Department List** | ✅    | 👁️       | 👁️       | 👁️           | ❌      |
| **Manage Departments**   | ✅    | ❌       | ❌       | ❌           | ❌      |
| **View Employee List**   | ✅    | 👁️       | 👁️       | 👁️           | ❌      |
| **Manage Employees**     | ✅    | ❌       | ❌       | ❌           | ❌      |
| **View Schedules**       | ✅    | Own only | Own only | 👁️ All       | ❌      |
| **Manage Schedules**     | ✅    | ❌       | ❌       | ❌           | ❌      |

### Reports Service

| Feature                | ADMIN | DOCTOR   | NURSE | RECEPTIONIST | PATIENT |
| ---------------------- | ----- | -------- | ----- | ------------ | ------- |
| **Revenue Report**     | ✅    | ❌       | ❌    | ❌           | ❌      |
| **Appointment Stats**  | ✅    | Own only | ❌    | ❌           | ❌      |
| **Doctor Performance** | ✅    | ❌       | ❌    | ❌           | ❌      |
| **Patient Activity**   | ✅    | ❌       | ❌    | ❌           | ❌      |

---

## 🔐 Access Control Implementation

### 1. Route Guards (Layout Level)

```typescript
// app/admin/layout.tsx
<RoleGuard allowedRoles={["ADMIN", "DOCTOR", "NURSE", "EMPLOYEE"]}>
  {children}
</RoleGuard>

// app/profile/layout.tsx
<RoleGuard allowedRoles={["PATIENT"]}>
  {children}
</RoleGuard>

// app/doctor/layout.tsx
<RoleGuard allowedRoles={["DOCTOR"]}>
  {children}
</RoleGuard>
```

### 2. Component Level Visibility

```typescript
// Show/hide based on role
const { user } = useAuth();

{
  user?.role === "ADMIN" && <Button>Delete Patient</Button>;
}

{
  ["ADMIN", "EMPLOYEE"].includes(user?.role) && (
    <Button>Register Patient</Button>
  );
}
```

### 3. API Level (Backend Enforcement)

Backend MUST validate permissions on ALL endpoints:

- Check role from JWT token
- Validate user can access the resource
- Filter data based on role (e.g., DOCTOR sees own appointments only)

---

## 📝 Special Cases & Business Rules

### RECEPTIONIST (EMPLOYEE) - Detailed Permissions

**✅ ALLOWED:**

1. **Patient Management**
   - Register new patients (walk-ins)
   - Update basic info: name, phone, address, insurance
   - Search patients by name, phone, ID
   - View contact information

2. **Appointment Management**
   - Book appointments for patients
   - Reschedule appointments
   - Cancel appointments
   - View doctor availability
   - Check appointment conflicts

3. **Billing**
   - View unpaid invoices
   - Record cash/card payments
   - Print receipts

4. **Read-Only Access**
   - Doctor/Nurse lists (for booking)
   - Department information
   - Schedule availability

**❌ RESTRICTED:**

1. Cannot view/edit medical details:
   - Diagnosis, symptoms, treatment
   - Medical exam results
   - Prescriptions
   - Medical history

2. Cannot access:
   - Reports/Analytics
   - HR management (create/edit employees)
   - System settings

3. Cannot delete:
   - Patients
   - Appointments (can only cancel)

### PATIENT - Self-Service Rules

**✅ ALLOWED:**

- View own profile (all fields)
- Update limited fields: phone, address, allergies, emergency contact
- Book own appointments
- Cancel own appointments (before scheduled time)
- View own invoices
- View own medical exam results

**❌ RESTRICTED:**

- Cannot update: name, DOB, gender, blood type, ID numbers
- Cannot view other patients' data
- Cannot access admin/staff features

### DOCTOR - Clinical Focus

**✅ ALLOWED:**

- View all patients (for medical context)
- Create/edit medical exams (assigned appointments only)
- Create/edit prescriptions
- Complete appointments (assigned only)
- View own appointment statistics

**❌ RESTRICTED:**

- Cannot register/delete patients
- Cannot access billing (except viewing)
- Cannot access full reports (admin only)

---

## 🎯 Best Practices

1. **Always use RoleGuard** for protected routes
2. **Backend is source of truth** - never rely on frontend-only checks
3. **Show/hide UI elements** based on permissions (better UX)
4. **Use consistent role names** in code (EMPLOYEE = Receptionist in comments)
5. **Log permission denials** for audit trail

---

## 📚 Related Documents

- [Patient Service Spec](./fe-spec-patient-service.md)
- [Appointment Service Spec](./fe-spec-appointment-service.md)
- [Billing Service Spec](./fe-spec-billing-service.md)
- [HR Service Spec](./fe-spec-hr-service.md)
- [Medical Exam Spec](./fe-spec-medical-exam.md)
- [Reports Service Spec](./fe-spec-reports-service.md)

---

**End of Role Permissions Matrix**
