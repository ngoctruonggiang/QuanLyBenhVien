# Testing Doctor Appointment Visibility

## Quick Test Steps

Follow these steps to verify appointments appear correctly in Dr. New Test's dashboard:

### Step 1: Clear Old Data (Important!)

Open browser console and run:

```javascript
// Clear all stored data to start fresh
localStorage.clear();
document.cookie.split(";").forEach((c) => {
  document.cookie = c
    .replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
console.log("✓ All data cleared. Please refresh the page.");
```

Refresh the page.

### Step 2: Login as Admin

1. Navigate to `/login`
2. Login with admin credentials:
   - Username: `admin`
   - Password: `password123`
3. Verify you're logged in as admin

### Step 3: Create Appointment for Dr. New Test

1. Navigate to `/admin/appointments`
2. Click "Create Appointment" or "Book New Appointment"
3. Fill in the form:
   - **Patient**: Select any patient (e.g., "Nguyen Van An")
   - **Doctor**: Select **"Dr. New Test"** (this is crucial!)
   - **Date**: Select today or tomorrow (e.g., December 10, 2025)
   - **Time**: Select any available time slot (e.g., 09:00)
   - **Type**: Select "CONSULTATION"
   - **Reason**: Enter any reason (e.g., "Regular checkup")
4. Click "Create" or "Save"
5. Verify success message appears

**Open console and check:**

```javascript
// Verify appointment was created
const appointments = JSON.parse(
  localStorage.getItem("mock_appointments") || "[]"
);
const drNewTestApts = appointments.filter(
  (a) => a.doctor.id === "emp-new-doctor-001"
);
console.log("Appointments for Dr. New Test:", drNewTestApts);
// Should show at least 1 appointment
```

### Step 4: Logout Admin

1. Click user menu / logout
2. Verify you're logged out
3. Clear any cached data:

```javascript
// Optional: Clear only auth cookies, keep appointments
document.cookie.split(";").forEach((c) => {
  if (c.includes("Token") || c.includes("user")) {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  }
});
```

### Step 5: Login as Dr. New Test

1. Navigate to `/login`
2. Login with Dr. New Test credentials:
   - **Username**: `newdoctor`
   - **Password**: `password123`
3. Verify you're logged in (should see "Dr. New Test" in header/menu)

**Check console for user data:**

```javascript
// Verify employeeId is set
console.log("Current user:", JSON.parse(localStorage.getItem("user") || "{}"));
// Should show: { role: "DOCTOR", employeeId: "emp-new-doctor-001", fullName: "Dr. New Test" }
```

### Step 6: Navigate to Doctor Appointments

1. Go to `/doctor/appointments`
2. **Check browser console** - you should see:
   ```
   [Doctor Appointments] Using employeeId from auth: emp-new-doctor-001
   [Doctor Appointments] Loaded X appointments for doctor emp-new-doctor-001
   ```

### Step 7: Verify Appointments Appear

The page should display:

- The appointment you created in Step 3
- Doctor details showing "Dr. New Test"
- Correct date and time
- Status "SCHEDULED"

**If appointments don't appear:**

Run this diagnostic in console:

```javascript
console.log("=== DIAGNOSTIC ===");
const user = JSON.parse(localStorage.getItem("user") || "{}");
const appointments = JSON.parse(
  localStorage.getItem("mock_appointments") || "[]"
);
const drNewTestApts = appointments.filter(
  (a) => a.doctor.id === "emp-new-doctor-001"
);

console.log("1. Current user employeeId:", user.employeeId);
console.log("2. Should be: emp-new-doctor-001");
console.log(
  "3. Match:",
  user.employeeId === "emp-new-doctor-001" ? "✓ YES" : "✗ NO"
);
console.log("4. Total appointments:", appointments.length);
console.log("5. Dr. New Test's appointments:", drNewTestApts.length);
console.log("6. Details:", drNewTestApts);
```

## Expected Results

✅ **Success indicators:**

- Console shows: `[Doctor Appointments] Using employeeId from auth: emp-new-doctor-001`
- Console shows: `[Doctor Appointments] Loaded X appointments`
- Page displays the appointments you created
- No fallback warning in console

❌ **Failure indicators:**

- Console shows: `[Doctor Appointments] No employeeId found in user object. Using fallback.`
- Page shows "emp-101" (Dr. John Smith) appointments instead
- No appointments appear even though you created them

## Troubleshooting

### Issue: "No employeeId found in user object"

**Cause:** Auth context didn't load employeeId properly

**Solution:**

1. Logout completely
2. Clear all cookies and localStorage (Step 1)
3. Login again as Dr. New Test
4. Check cookies in DevTools > Application > Cookies:
   - Should have `userEmployeeId: emp-new-doctor-001`

### Issue: Appointments show for Dr. John Smith instead

**Cause:** Fallback to "emp-101" is being used

**Solution:**

1. Check console for warning messages
2. Verify you're logged in as `newdoctor`, not another user
3. Run diagnostic script above
4. If employeeId is wrong, logout and re-login

### Issue: No appointments appear at all

**Cause:** Appointments might have wrong doctor.id

**Solution:**
Run this to check appointment data:

```javascript
const appointments = JSON.parse(
  localStorage.getItem("mock_appointments") || "[]"
);
appointments.forEach((apt, idx) => {
  console.log(`Appointment ${idx + 1}:`, {
    id: apt.id,
    doctorId: apt.doctor.id,
    doctorName: apt.doctor.fullName,
    patient: apt.patient.fullName,
    time: apt.appointmentTime,
  });
});
// Check if any have doctor.id === "emp-new-doctor-001"
```

If none have the correct doctor.id, create a new appointment following Step 3 carefully.

### Issue: Page shows error or blank

**Cause:** React Query error or data loading issue

**Solution:**

1. Check browser console for errors
2. Open Network tab, filter by XHR/Fetch
3. Look for failed requests
4. Check if `useDoctorAppointments` hook is enabled:

```javascript
// In components React DevTools:
// Find DoctorAppointmentsPage component
// Check props: doctorId should not be null/empty
```

## Creating Multiple Test Appointments

To thoroughly test, create appointments with different attributes:

```javascript
// Run as admin
const testAppointments = [
  {
    patient: "Nguyen Van An",
    doctor: "Dr. New Test",
    date: "2025-12-10",
    time: "09:00",
    type: "CONSULTATION",
    status: "SCHEDULED",
  },
  {
    patient: "Tran Thi Mai",
    doctor: "Dr. New Test",
    date: "2025-12-10",
    time: "10:00",
    type: "FOLLOW_UP",
    status: "SCHEDULED",
  },
  {
    patient: "Nguyen Van An",
    doctor: "Dr. New Test",
    date: "2025-12-11",
    time: "14:00",
    type: "CONSULTATION",
    status: "SCHEDULED",
  },
];
console.log("Create these appointments manually via the admin form");
```

Then verify all 3 appear in Dr. New Test's dashboard.

## Verification Checklist

- [ ] Cleared all old data (localStorage + cookies)
- [ ] Logged in as admin
- [ ] Created at least 1 appointment for "Dr. New Test"
- [ ] Verified appointment saved (checked localStorage)
- [ ] Logged out admin
- [ ] Logged in as "newdoctor" / "password123"
- [ ] Verified user object has employeeId: "emp-new-doctor-001"
- [ ] Navigated to /doctor/appointments
- [ ] Console shows correct employeeId being used
- [ ] Appointments appear in the list
- [ ] Can view appointment details by clicking
- [ ] Can filter by date (Today, This Week, All)
- [ ] Can filter by status

## Success Criteria

When working correctly, you should see:

1. **Browser Console:**

```
[Doctor Appointments] Using employeeId from auth: emp-new-doctor-001
[Doctor Appointments] Loaded 3 appointments for doctor emp-new-doctor-001
```

2. **Page UI:**

- Dashboard header shows "My Appointments"
- Date shows "Today is [current date]"
- Stats cards show correct counts (Today: X, Pending: Y, Completed: Z)
- Appointment list displays your created appointments
- Each appointment shows:
  - Patient name
  - Time
  - Status badge (SCHEDULED, COMPLETED, CANCELLED)
  - Reason
  - Action buttons (View, Cancel, Complete)

3. **Data Integrity:**

```javascript
// All appointments have correct doctor
const appointments = JSON.parse(
  localStorage.getItem("mock_appointments") || "[]"
);
const drNewTestApts = appointments.filter(
  (a) => a.doctor.id === "emp-new-doctor-001"
);
console.log("✓ All Dr. New Test appointments:", drNewTestApts.length);
```

## Next Steps After Successful Test

Once verified working:

1. **Test other doctor accounts:**
   - Login as "doctor" (Dr. John Smith)
   - Verify they see ONLY their appointments
   - Not Dr. New Test's appointments

2. **Test appointment actions:**
   - Complete an appointment
   - Cancel an appointment
   - Edit appointment details

3. **Test filters:**
   - Filter by Today (should show only today's appointments)
   - Filter by This Week
   - Filter by status (SCHEDULED, COMPLETED, CANCELLED)

4. **Test edge cases:**
   - No appointments (delete all via admin)
   - Many appointments (create 10+)
   - Past appointments vs future
   - Appointments on same day, different times

## Common Success Pattern

Most issues are resolved by:

1. ✅ Clearing all data
2. ✅ Fresh login as Dr. New Test
3. ✅ Creating new appointment with correct doctor selected
4. ✅ Verifying employeeId matches in console

The code is set up correctly - it's usually a data/cache issue!
