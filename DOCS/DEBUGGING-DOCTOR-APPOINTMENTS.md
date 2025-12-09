# Debugging Doctor Appointments Visibility Issue

## Issue

When creating appointments for Dr. New Test, those appointments don't appear in the doctor's dashboard when logged in as that doctor.

## How It Should Work

### 1. Doctor Login Flow

```typescript
// services/auth.mock.service.ts
{
  username: "newdoctor",
  email: "newdoctor@hms.com",
  password: "password123",
  role: "DOCTOR",
  fullName: "Dr. New Test",
  employeeId: "emp-new-doctor-001",  // ← This is the key ID
}
```

### 2. Doctor Appointments Page

```typescript
// app/doctor/appointments/page.tsx (lines 16-26)
const { user } = useAuth();
const [doctorId, setDoctorId] = useState<string | null>(null);
const { data: appointments = [], isLoading } = useDoctorAppointments(
  doctorId || ""
);

useEffect(() => {
  const id = user?.employeeId;
  setDoctorId(id || "emp-101"); // fallback to emp-101
}, [user]);
```

### 3. Hook Filtering

```typescript
// hooks/queries/useAppointment.ts (line 75-87)
export const useDoctorAppointments = (doctorId?: string) => {
  return useQuery({
    queryKey: appointmentKeys.list({ doctorId } as AppointmentListParams),
    queryFn: () =>
      appointmentService.list({
        doctorId,
        page: 0,
        size: 20,
        sort: "appointmentTime,asc",
      }),
    enabled: !!doctorId,
    select: (res: PaginatedResponse<Appointment>) => res?.content ?? [],
  });
};
```

### 4. Service Filtering

```typescript
// services/appointment.service.ts (line 140-142)
// Filter by doctorId
if (params.doctorId) {
  filtered = filtered.filter((a) => a.doctor.id === params.doctorId);
}
```

### 5. Appointment Creation

```typescript
// services/appointment.service.ts (line 321-327)
doctor: {
  id: data.doctorId,  // ← Should be "emp-new-doctor-001"
  fullName: doctorName,
  department: doctorDept,
  specialization: doctorSpec,
},
```

## Debugging Steps

### Step 1: Verify Login Data

1. Login as Dr. New Test (username: `newdoctor`, password: `password123`)
2. Open browser console
3. Run:

```javascript
console.log("User:", JSON.parse(localStorage.getItem("user") || "{}"));
// Should show: { role: "DOCTOR", employeeId: "emp-new-doctor-001", ... }
```

### Step 2: Check Doctor ID in Page

1. While logged in as Dr. New Test
2. Navigate to `/doctor/appointments`
3. Add this to `app/doctor/appointments/page.tsx` after line 23:

```typescript
console.log("Doctor ID being used:", doctorId);
console.log("User employeeId:", user?.employeeId);
console.log("Appointments fetched:", appointments);
```

4. Expected output:
   - `Doctor ID being used: "emp-new-doctor-001"`
   - `User employeeId: "emp-new-doctor-001"`
   - `Appointments fetched: [array of appointments]`

### Step 3: Verify Created Appointment

1. Login as admin
2. Create a new appointment for Dr. New Test
3. Open browser console
4. Check localStorage:

```javascript
const appointments = JSON.parse(
  localStorage.getItem("mock_appointments") || "[]"
);
const newTestAppointments = appointments.filter(
  (a) => a.doctor.id === "emp-new-doctor-001"
);
console.log("Appointments for Dr. New Test:", newTestAppointments);
```

5. Each appointment should have:

```json
{
  "doctor": {
    "id": "emp-new-doctor-001",
    "fullName": "Dr. New Test",
    "department": "General",
    "specialization": "General"
  }
}
```

### Step 4: Verify Doctor Selection in Admin Form

1. When creating appointment as admin
2. Check the doctor select dropdown
3. Ensure Dr. New Test appears in the list
4. When selected, check the form value:

```typescript
// In app/admin/appointments/new/page.tsx
const watchedDoctorId = form.watch("doctorId");
console.log("Selected doctorId:", watchedDoctorId);
// Should be: "emp-new-doctor-001"
```

### Step 5: Check Service Filtering

Add debug logging to `services/appointment.service.ts` at line 139:

```typescript
console.log("Filtering appointments with params:", params);
console.log("All appointments:", mockAppointments);
// Filter by doctorId
if (params.doctorId) {
  filtered = filtered.filter((a) => a.doctor.id === params.doctorId);
  console.log("Filtered by doctorId:", params.doctorId, "Result:", filtered);
}
```

## Common Issues & Solutions

### Issue 1: employeeId is undefined

**Symptom:** `user?.employeeId` is undefined in doctor page
**Solution:** Check auth context properly sets employeeId on login
**Location:** `contexts/AuthContext.tsx` line 70-81

### Issue 2: Fallback to emp-101

**Symptom:** Page always uses "emp-101" instead of actual employeeId
**Cause:** `user?.employeeId` is null/undefined
**Solution:**

1. Clear cookies: `Cookies.remove("userEmployeeId")`
2. Clear localStorage: `localStorage.removeItem('userEmployeeId')`
3. Re-login as Dr. New Test

### Issue 3: Doctor not in dropdown

**Symptom:** Dr. New Test doesn't appear in admin appointment form
**Cause:** Not fetched from HR service
**Solution:** Check `hrService.getEmployees({ role: "DOCTOR" })` includes Dr. New Test
**Location:** `lib/mocks/index.ts` line 111 (should be in mockEmployees)

### Issue 4: Wrong doctor.id in created appointment

**Symptom:** Appointment created with different doctor ID
**Cause:** Form submits wrong doctorId
**Debug:**

```typescript
// In admin/appointments/new/page.tsx onSubmit
console.log("Form data being submitted:", data);
// Should show: { doctorId: "emp-new-doctor-001", ... }
```

### Issue 5: Cache not updating

**Symptom:** New appointments don't appear immediately
**Solution:** Check React Query cache invalidation
**Location:** `hooks/queries/useAppointment.ts` createAppointment mutation

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
};
```

## Quick Test Script

Run this in browser console to verify the complete flow:

```javascript
// 1. Check mock data setup
const employees = JSON.parse(localStorage.getItem("mock_employees") || "[]");
const drNewTest = employees.find((e) => e.id === "emp-new-doctor-001");
console.log("Dr. New Test in employees:", drNewTest);

// 2. Check current user
const user = JSON.parse(localStorage.getItem("user") || "{}");
console.log("Current user:", user);

// 3. Check appointments
const appointments = JSON.parse(
  localStorage.getItem("mock_appointments") || "[]"
);
const drNewTestAppointments = appointments.filter(
  (a) => a.doctor.id === "emp-new-doctor-001"
);
console.log("Dr. New Test's appointments:", drNewTestAppointments);

// 4. Check schedules
const schedules = JSON.parse(localStorage.getItem("mock_schedules") || "[]");
const drNewTestSchedules = schedules.filter(
  (s) => s.employeeId === "emp-new-doctor-001"
);
console.log(
  "Dr. New Test's schedules (first 5):",
  drNewTestSchedules.slice(0, 5)
);

// Summary
console.log("\n=== SUMMARY ===");
console.log("✓ Dr. New Test exists:", !!drNewTest);
console.log("✓ Currently logged in as:", user.fullName, `(${user.role})`);
console.log("✓ User employeeId:", user.employeeId);
console.log("✓ Appointments for Dr. New Test:", drNewTestAppointments.length);
console.log("✓ Schedules for Dr. New Test:", drNewTestSchedules.length);
console.log(
  "\nIf logged in as Dr. New Test and appointmentCount > 0, they should be visible!"
);
```

## Expected Behavior

When working correctly:

1. **Admin creates appointment:**
   - Selects "Dr. New Test" from dropdown
   - doctorId = "emp-new-doctor-001"
   - Appointment saved with `doctor.id: "emp-new-doctor-001"`

2. **Dr. New Test logs in:**
   - user.employeeId = "emp-new-doctor-001"
   - Page calls `useDoctorAppointments("emp-new-doctor-001")`
   - Service filters: `appointments.filter(a => a.doctor.id === "emp-new-doctor-001")`
   - Appointments appear in list

## Next Steps

If issue persists after debugging:

1. **Clear all data and re-test:**

```javascript
localStorage.clear();
// Re-login and create new appointment
```

2. **Check if Dr. New Test has schedules:**
   - Schedules needed for time slot selection
   - Generated automatically for all doctors with role: "DOCTOR"
   - Check: `mockSchedules.filter(s => s.employeeId === 'emp-new-doctor-001')`

3. **Verify doctor object structure:**
   - Ensure appointment.doctor.id matches employeeId format
   - Both should be: "emp-new-doctor-001" (not "emp-new-doctor", not "new-doctor-001")

## Contact Points

- **Auth context:** `contexts/AuthContext.tsx`
- **Doctor page:** `app/doctor/appointments/page.tsx`
- **Hook:** `hooks/queries/useAppointment.ts`
- **Service:** `services/appointment.service.ts`
- **Mock data:** `lib/mocks/index.ts`
- **Auth mock:** `services/auth.mock.service.ts`
