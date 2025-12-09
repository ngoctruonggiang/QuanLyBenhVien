# Tóm tắt các lỗi đã sửa

**Ngày:** 6 tháng 12, 2025

## 1. ✅ Axios Interceptor Response Structure

### Vấn đề:

- Interceptor trả về `response.data` nhưng code vẫn gọi `response.data.data` → undefined trong môi trường thật

### Sửa chữa:

**File:** `config/axios.ts`

```typescript
// BEFORE
return response.data;

// AFTER
return response; // Trả về full response object
```

**File:** `config/axios.ts` (error handler)

```typescript
// BEFORE
return Promise.reject();

// AFTER
return Promise.reject(error); // Giữ error object để xử lý error.response.data.error.code
```

---

## 2. ✅ Export Type AppointmentResponse

### Vấn đề:

- `lib/mocks/index.ts` import `AppointmentResponse` nhưng file không export → lỗi build

### Sửa chữa:

**File:** `services/appointment.service.ts`

```typescript
// Thêm export
export type AppointmentResponse = Appointment;
```

**File:** `lib/mocks/index.ts`

```typescript
// BEFORE
import { AppointmentResponse } from "@/services/appointment.service";

// AFTER
import { Appointment } from "@/interfaces/appointment";
```

---

## 3. ✅ Pagination 0-based

### Vấn đề:

- `usePatientAppointments` và `useDoctorAppointments` dùng `page: 1` → bỏ sót trang đầu (0-based per spec)

### Sửa chữa:

**File:** `hooks/queries/useAppointment.ts`

```typescript
// BEFORE
page: 1,

// AFTER
page: 0, // 0-based pagination per spec
```

---

## 4. ✅ Doctor Schedule Validation & Conflict Errors

### Vấn đề:

- Mock không kiểm tra lịch HR → không trả `DOCTOR_NOT_AVAILABLE`
- Mock không check slot conflict → không trả `TIME_SLOT_TAKEN`

### Sửa chữa:

**4.1 Thêm schedules mới vào mockSchedules**
**File:** `lib/mocks/index.ts`

- Thêm lịch cho Dr. John Smith: 2025-12-05, 2025-12-06 (08:00-17:00)
- Thêm lịch cho Dr. Sarah Johnson: 2025-12-05 (09:00-16:00)
- Thêm lịch cho Dr. Emily Carter: 2025-12-05 (08:00-15:00)

**4.2 Cập nhật appointmentService.create()**
**File:** `services/appointment.service.ts`

```typescript
// Kiểm tra lịch bác sĩ
const doctorSchedule = mockSchedules.find(
  (s) => s.employeeId === data.doctorId && s.workDate === appointmentDate,
);

if (!doctorSchedule) {
  throw { response: { data: { error: { code: "DOCTOR_NOT_AVAILABLE" } } } };
}

// Kiểm tra giờ hẹn trong khung lịch
if (timeOnly < doctorSchedule.startTime || timeOnly >= doctorSchedule.endTime) {
  throw { response: { data: { error: { code: "DOCTOR_NOT_AVAILABLE" } } } };
}

// Kiểm tra slot đã bị book
const isSlotTaken = mockAppointments.some(
  (a) =>
    a.doctor.id === data.doctorId &&
    a.status !== "CANCELLED" &&
    a.appointmentTime === data.appointmentTime,
);

if (isSlotTaken) {
  throw { response: { data: { error: { code: "TIME_SLOT_TAKEN" } } } };
}
```

**4.3 Cập nhật appointmentService.update()**
Tương tự logic validation khi thay đổi `appointmentTime`

**4.4 Cập nhật appointmentService.getTimeSlots()**
**File:** `services/appointment.service.ts`

```typescript
// Kiểm tra lịch bác sĩ
const doctorSchedule = mockSchedules.find(
  (s) => s.employeeId === doctorId && s.workDate === date,
);

if (!doctorSchedule) {
  return []; // Không có lịch → không có slot
}

// Generate slots theo khung giờ lịch
return generateTimeSlotsWithSchedule(
  doctorSchedule.startTime,
  doctorSchedule.endTime,
  bookedTimes,
  currentTime,
);
```

**4.5 Thêm helper function**

```typescript
const generateTimeSlotsWithSchedule = (
  startTime: string, // "07:00"
  endTime: string, // "12:00"
  bookedTimes: string[],
  currentTime?: string,
): TimeSlot[] => {
  // Generate 30-min slots chỉ trong khung startTime-endTime
};
```

---

## 5. ✅ Permission Checks (Owner/Assigned Doctor)

### Vấn đề:

- Không chặn bệnh nhân hủy cuộc hẹn của người khác
- Không chặn bác sĩ complete cuộc hẹn không phải của mình

### Sửa chữa:

**5.1 Cập nhật cancel() signature**
**File:** `services/appointment.service.ts`

```typescript
cancel: async (
  id: string,
  data: AppointmentCancelRequest,
  currentUserId?: string,     // NEW
  currentUserRole?: string    // NEW
): Promise<Appointment>

// Thêm kiểm tra quyền
if (currentUserRole === "PATIENT" && appointment.patient.id !== currentUserId) {
  throw { response: { data: { error: { code: "FORBIDDEN" } } } };
}
```

**5.2 Cập nhật complete() signature**
**File:** `services/appointment.service.ts`

```typescript
complete: async (
  id: string,
  currentUserId?: string,     // Employee ID của doctor
  currentUserRole?: string    // NEW
): Promise<Appointment>

// Chỉ assigned doctor mới complete được
if (currentUserRole === "DOCTOR" && appointment.doctor.id !== currentUserId) {
  throw { response: { data: { error: { code: "FORBIDDEN" } } } };
}

// Thêm check NO_SHOW
if (appointment.status === "NO_SHOW") {
  throw { response: { data: { error: { code: "APPOINTMENT_NO_SHOW" } } } };
}
```

**5.3 Cập nhật hooks**
**File:** `hooks/queries/useAppointment.ts`

```typescript
// BEFORE
export const useCancelAppointment = () => { ... }
export const useCompleteAppointment = () => { ... }

// AFTER
export const useCancelAppointment = (currentUserId?: string, currentUserRole?: string) => {
  mutationFn: ({ id, data }) =>
    appointmentService.cancel(id, data, currentUserId, currentUserRole)
}

export const useCompleteAppointment = (currentUserId?: string, currentUserRole?: string) => {
  mutationFn: (id: string) =>
    appointmentService.complete(id, currentUserId, currentUserRole)
}
```

**Cách sử dụng trong component:**

```typescript
const { user } = useAuth();
const cancelMutation = useCancelAppointment(user?.id, user?.role);
const completeMutation = useCompleteAppointment(user?.employeeId, user?.role);
```

---

## 6. ✅ Replace localStorage Role Check với useAuth

### Vấn đề:

- Các trang báo cáo dùng `localStorage.getItem('role')` → doctor có thể xem báo cáo admin
- localStorage không đáng tin cậy, có thể bị sửa

### Sửa chữa:

**Files:**

- `app/admin/reports/page.tsx`
- `app/admin/reports/revenue/page.tsx`
- `app/admin/reports/doctors/performance/page.tsx`
- `app/admin/reports/patients/activity/page.tsx`
- `app/admin/reports/appointments/page.tsx`

```typescript
// BEFORE
const r = typeof window !== "undefined" ? localStorage.getItem("role") : null;

// AFTER
import { useAuth } from "@/contexts/AuthContext";
const { user } = useAuth();
const r = user?.role || null;
```

**Lợi ích:**

- Lấy role từ session đã xác thực (cookie-based)
- Không thể giả mạo role
- RoleGuard đã bảo vệ ở layout level

---

## 7. ⚠️ Các vấn đề còn lại (Chưa sửa trong lần này)

### 7.1 Export PDF cho Reports

- **Spec yêu cầu:** Nút "Export PDF" trên các trang báo cáo
- **Hiện tại:** Chưa implement
- **Đề xuất:** Dùng `jsPDF` hoặc `react-to-pdf` library

### 7.2 Error Handling cho Reports

- **Spec yêu cầu:** Xử lý 403/partial data theo spec
- **Hiện tại:** Chưa có error boundary
- **Đề xuất:** Thêm try-catch và error UI

### 7.3 Doctor Report Auto-filter

- **Spec yêu cầu:** Báo cáo bác sĩ tự động filter theo chính bác sĩ đó
- **Hiện tại:** Chưa auto-filter
- **Đề xuất:**

```typescript
const { user } = useAuth();
const doctorId = user?.role === "DOCTOR" ? user.employeeId : undefined;
```

### 7.4 Patient Not Found / Doctor Not Found

- **Vấn đề:** Mock hiện tại chỉ warn, không throw error thật
- **Sửa:** Đã thêm throw error nếu patient/doctor không tồn tại

---

## Checklist Hoàn thành

- [x] Axios trả về response (không .data)
- [x] Error handler giữ error object
- [x] Export AppointmentResponse type
- [x] Pagination 0-based
- [x] Doctor schedule validation
- [x] DOCTOR_NOT_AVAILABLE error
- [x] TIME_SLOT_TAKEN error
- [x] Permission check: PATIENT cancel own only
- [x] Permission check: DOCTOR complete assigned only
- [x] Replace localStorage role với useAuth
- [x] Thêm mock schedules cho testing
- [x] Generate slots theo lịch HR
- [x] **CRITICAL FIX**: Sửa tất cả services `response.data.data` → `response.data`
  - [x] appointment.service.ts (7 chỗ)
  - [x] reports.service.ts (4 chỗ)
  - [x] patient.service.ts (7 chỗ)
  - [x] hr.service.ts (7 chỗ)
- [x] Profile routes có RoleGuard ["PATIENT"]
- [x] Profile edit giới hạn đúng fields theo spec
- [ ] Export PDF (future)
- [ ] Error boundary cho reports (future)
- [ ] Auto-filter doctor reports (future)

---

## Cách Test

### Test 1: DOCTOR_NOT_AVAILABLE

```typescript
// Thử book appointment vào ngày bác sĩ không có lịch
await appointmentService.create({
  patientId: "p001",
  doctorId: "emp-101",
  appointmentTime: "2025-12-10T09:00:00", // Ngày không có schedule
  type: "CONSULTATION",
  reason: "Test",
});
// Expected: Error code "DOCTOR_NOT_AVAILABLE"
```

### Test 2: TIME_SLOT_TAKEN

```typescript
// Book 2 appointments cùng doctor, cùng time
await appointmentService.create({...}); // First appointment
await appointmentService.create({...}); // Same time
// Expected: Error code "TIME_SLOT_TAKEN"
```

### Test 3: Permission - Cancel

```typescript
const { user } = useAuth(); // user.id = "p001", role = "PATIENT"
const cancelMutation = useCancelAppointment(user.id, user.role);

// Thử cancel appointment của patient khác
cancelMutation.mutate({
  id: "apt-002", // Của patient p002
  data: { cancelReason: "Test" },
});
// Expected: Error code "FORBIDDEN"
```

### Test 4: Permission - Complete

```typescript
const { user } = useAuth(); // user.employeeId = "emp-102", role = "DOCTOR"
const completeMutation = useCompleteAppointment(user.employeeId, user.role);

// Thử complete appointment của doctor khác
completeMutation.mutate("apt-001"); // Doctor là emp-101
// Expected: Error code "FORBIDDEN"
```

---

## Migration Guide cho Component Developers

### Before:

```typescript
// Old way - NO permission check
const cancelMutation = useCancelAppointment();
cancelMutation.mutate({ id, data });
```

### After:

```typescript
// New way - WITH permission check
const { user } = useAuth();
const cancelMutation = useCancelAppointment(user?.id, user?.role);
cancelMutation.mutate({ id, data });

// For complete (doctor)
const completeMutation = useCompleteAppointment(user?.employeeId, user?.role);
completeMutation.mutate(appointmentId);
```

### Example Component:

```tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  useAppointment,
  useCancelAppointment,
} from "@/hooks/queries/useAppointment";

export function AppointmentDetailPage({ id }: { id: string }) {
  const { user } = useAuth();
  const { data: appointment } = useAppointment(id);

  // Pass user info for permission checking
  const cancelMutation = useCancelAppointment(user?.id, user?.role);

  const handleCancel = (reason: string) => {
    cancelMutation.mutate({
      id,
      data: { cancelReason: reason },
    });
  };

  return (
    <div>
      {/* Only show cancel button if user has permission */}
      {appointment?.status === "SCHEDULED" &&
        ((user?.role === "PATIENT" && appointment.patient.id === user.id) ||
          ["ADMIN", "NURSE"].includes(user?.role || "")) && (
          <Button onClick={() => handleCancel("Cancelled by user")}>
            Cancel Appointment
          </Button>
        )}
    </div>
  );
}
```

---

## ITERATION 2 - December 6, 2025

### ✅ CRITICAL BUG FIX: Response Data Structure

**Problem:** All services still used `response.data.data` despite axios interceptor returning full `response` object. This would cause `undefined` in production.

**Files Fixed:**

1. **appointment.service.ts** - 7 locations
   - list(), getById(), create(), update(), cancel(), complete(), getTimeSlots()
2. **reports.service.ts** - 4 locations
   - getRevenueReport(), getAppointmentStats(), getDoctorPerformance(), getPatientActivity()
3. **patient.service.ts** - 7 locations
   - getPatients(), getPatient(), getMyProfile(), createPatient(), updatePatient(), updateMyProfile(), deletePatient()
4. **hr.service.ts** - 7 locations (in non-commented code)
   - getDepartments(), getDepartment(), createDepartment(), updateDepartment(), getEmployees(), getDoctors(), getEmployee()

**Change Pattern:**

```typescript
// BEFORE (WRONG)
const response = await axiosInstance.get(url);
return response.data.data; // undefined in production!

// AFTER (CORRECT)
const response = await axiosInstance.get(url);
return response.data; // Correct!
```

### ✅ Profile Route Protection Verified

**Checked:**

- `/app/profile/layout.tsx` - ✅ Has `<RoleGuard allowedRoles={["PATIENT"]}>`
- `/app/profile/edit/page.tsx` - ✅ Protected by layout

**Profile Edit Field Restrictions - CORRECT per spec:**

| Field                 | Editable by Patient | Implementation            |
| --------------------- | ------------------- | ------------------------- |
| phoneNumber           | ✅                  | ✅ In editSchema          |
| address               | ✅                  | ✅ In editSchema          |
| allergies             | ✅                  | ✅ In editSchema          |
| relativeFullName      | ✅                  | ✅ In editSchema          |
| relativePhoneNumber   | ✅                  | ✅ In editSchema          |
| relativeRelationship  | ✅                  | ✅ In editSchema          |
| fullName              | ❌                  | ✅ Read-only section      |
| email                 | ❌                  | ✅ Read-only section      |
| dateOfBirth           | ❌                  | ✅ Read-only section      |
| gender                | ❌                  | ✅ Read-only section      |
| bloodType             | ❌                  | ✅ Read-only section      |
| identificationNumber  | ❌                  | ✅ Not shown (admin only) |
| healthInsuranceNumber | ❌                  | ✅ Not shown (admin only) |

---

## Notes

1. **Mock service chi permissions:** Backend sẽ enforce permissions thật, mock chỉ simulate behavior
2. **Schedule data:** Cần sync mockSchedules với mockAppointments để test realistic
3. **Error codes:** Tất cả error codes theo spec API contracts
4. **0-based pagination:** Nhất quán với Spring Data JPA default behavior
5. **CRITICAL:** Always check axios interceptor return before using `.data.data` pattern
