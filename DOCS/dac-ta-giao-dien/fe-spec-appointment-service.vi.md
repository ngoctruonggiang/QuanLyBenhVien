# Dịch tiếng Việt - Đặc tả Frontend Appointment Service

**Dự án:** Hospital Management System  
**Service:** Appointment Service (Đặt & Quản lý lịch khám)  
**Version:** 1.0 – Cập nhật: 4/12/2025  
**Người dùng mục tiêu:** ADMIN, DOCTOR, NURSE (đầy đủ), PATIENT (chỉ lịch của mình)

---

## 1. Phạm vi & Danh mục màn hình

### 1.1 Phạm vi
- Đặt lịch mới, xem danh sách có lọc, xem chi tiết.
- Đổi lịch (thời gian/loại), hủy, hoàn tất (bác sĩ đánh dấu).
- Kiểm tra lịch rảnh của bác sĩ (qua HR).

### 1.2 Backend liên quan
| Trường | Giá trị |
| --- | --- |
| Service | appointment-service |
| Port | 8085 |
| Base path | `/api/appointments` |
| DB | `appointment_db` |
| Bảng | `appointments` |

### 1.3 Phụ thuộc liên service
| Service | Mục đích | Endpoint |
| --- | --- | --- |
| HR Service | Danh sách bác sĩ, lịch làm | `GET /api/hr/employees?role=DOCTOR`, `GET /api/hr/schedules` |
| Patient Service | Tra cứu bệnh nhân | `GET /api/patients`, `GET /api/patients/{id}` |

### 1.4 Danh sách màn hình
| Route | Màn hình | Component | Quyền | Ưu tiên |
| --- | --- | --- | --- | --- |
| `/admin/appointments` | Danh sách lịch (Admin) | `AppointmentListPage` | ADMIN, NURSE | P0 |
| `/admin/appointments/new` | Tạo lịch | `AppointmentFormPage` | ADMIN, DOCTOR, NURSE | P0 |
| `/admin/appointments/{id}` | Chi tiết | `AppointmentDetailPage` | ADMIN, DOCTOR, NURSE | P0 |
| `/admin/appointments/{id}/edit` | Sửa lịch | `AppointmentFormPage` | ADMIN, DOCTOR, NURSE | P1 |
| `/doctor/appointments` | Lịch của bác sĩ | `DoctorAppointmentPage` | DOCTOR | P0 |
| `/doctor/appointments/{id}` | Chi tiết (bác sĩ) | `AppointmentDetailPage` | DOCTOR | P0 |
| `/patient/appointments` | Lịch của tôi | `PatientAppointmentPage` | PATIENT | P0 |
| `/patient/appointments/new` | Bệnh nhân tự đặt | `PatientBookingPage` | PATIENT | P0 |
| `/patient/appointments/{id}` | Chi tiết (bệnh nhân) | `AppointmentDetailPage` | PATIENT | P1 |

### 1.5 Cây màn hình
```
/admin/appointments (list)
├─ /new
├─ /{id}
└─ /{id}/edit
/doctor/appointments
├─ (list của bác sĩ)
└─ /{id}
/patient/appointments
├─ (list của bệnh nhân)
├─ /new
└─ /{id}
```

---

## 2. Luồng & Tiêu chí chấp nhận (rút gọn)

### 2.1 Xem danh sách (Admin/Staff)
- Tải list có phân trang, tìm kiếm 300ms, lọc trạng thái/doctor/khoảng ngày, sắp xếp.
- Bảng gồm Patient, Doctor, Date/Time, Type, Status, Actions.
- Trạng thái badge: SCHEDULED (xanh), COMPLETED (xanh lá), CANCELLED (đỏ), NO_SHOW (xám).

### 2.2 Tạo lịch (Admin/Staff)
- Chọn bệnh nhân (search), bác sĩ (search), xem slot trống 30 phút, chọn loại (CONSULTATION/FOLLOW_UP/EMERGENCY), nhập lý do ≤500 ký tự.
- Thành công: toast “Booked”, về list.  
- Lỗi 404/409/400 map thông điệp: PATIENT_NOT_FOUND, EMPLOYEE_NOT_FOUND, DOCTOR_NOT_AVAILABLE, TIME_SLOT_TAKEN, PAST_APPOINTMENT.

### 2.3 Bệnh nhân tự đặt
- Tự điền patient từ session; chọn khoa (optional), bác sĩ, ngày (calendar highlight ngày có slot), giờ; xác nhận qua modal.
- Thành công: về `/patient/appointments`; xử lý lỗi giống Admin.

### 2.4 Xem chi tiết
- GET `/api/appointments/{id}`; hiển thị thông tin bệnh nhân/bác sĩ/thời gian/loại/trạng thái/lý do/ghi chú.
- Hành động theo trạng thái/role: SCHEDULED (Edit/Cancel; Complete cho bác sĩ), COMPLETED (link medical exam nếu có), CANCELLED/NO_SHOW chỉ xem.

### 2.5 Đổi lịch (Reschedule)
- Chỉ SCHEDULED; Patient/Doctor readonly; đổi thời gian/loại/lý do/ghi chú (≤1000).
- Validate trùng slot/lịch bác sĩ; success toast “Rescheduled”.

### 2.6 Hủy lịch
- Modal xác nhận + lý do bắt buộc ≤500; PATCH `/cancel`.
- Lỗi: APPOINTMENT_NOT_CANCELLABLE, ALREADY_CANCELLED; bệnh nhân chỉ hủy lịch của mình.

### 2.7 Hoàn tất (chỉ bác sĩ)
- PATCH `/complete`; modal xác nhận; lỗi ALREADY_COMPLETED, APPOINTMENT_CANCELLED, APPOINTMENT_NO_SHOW, FORBIDDEN (không phải bác sĩ được gán).
- Success: cập nhật badge, gợi ý tạo medical exam.

### 2.8 Lịch của tôi (Patient)
- Chỉ hiển thị lịch của user; có empty states, phân trang/tìm kiếm cơ bản; cancel nếu SCHEDULED.

---

## 3. API & Validation (tóm tắt)
- Định dạng lỗi chung:
```ts
interface ApiErrorResponse {
  status: "error";
  error: { code: string; message: string; details?: { field: string; message: string }[] };
}
```
- Mã lỗi chính: UNAUTHORIZED, FORBIDDEN, VALIDATION_ERROR, PAST_APPOINTMENT, PATIENT_NOT_FOUND, EMPLOYEE_NOT_FOUND, DOCTOR_NOT_AVAILABLE, TIME_SLOT_TAKEN, APPOINTMENT_NOT_FOUND, APPOINTMENT_NOT_MODIFIABLE, APPOINTMENT_NOT_CANCELLABLE, ALREADY_CANCELLED, ALREADY_COMPLETED, APPOINTMENT_CANCELLED, APPOINTMENT_NO_SHOW.
- Validate phía client (Zod): create/update/cancel với các giới hạn độ dài và enum type.
- Loading/empty states: skeleton khi load, disable + spinner khi submit, empty copy cho list trống.

---

## 4. Kiểm thử & Checklist triển khai

### Trang
- `/admin/appointments` (list), `/new`, `/{id}`, `/{id}/edit`
- `/doctor/appointments`, `/doctor/appointments/{id}`
- `/patient/appointments`, `/patient/appointments/new`, `/patient/appointments/{id}`

### Component
- AppointmentStatusBadge, AppointmentTypeBadge, PatientSearchSelect, DoctorSearchSelect,
  TimeSlotPicker, AppointmentCalendar, CancelAppointmentModal, CompleteAppointmentModal, AppointmentCard.

### Service & Hooks
- `appointment.service.ts`, `hooks/useAppointment.ts`

### API cần nối
- POST/GET/PATCH `/api/appointments`, PATCH `/cancel`, PATCH `/complete`
- GET `/api/patients`, GET `/api/hr/employees?role=DOCTOR`, GET `/api/hr/schedules`

### Kịch bản kiểm thử
- Happy: đặt lịch, xem list + filter, xem chi tiết, reschedule, cancel, complete (doctor).
- Error: validation, PAST_APPOINTMENT, TIME_SLOT_TAKEN, DOCTOR_NOT_AVAILABLE, FORBIDDEN, 404, network.
- Edge: bệnh nhân chỉ xem/hủy của mình, chỉ bác sĩ được gán mới complete, không sửa COMPLETED/CANCELLED/NO_SHOW, refresh slot khi đổi ngày, xử lý conflict booking.

---

## 5. Phụ lục Interface (tóm tắt)
- `AppointmentStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"`
- `AppointmentType = "CONSULTATION" | "FOLLOW_UP" | "EMERGENCY"`
- `Appointment`, `AppointmentListItem`, `Create/Update/CancelAppointmentRequest`, `AppointmentListParams`, `PaginatedAppointments` như bản gốc.

> Bản gốc tiếng Anh được giữ tại: `DOCS/fe-specs/fe-spec-appointment-service.md`.
