# Admin Appointment Booking Flow - Testing Checklist

**Test Date:** ___________  
**Tester:** ___________  
**Build/Version:** ___________  
**Role Testing:** ADMIN

---

## 🎯 Testing Objective

Kiểm tra toàn bộ luồng đặt lịch khám (Appointment Booking Flow) cho role ADMIN:
- Xem danh sách appointments
- Tạo appointment mới
- Xem chi tiết appointment
- Chỉnh sửa appointment
- Hủy appointment
- Hoàn thành appointment (nếu là doctor)

---

## ✅ Pre-Test Setup

### 1. Environment Check
- [ ] Dev server đang chạy (`npm run dev` hoặc `pnpm dev`)
- [ ] Đăng nhập với tài khoản ADMIN
- [ ] Browser console đã mở (F12) để xem errors
- [ ] Network tab đã mở để xem API calls

### 2. Test Data Preparation
**Cần có sẵn:**
- [ ] Ít nhất 2-3 patients trong hệ thống
- [ ] Ít nhất 2-3 doctors trong hệ thống
- [ ] Doctors có schedules (lịch làm việc)
- [ ] Một số appointments đã tồn tại (status khác nhau: SCHEDULED, COMPLETED, CANCELLED)

### 3. Check Navigation Access
- [ ] Menu sidebar hiển thị "Appointments"
- [ ] Click vào "Appointments" → Redirect đến `/admin/appointments`
- [ ] Không có lỗi 403 (Permission Denied)

---

## 📋 Test Cases

---

### **TEST CASE 1: View Appointment List**

**Route:** `/admin/appointments`

#### Steps:
1. Navigate to `/admin/appointments`
2. Quan sát trang load

#### Expected Results:
- [ ] **Trang load thành công** trong < 3 giây
- [ ] **Table hiển thị appointments** với các cột:
  - [ ] Patient Name
  - [ ] Doctor Name
  - [ ] Department
  - [ ] Appointment Time
  - [ ] Type (CONSULTATION, FOLLOW_UP, EMERGENCY)
  - [ ] Status (SCHEDULED, COMPLETED, CANCELLED, NO_SHOW)
  - [ ] Actions (View, Edit, Cancel)
- [ ] **Pagination controls** hiển thị (nếu có > 10 appointments)
- [ ] **"New Appointment" button** hiển thị ở góc trên phải

#### Filters Test:
- [ ] **Search box** hoạt động (tìm theo tên patient/doctor)
- [ ] **Status filter** hoạt động (ALL, SCHEDULED, COMPLETED, CANCELLED, NO_SHOW)
- [ ] **Doctor filter** hoạt động (dropdown với danh sách doctors)
- [ ] **Date range filter** hoạt động (Start Date → End Date)
- [ ] **Clear filters** hoạt động (reset về trạng thái ban đầu)

#### Sorting Test:
- [ ] Click vào column header → Table sort theo column đó
- [ ] Sort ascending/descending hoạt động

#### Actions Test:
- [ ] Click vào một row → Navigate đến detail page
- [ ] Click "Edit" button → Navigate đến edit page
- [ ] Click "Cancel" button → Hiện cancel dialog

#### Console Check:
- [ ] **Không có errors** trong console
- [ ] **Network tab**: API call `/api/appointments` return 200

---

### **TEST CASE 2: Create New Appointment - Happy Path**

**Route:** `/admin/appointments/new`

#### Steps:
1. Click "New Appointment" button từ list page
2. Fill form với valid data
3. Submit form

#### Form Fields Check:
- [ ] **Patient Select** hiển thị và searchable
  - [ ] Dropdown load danh sách patients
  - [ ] Search trong dropdown hoạt động
  - [ ] Select một patient → Patient info hiển thị
- [ ] **Department Select** hiển thị
  - [ ] Dropdown load danh sách departments
  - [ ] Select một department → Doctors của department đó được filter
- [ ] **Doctor Select** hiển thị và searchable
  - [ ] Dropdown load doctors theo department đã chọn
  - [ ] Select một doctor → Doctor info hiển thị
- [ ] **Appointment Date** (Calendar picker)
  - [ ] Calendar mở khi click
  - [ ] Chọn date → Date hiển thị trong input
  - [ ] Past dates bị disable (không chọn được)
- [ ] **Time Slot Picker** hiển thị
  - [ ] Hiển thị time slots theo schedule của doctor
  - [ ] Available slots có màu xanh/clickable
  - [ ] Booked slots có màu xám/disabled
  - [ ] Chọn time slot → Time được highlight
- [ ] **Type** (Radio group)
  - [ ] 3 options: CONSULTATION, FOLLOW_UP, EMERGENCY
  - [ ] Default: CONSULTATION
- [ ] **Reason** (Textarea)
  - [ ] Required field
  - [ ] Max 500 characters
  - [ ] Character counter hiển thị
- [ ] **Notes** (Textarea, optional)
  - [ ] Max 1000 characters
  - [ ] Character counter hiển thị

#### Submit Test:
- [ ] Click "Create Appointment" button
- [ ] **Loading state** hiển thị (button disabled, spinner icon)
- [ ] **Success toast** hiển thị: "Appointment created successfully"
- [ ] **Auto-redirect** đến appointment detail page hoặc list page
- [ ] **New appointment** xuất hiện trong list

#### Console Check:
- [ ] **Không có errors** trong console
- [ ] **Network tab**: 
  - POST `/api/appointments` return 201
  - Request body chứa đầy đủ data
  - Response chứa appointment ID

---

### **TEST CASE 3: Create New Appointment - Validation Errors**

**Route:** `/admin/appointments/new`

#### Test Empty Form:
- [ ] Click "Create Appointment" without filling any field
- [ ] **Validation errors** hiển thị dưới mỗi required field:
  - [ ] "Please select a patient"
  - [ ] "Please select a doctor"
  - [ ] "Please select a date"
  - [ ] "Please select a time slot"
  - [ ] "Please enter reason for visit"

#### Test Invalid Data:
- [ ] **Past date**: Select past date → Error: "Cannot book appointments in the past"
- [ ] **Booked time slot**: Select already booked slot → Error: "Selected time slot is already booked"
- [ ] **Doctor not available**: Select date khi doctor không có schedule → Error: "Doctor is not available on the selected date"
- [ ] **Reason too short**: Leave reason empty → Error message
- [ ] **Reason too long**: Enter > 500 chars → Error: "Reason cannot exceed 500 characters"
- [ ] **Notes too long**: Enter > 1000 chars → Error: "Notes cannot exceed 1000 characters"

#### Console Check:
- [ ] Validation errors **không cause console errors**
- [ ] Form **không submit** khi có validation errors

---

### **TEST CASE 4: View Appointment Detail**

**Route:** `/admin/appointments/[id]`

#### Steps:
1. From list page, click vào một appointment
2. Observe detail page

#### Expected Results:
- [ ] **Trang load thành công**
- [ ] **Patient Information** hiển thị:
  - [ ] Full Name
  - [ ] Phone Number
  - [ ] Patient ID
- [ ] **Doctor Information** hiển thị:
  - [ ] Full Name
  - [ ] Department
  - [ ] Specialization
- [ ] **Appointment Details** hiển thị:
  - [ ] Appointment Date & Time (formatted)
  - [ ] Type badge (CONSULTATION/FOLLOW_UP/EMERGENCY)
  - [ ] Status badge (SCHEDULED/COMPLETED/CANCELLED/NO_SHOW)
  - [ ] Reason for visit
  - [ ] Notes (if any)
  - [ ] Created At
  - [ ] Updated At
  - [ ] Cancelled At (if cancelled)
  - [ ] Cancel Reason (if cancelled)

#### Actions Available (depends on status):
**If status = SCHEDULED:**
- [ ] **"Edit" button** hiển thị
- [ ] **"Cancel" button** hiển thị
- [ ] **"Complete" button** hiển thị (if doctor or admin)

**If status = COMPLETED:**
- [ ] **No action buttons** (chỉ view)

**If status = CANCELLED:**
- [ ] **No action buttons** (chỉ view)
- [ ] **Cancel reason** hiển thị

#### Navigation:
- [ ] **Back button** → Return to list page
- [ ] **Breadcrumb** hiển thị: Home > Appointments > [Patient Name]

#### Console Check:
- [ ] **Không có errors**
- [ ] **Network tab**: GET `/api/appointments/[id]` return 200

---

### **TEST CASE 5: Edit Appointment (Reschedule)**

**Route:** `/admin/appointments/[id]/edit`

#### Pre-condition:
- Appointment status = SCHEDULED

#### Steps:
1. From detail page, click "Edit" button
2. Modify some fields
3. Submit

#### Expected Results:
- [ ] **Form pre-filled** với current data
- [ ] **All fields editable** (patient, doctor, date, time, type, reason, notes)
- [ ] **Can change date** → Time slots refresh theo new date
- [ ] **Can change doctor** → Time slots refresh theo doctor mới
- [ ] **Can change time slot** → Current time slot có label "Current"
- [ ] **Can change type** (CONSULTATION ↔ FOLLOW_UP ↔ EMERGENCY)
- [ ] **Can update reason & notes**

#### Validation Test:
- [ ] **Cannot select past date**
- [ ] **Cannot select booked time slot** (except current slot)
- [ ] **Cannot select time outside doctor's schedule**

#### Submit Test:
- [ ] Click "Update Appointment"
- [ ] **Success toast**: "Appointment updated successfully"
- [ ] **Redirect** to detail page
- [ ] **Updated data** hiển thị correctly
- [ ] **updatedAt timestamp** được update

#### Console Check:
- [ ] **Không có errors**
- [ ] **Network tab**: PATCH `/api/appointments/[id]` return 200

---

### **TEST CASE 6: Edit Non-Modifiable Appointment**

#### Pre-condition:
- Appointment status = COMPLETED hoặc CANCELLED hoặc NO_SHOW

#### Steps:
1. Try to access edit page: `/admin/appointments/[id]/edit`

#### Expected Results:
- [ ] **Edit button không hiển thị** trên detail page
- [ ] **Nếu manually navigate** to edit URL:
  - Option A: Redirect về detail page với error toast
  - Option B: Show error page: "Cannot modify this appointment"

#### Console Check:
- [ ] **Error message clear**: "Cannot modify completed/cancelled/no-show appointments"

---

### **TEST CASE 7: Cancel Appointment**

**Route:** `/admin/appointments` hoặc `/admin/appointments/[id]`

#### Pre-condition:
- Appointment status = SCHEDULED

#### Steps - From List Page:
1. Click "Cancel" button trên table row
2. Cancel dialog appears
3. Enter cancel reason
4. Confirm

#### Steps - From Detail Page:
1. Click "Cancel" button
2. Same dialog flow

#### Expected Results:
- [ ] **Cancel Dialog** hiển thị với:
  - [ ] Appointment summary (patient, doctor, date/time)
  - [ ] **Cancel Reason** textarea (required)
  - [ ] **Confirm** button (red/destructive)
  - [ ] **Cancel** button (close dialog)
- [ ] **Cannot submit** without cancel reason
- [ ] **Submit với valid reason**:
  - [ ] Loading state
  - [ ] Success toast: "Appointment cancelled successfully"
  - [ ] Dialog closes
  - [ ] Status updates to "CANCELLED" trong list/detail
  - [ ] Cancel reason saved

#### Refresh Test:
- [ ] Reload page → Status vẫn là CANCELLED
- [ ] Cancel reason vẫn hiển thị

#### Console Check:
- [ ] **Network tab**: PATCH `/api/appointments/[id]/cancel` return 200

---

### **TEST CASE 8: Cancel Already Cancelled Appointment**

#### Pre-condition:
- Appointment status = CANCELLED

#### Steps:
1. Try to cancel again

#### Expected Results:
- [ ] **Cancel button không hiển thị**
- [ ] **Hoặc nếu click**: Error toast "Appointment is already cancelled"

---

### **TEST CASE 9: Complete Appointment (Admin/Doctor)**

**Route:** `/admin/appointments/[id]`

#### Pre-condition:
- Appointment status = SCHEDULED
- Current time >= appointment time (hoặc allow early completion)

#### Steps:
1. Click "Complete" button
2. Confirm trong dialog (if any)

#### Expected Results:
- [ ] **Complete button** hiển thị (Admin và Doctor được phép)
- [ ] **Confirmation dialog** (optional)
- [ ] **Click Confirm**:
  - [ ] Loading state
  - [ ] Success toast: "Appointment completed successfully"
  - [ ] Status updates to "COMPLETED"
  - [ ] **Complete button disappears**
  - [ ] **Edit và Cancel buttons disappear**

#### Refresh Test:
- [ ] Reload page → Status vẫn là COMPLETED
- [ ] No action buttons visible

#### Console Check:
- [ ] **Network tab**: PATCH `/api/appointments/[id]/complete` return 200

---

### **TEST CASE 10: Complete Cancelled/No-Show Appointment**

#### Pre-condition:
- Appointment status = CANCELLED hoặc NO_SHOW

#### Steps:
1. Try to complete

#### Expected Results:
- [ ] **Complete button không hiển thị**
- [ ] **Hoặc nếu somehow triggered**: Error toast
  - "Cannot complete a cancelled appointment"
  - "Cannot complete a no-show appointment"

---

### **TEST CASE 11: Pagination & Data Loading**

**Route:** `/admin/appointments`

#### Pre-condition:
- Có > 10 appointments trong hệ thống

#### Steps:
1. Load list page (page 1)
2. Click next page
3. Click previous page
4. Change page size (10 → 20 → 50)

#### Expected Results:
- [ ] **Pagination info** hiển thị: "Showing 1-10 of 25"
- [ ] **Page navigation buttons**:
  - [ ] Previous (disabled on page 1)
  - [ ] Next (disabled on last page)
  - [ ] Page numbers clickable
- [ ] **Click next**: Load page 2 với new data
- [ ] **Click previous**: Return to page 1
- [ ] **Change page size**: 
  - [ ] Dropdown với options (10, 20, 50)
  - [ ] Select 20 → Shows 20 items per page
  - [ ] Reset to page 1 when changing page size
- [ ] **Loading skeleton** hiển thị khi fetching data

#### Console Check:
- [ ] **No errors**
- [ ] **Network calls**: Correct `page` and `size` params

---

### **TEST CASE 12: Time Slot Availability**

**Route:** `/admin/appointments/new` hoặc `/admin/appointments/[id]/edit`

#### Setup:
- Doctor có schedule: 08:00 - 17:00
- Đã có appointments: 09:00, 10:00, 14:30

#### Steps:
1. Select doctor & date
2. Observe time slots

#### Expected Results:
- [ ] **Available slots** (08:00, 08:30, 09:30, 10:30, ..., 16:30):
  - [ ] Color: Green/Blue
  - [ ] Clickable
  - [ ] Hover effect
- [ ] **Booked slots** (09:00, 10:00, 14:30):
  - [ ] Color: Gray
  - [ ] Disabled/not clickable
  - [ ] Tooltip: "Already booked"
- [ ] **Outside schedule** (trước 08:00, sau 17:00):
  - [ ] Không hiển thị trong list

#### Edit Mode Additional Check:
- [ ] **Current time slot** (nếu editing):
  - [ ] Có label "Current"
  - [ ] Color khác biệt (yellow/orange)
  - [ ] Still selectable (giữ nguyên time)

---

### **TEST CASE 13: Form Reset & Cancel**

**Route:** `/admin/appointments/new` hoặc edit

#### Steps:
1. Fill một số fields
2. Click "Cancel" hoặc "Back" button
3. Observe behavior

#### Expected Results:
- [ ] **Cancel button** hiển thị
- [ ] **Click Cancel**:
  - [ ] Confirmation dialog (optional): "Are you sure? Unsaved changes will be lost"
  - [ ] Confirm → Navigate back to list/detail page
  - [ ] Cancel → Stay on form
- [ ] **No data saved** (verify by checking list/detail)

---

### **TEST CASE 14: Permission & Role Check**

#### Test as ADMIN:
- [ ] Can **view** all appointments (any patient, any doctor)
- [ ] Can **create** appointments for any patient
- [ ] Can **edit** any SCHEDULED appointment
- [ ] Can **cancel** any SCHEDULED appointment
- [ ] Can **complete** any SCHEDULED appointment

#### Compare with RECEPTIONIST (if time permits):
- [ ] RECEPTIONIST có access /admin/appointments
- [ ] RECEPTIONIST có thể create/edit/cancel
- [ ] RECEPTIONIST **KHÔNG thể complete** (doctor only)

#### Compare with PATIENT (if time permits):
- [ ] PATIENT **KHÔNG có access** /admin/appointments
- [ ] PATIENT chỉ có access /patient/appointments (own only)

---

### **TEST CASE 15: Error Handling**

#### Network Error Simulation:
- [ ] **Offline mode**: Turn off wifi
  - [ ] Error toast: "Network error. Please check your connection"
  - [ ] Form không submit
  - [ ] Can retry when back online
- [ ] **API Error (500)**: Mock server error
  - [ ] Error toast: "Server error. Please try again later"
  - [ ] Form reset hoặc stay filled (để user retry)

#### Data Validation Errors:
- [ ] **Patient not found**: Select patient → Patient gets deleted → Submit
  - [ ] Error: "Patient not found"
- [ ] **Doctor not found**: Same flow
  - [ ] Error: "Doctor not found"
- [ ] **Doctor not available**: Doctor có appointment đúng lúc đó
  - [ ] Error: "Doctor is not available at this time"

---

### **TEST CASE 16: UI/UX Polish**

#### Loading States:
- [ ] **List loading**: Skeleton loader hiển thị
- [ ] **Form submit**: Button shows spinner, text changes to "Creating..."
- [ ] **Time slots loading**: Skeleton/spinner khi loading slots

#### Empty States:
- [ ] **No appointments**: "No appointments found" message + "Create first appointment" button
- [ ] **No search results**: "No results for 'keyword'" + "Clear filters" button
- [ ] **No time slots**: "Doctor has no schedule on this date"

#### Responsive Design:
- [ ] **Desktop** (>1024px): Table view, full sidebar
- [ ] **Tablet** (768-1024px): Table still readable
- [ ] **Mobile** (<768px): 
  - [ ] Card view instead of table (optional)
  - [ ] Hamburger menu for sidebar
  - [ ] Form fields stack vertically

#### Accessibility:
- [ ] **Keyboard navigation**: Tab through form fields
- [ ] **Focus indicators**: Visible focus on buttons/inputs
- [ ] **Screen reader**: Labels present on all inputs
- [ ] **Color contrast**: Text readable, not relying on color alone

---

### **TEST CASE 17: Date & Time Handling**

#### Timezone Test:
- [ ] **Date display**: Shows correct format (DD/MM/YYYY hoặc MM/DD/YYYY)
- [ ] **Time display**: Shows correct format (HH:mm in 24h or 12h with AM/PM)
- [ ] **Sorting by date**: Chronological order correct

#### Past Date Handling:
- [ ] **Cannot select past dates** in calendar
- [ ] **Past appointments** can still be viewed (in history)
- [ ] **Cannot edit past appointments**

#### Future Appointments:
- [ ] **Can book far future** (e.g., 3 months ahead)
- [ ] **Calendar navigation** smooth (next/prev month)

---

### **TEST CASE 18: Data Persistence**

#### Create & Verify:
1. Create new appointment
2. Note down details (ID, patient, doctor, time)
3. **Refresh page** (F5)
4. Search for the appointment
   - [ ] Appointment still exists
   - [ ] All data intact

#### Edit & Verify:
1. Edit an appointment (change time)
2. **Close tab and reopen**
3. View the appointment
   - [ ] Changes saved correctly
   - [ ] Old time not showing

#### Cancel & Verify:
1. Cancel an appointment
2. **Clear browser cache**
3. Login again and check
   - [ ] Status = CANCELLED
   - [ ] Cancel reason preserved

---

### **TEST CASE 19: Concurrent Actions**

#### Multi-User Scenario (if possible):
- [ ] **User A** books time slot 10:00
- [ ] **User B** tries to book same slot simultaneously
  - [ ] One succeeds, one gets error "Time slot already booked"
- [ ] **User A** edits appointment
- [ ] **User B** tries to edit same appointment
  - [ ] Both can access edit form
  - [ ] Last save wins (or show conflict warning)

---

### **TEST CASE 20: Performance**

#### Load Time:
- [ ] **List page**: Loads < 2 seconds (with 100 appointments)
- [ ] **Detail page**: Loads < 1 second
- [ ] **Form page**: Loads < 1 second
- [ ] **Time slots**: Loads < 1 second after selecting date

#### Form Interaction:
- [ ] **Search patients**: Shows results < 500ms
- [ ] **Search doctors**: Shows results < 500ms
- [ ] **Calendar open**: Opens instantly (< 100ms)

#### Network Optimization:
- [ ] **Debounced search**: Not firing API on every keystroke
- [ ] **Cached data**: Second visit to same appointment faster
- [ ] **Pagination**: Only loads needed page, not all data

---

## 📊 Test Summary

### Pass/Fail Criteria

**Must Pass (Critical):**
- [ ] Can view appointment list
- [ ] Can create new appointment
- [ ] Can view appointment detail
- [ ] Can edit SCHEDULED appointment
- [ ] Can cancel SCHEDULED appointment
- [ ] Validation prevents invalid data
- [ ] No console errors during normal flow

**Should Pass (Important):**
- [ ] Filters and search work
- [ ] Time slots show correctly
- [ ] Pagination works
- [ ] Loading states appear
- [ ] Error messages clear

**Nice to Have:**
- [ ] Responsive design
- [ ] Smooth animations
- [ ] Perfect accessibility
- [ ] Optimal performance

---

### Test Results Summary

| Category | Total Tests | Passed | Failed | Skipped |
|----------|-------------|--------|--------|---------|
| List View | ___ | ___ | ___ | ___ |
| Create | ___ | ___ | ___ | ___ |
| Edit | ___ | ___ | ___ | ___ |
| Cancel | ___ | ___ | ___ | ___ |
| Complete | ___ | ___ | ___ | ___ |
| Validation | ___ | ___ | ___ | ___ |
| Permissions | ___ | ___ | ___ | ___ |
| UI/UX | ___ | ___ | ___ | ___ |
| **TOTAL** | **___** | **___** | **___** | **___** |

---

## 🐛 Issues Found

### Issue Template

**Issue #1**
- **Test Case**: ___ (e.g., TEST CASE 2)
- **Severity**: Critical / High / Medium / Low
- **Description**: ___
- **Steps to Reproduce**: 
  1. ___
  2. ___
- **Expected**: ___
- **Actual**: ___
- **Screenshot**: ___ (optional)
- **Console Error**: ___ (if any)

---

## 🚀 Quick Start Testing Script

### For Manual Testing:

```bash
# 1. Start dev server
npm run dev

# 2. Open browser
http://localhost:3000

# 3. Login as ADMIN
Email: admin@test.com
Password: [your admin password]

# 4. Navigate to Appointments
Click sidebar: Appointments

# 5. Follow test cases in order
Start from TEST CASE 1 → TEST CASE 20
```

### Common Test Data:

**Test Patients:**
- Patient A: John Doe (ID: pat-001)
- Patient B: Jane Smith (ID: pat-002)
- Patient C: Bob Wilson (ID: pat-003)

**Test Doctors:**
- Dr. Sarah Johnson (Cardiology, ID: doc-001)
- Dr. Michael Chen (Pediatrics, ID: doc-002)
- Dr. Emily Brown (General, ID: doc-003)

**Test Scenarios:**
1. **Happy path**: Create appointment cho Patient A với Dr. Johnson, tomorrow 10:00
2. **Conflict**: Try to book same time slot again
3. **Cancel**: Cancel the appointment just created
4. **Edit**: Change appointment time to 14:00

---

## 📝 Notes

### Known Issues:
- ___

### Environment Details:
- **Browser**: ___ (Chrome 120, Firefox 121, etc.)
- **OS**: ___ (Windows 11, macOS 14, etc.)
- **Screen Resolution**: ___ (1920x1080, etc.)
- **Network**: ___ (WiFi, 4G, etc.)

### Additional Comments:
___

---

**Tester Signature:** ___________  
**Date Completed:** ___________  
**Overall Status:** ⬜ PASS / ⬜ FAIL / ⬜ PARTIAL
