# Billing Service - Frontend Specification

**Project:** Hospital Management System  
**Service:** Billing Service (Invoice & Payment Management)  
**Version:** 1.0  
**Last Updated:** December 4, 2025  
**Target Users:** ADMIN (full access), PATIENT (own invoices only)

---

## 1. Overview & Screen Inventory

### 1.1 Service Scope

The Billing Service manages patient invoices and payment processing. It provides:
- Invoice generation (auto-generated from prescription creation)
- Invoice listing with filters (by patient, status, date range)
- Invoice details view (line items, payment history)
- Payment recording (Cash, Credit Card, Bank Transfer, Insurance)
- Payment history tracking
- Patient billing portal (view own invoices, make payments)

### 1.2 Related Backend

| Item | Value |
|------|-------|
| **Service** | billing-service |
| **Port** | 8087 |
| **Base Path** | `/api/billing` |
| **Database** | `billing_db` |
| **Tables** | `invoices`, `invoice_items`, `payments` |

### 1.3 Cross-Service Dependencies

| Service | Purpose | Endpoints Used |
|---------|---------|----------------|
| **Appointment Service** | Appointment reference | `GET /api/appointments/{id}` |
| **Patient Service** | Patient lookup | `GET /api/patients`, `GET /api/patients/{id}` |
| **Medical Exam Service** | Prescription reference | `GET /api/exams/{examId}/prescription` |

### 1.4 Screen Inventory

| Route | Screen Name | Component | Access | Priority |
|-------|-------------|-----------|--------|----------|
| `/admin/billing` | Invoice List (Admin) | `InvoiceListPage` | ADMIN | P0 |
| `/admin/billing/{id}` | Invoice Detail | `InvoiceDetailPage` | ADMIN | P0 |
| `/admin/billing/{id}/payment` | Record Payment | `PaymentFormPage` | ADMIN | P0 |
| `/admin/billing/payments` | Payment History | `PaymentListPage` | ADMIN | P1 |
| `/patient/billing` | My Invoices | `PatientInvoiceListPage` | PATIENT | P0 |
| `/patient/billing/{id}` | Invoice Detail (Patient) | `InvoiceDetailPage` | PATIENT | P0 |
| `/patient/billing/{id}/pay` | Make Payment | `PatientPaymentPage` | PATIENT | P1 |

### 1.5 Screen Hierarchy Diagram

```
/admin
└── /billing
    ├── (list view - all invoices with filters)
    ├── /{id} (invoice detail with line items & payments)
    ├── /{id}/payment (record payment form)
    └── /payments (all payments history)

/patient
└── /billing
    ├── (list view - own invoices only)
    ├── /{id} (invoice detail - read only)
    └── /{id}/pay (make payment - online payment flow)
```

### 1.6 Invoice Status Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      Invoice Status Flow                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌────────┐                                                      │
│   │ UNPAID │ ← Invoice created (auto-generated from prescription) │
│   └───┬────┘                                                      │
│       │                                                           │
│       ▼ Partial payment received                                  │
│   ┌────────────────┐                                              │
│   │ PARTIALLY_PAID │                                              │
│   └───────┬────────┘                                              │
│           │                                                       │
│           ▼ Full payment received                                 │
│       ┌──────┐                                                    │
│       │ PAID │ ← Final state (immutable)                          │
│       └──────┘                                                    │
│                                                                   │
│   Alternative paths:                                              │
│   ┌────────┐                                                      │
│   │OVERDUE │ ← dueDate passed & status != PAID (auto-updated)    │
│   └────────┘                                                      │
│                                                                   │
│   ┌───────────┐                                                   │
│   │ CANCELLED │ ← Admin cancellation (rare, requires reason)      │
│   └───────────┘                                                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. User Flows & Acceptance Criteria

### 2.1 Flow: View Invoice List (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│ Admin navigates to /admin/billing                           │
│                          ↓                                  │
│ System loads invoice list with pagination                   │
│                          ↓                                  │
│ Admin can: Search by patient, Filter by status/date, Sort   │
│                          ↓                                  │
│ Admin clicks row → Navigate to invoice detail               │
│ Admin clicks "Record Payment" → Navigate to payment form    │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Page loads within 2 seconds
- [ ] Table displays: Invoice #, Patient Name, Date, Total, Paid, Balance, Status, Actions
- [ ] Search filters by patient name (debounced 300ms)
- [ ] Status filter: All, UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED
- [ ] Date range filter: Start date, End date
- [ ] Pagination: 10, 20, 50 items per page
- [ ] Sort by: Date (default desc), Total Amount, Status
- [ ] Empty state shown when no invoices match filters
- [ ] Loading skeleton shown while fetching data
- [ ] Status badges with distinct colors
- [ ] Balance column shows remaining amount (totalAmount - paidAmount)
- [ ] Quick action: "Record Payment" visible for UNPAID/PARTIALLY_PAID invoices

---

### 2.2 Flow: View Invoice Detail (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│ Admin clicks invoice row or navigates to /{id}              │
│                          ↓                                  │
│ System fetches invoice detail (GET /api/billing/invoices/{id})│
│         ↓                              ↓                    │
│   [Found]                        [Not Found]                │
│      ↓                                ↓                     │
│   Display detail page            Show 404 page              │
│      ↓                                                      │
│   Show: Patient info, Line items, Payment history           │
│      ↓                                                      │
│   Available actions based on status:                        │
│   - UNPAID/PARTIALLY_PAID: Record Payment                   │
│   - UNPAID: Cancel Invoice (with reason)                    │
│   - PAID: View only (print receipt)                         │
│   - CANCELLED: View only                                    │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Display invoice header: Invoice #, Date, Due Date, Status
- [ ] Display patient information section
- [ ] Display line items table: Type, Description, Qty, Unit Price, Amount
- [ ] Display totals section: Subtotal, Discount, Tax (10%), Total
- [ ] Display payment summary: Total, Paid, Balance Due
- [ ] Display payment history table (if payments exist)
- [ ] "Record Payment" button for UNPAID/PARTIALLY_PAID
- [ ] "Cancel Invoice" button for UNPAID only (requires confirmation + reason)
- [ ] "Print Invoice" button for all statuses
- [ ] Link to related appointment/medical exam
- [ ] OVERDUE status shows warning banner with days overdue

---

### 2.3 Flow: Record Payment (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│ Admin clicks "Record Payment" on invoice                    │
│                          ↓                                  │
│ Navigate to /admin/billing/{id}/payment                     │
│                          ↓                                  │
│ System shows payment form with invoice summary              │
│                          ↓                                  │
│ Admin enters: Amount, Payment Method, Notes                 │
│                          ↓                                  │
│ Admin clicks "Record Payment"                               │
│         ↓                              ↓                    │
│   [Validation Pass]            [Validation Fail]            │
│         ↓                              ↓                    │
│   Generate idempotencyKey      Show field errors            │
│   POST /api/billing/payments                                │
│         ↓                                                   │
│   ┌─────────┐    ┌──────────────┐                          │
│   │ Success │    │    Error     │                          │
│   └────┬────┘    └──────┬───────┘                          │
│        ↓                ↓                                   │
│   Toast "Recorded"   Toast error message                    │
│   Redirect to detail Stay on form                           │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Display invoice summary (Patient, Total, Paid, Balance)
- [ ] Amount field: Pre-filled with balance due, editable
- [ ] Amount validation: Must be > 0 and <= balance due
- [ ] Payment method: Radio buttons (CASH, CREDIT_CARD, BANK_TRANSFER, INSURANCE)
- [ ] Notes field: Optional, max 1000 characters
- [ ] Generate UUID idempotency key on form load (for retry safety)
- [ ] "Full Payment" quick button sets amount to balance due
- [ ] Success: Toast "Payment recorded successfully", redirect to invoice detail
- [ ] Error 409 DUPLICATE_PAYMENT: Show "Payment already processed" (idempotency)
- [ ] Error 409 INVOICE_ALREADY_PAID: Show "Invoice is already fully paid"
- [ ] Error 409 INVOICE_CANCELLED: Show "Cannot pay a cancelled invoice"
- [ ] Error 400 amount exceeds balance: Show "Amount exceeds remaining balance"
- [ ] "Cancel" button returns to invoice detail without saving

---

### 2.4 Flow: View My Invoices (Patient)

```
┌─────────────────────────────────────────────────────────────┐
│ Patient navigates to /patient/billing                       │
│                          ↓                                  │
│ System loads patient's invoices only                        │
│ (GET /api/billing/invoices/by-patient/{patientId})          │
│                          ↓                                  │
│ Display invoice cards (unpaid first, then paid)             │
│                          ↓                                  │
│ Patient can filter by status                                │
│                          ↓                                  │
│ Patient clicks card → View invoice detail                   │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Invoices auto-filtered to logged-in patient
- [ ] Unpaid/Partially Paid invoices shown first with highlight
- [ ] Card view with: Invoice #, Date, Total, Status, Balance
- [ ] Status filter: All, Unpaid, Paid
- [ ] OVERDUE invoices show warning indicator
- [ ] "Pay Now" quick action on unpaid invoices (if online payment enabled)
- [ ] Empty state: "No invoices found"

---

### 2.5 Flow: View Invoice Detail (Patient)

```
┌─────────────────────────────────────────────────────────────┐
│ Patient clicks invoice card or navigates to /{id}           │
│                          ↓                                  │
│ System fetches invoice (validates patient owns invoice)     │
│         ↓                              ↓                    │
│   [Authorized]                   [Forbidden]                │
│      ↓                                ↓                     │
│   Display detail page            Show 403 page              │
│      ↓                                                      │
│   Show: Line items, Totals, Payment history                 │
│      ↓                                                      │
│   Available actions:                                        │
│   - UNPAID/PARTIALLY_PAID: "Pay Now" (online payment)       │
│   - PAID: "Download Receipt"                                │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Patient can only view own invoices (403 for others)
- [ ] Display invoice details (same as admin but read-only)
- [ ] Display payment history
- [ ] "Pay Now" button for unpaid invoices (redirects to payment page)
- [ ] "Download Receipt" for paid invoices (PDF generation)
- [ ] No cancel/edit actions for patients

---

### 2.6 Flow: Make Payment (Patient)

```
┌─────────────────────────────────────────────────────────────┐
│ Patient clicks "Pay Now" on unpaid invoice                  │
│                          ↓                                  │
│ Navigate to /patient/billing/{id}/pay                       │
│                          ↓                                  │
│ System shows payment form with invoice summary              │
│                          ↓                                  │
│ Patient enters: Amount (optional partial), Payment Method   │
│                          ↓                                  │
│ Patient clicks "Pay Now"                                    │
│         ↓                              ↓                    │
│   [Online Payment]              [At Counter]                │
│      ↓                              ↓                       │
│   Redirect to gateway         Show instructions to pay      │
│      ↓                         at hospital cashier          │
│   Return URL handles                                        │
│   success/failure                                           │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Display invoice summary (Total, Balance Due)
- [ ] Amount field: Default to full balance, allow partial payment
- [ ] Payment method options: Credit Card, Bank Transfer (online)
- [ ] "Pay at Counter" option shows hospital payment instructions
- [ ] Generate idempotency key for payment safety
- [ ] Success: Show confirmation, update invoice status
- [ ] Error handling same as admin flow
- [ ] Payment confirmation receipt shown/emailed

---

### 2.7 Flow: View Payment History (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│ Admin navigates to /admin/billing/payments                  │
│                          ↓                                  │
│ System loads all payments with pagination                   │
│                          ↓                                  │
│ Admin can: Filter by method, date range, search by invoice  │
│                          ↓                                  │
│ Admin clicks row → Navigate to invoice detail               │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Table displays: Payment ID, Invoice #, Patient, Amount, Method, Date, Status
- [ ] Filter by payment method: All, CASH, CREDIT_CARD, BANK_TRANSFER, INSURANCE
- [ ] Date range filter
- [ ] Search by invoice number
- [ ] Sort by: Date (default desc), Amount
- [ ] Click row navigates to parent invoice detail
- [ ] Daily/weekly payment summary statistics

---

### 2.8 Flow: Cancel Invoice (Admin)

```
┌─────────────────────────────────────────────────────────────┐
│ Admin clicks "Cancel Invoice" on UNPAID invoice             │
│                          ↓                                  │
│ Show confirmation modal with reason input                   │
│                          ↓                                  │
│ Admin enters cancellation reason (required)                 │
│                          ↓                                  │
│ Admin confirms cancellation                                 │
│         ↓                              ↓                    │
│   [Success]                      [Error]                    │
│      ↓                              ↓                       │
│   Toast "Cancelled"          Show error message             │
│   Update invoice status                                     │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Only UNPAID invoices can be cancelled
- [ ] Confirmation modal with warning message
- [ ] Reason field required, max 500 characters
- [ ] Cannot cancel invoice with any payments recorded
- [ ] Success: Update status to CANCELLED, show toast
- [ ] Cancelled invoices are excluded from patient portal by default

---

## 3. Screen Specifications

### 3.1 Invoice List Page (Admin)

**Route:** `/admin/billing`  
**Component:** `InvoiceListPage`  
**Access:** ADMIN

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: "Billing & Invoices"                                        │
├─────────────────────────────────────────────────────────────────────┤
│ Summary Cards Row:                                                  │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │
│ │ Total      │ │ Unpaid     │ │ Overdue    │ │ Collected  │        │
│ │ ₫15.5M     │ │ ₫3.2M      │ │ ₫500K      │ │ ₫11.8M     │        │
│ │ 45 invoices│ │ 12 invoices│ │ 3 invoices │ │ This month │        │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘        │
├─────────────────────────────────────────────────────────────────────┤
│ Filters Row:                                                        │
│ [Search Patient...] [Status ▼] [Start Date] [End Date] [Clear]     │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Invoice #    │ Patient      │ Date     │ Total    │ Balance │Sta│ │
│ ├──────────────┼──────────────┼──────────┼──────────┼─────────┼───┤ │
│ │ INV-20251205 │ Nguyen Van A │ Dec 5    │ ₫396,000 │ ₫396,000│🔴 │ │
│ │ INV-20251204 │ Tran Thi B   │ Dec 4    │ ₫550,000 │ ₫0      │🟢 │ │
│ │ INV-20251203 │ Le Van C     │ Dec 3    │ ₫280,000 │ ₫140,000│🟡 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ Showing 1-10 of 45                              [< 1 2 3 4 5 >]     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Summary Cards

| Card | Value | Calculation |
|------|-------|-------------|
| Total Invoices | Count + Sum | All invoices in period |
| Unpaid | Count + Sum | status IN (UNPAID, PARTIALLY_PAID) |
| Overdue | Count + Sum | status = OVERDUE |
| Collected | Sum | Total payments this month |

#### Filter Components

| Filter | Type | Options | Default |
|--------|------|---------|---------|
| Search | Text Input | Patient name search | Empty |
| Status | Select | All, UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED | All |
| Start Date | Date Picker | Any date | Empty |
| End Date | Date Picker | Any date | Empty |

#### Table Columns

| Column | Field | Sortable | Width |
|--------|-------|----------|-------|
| Invoice # | `invoiceNumber` | Yes | 15% |
| Patient | `patient.fullName` | Yes | 20% |
| Date | `invoiceDate` | Yes (default desc) | 12% |
| Due Date | `dueDate` | Yes | 12% |
| Total | `totalAmount` | Yes | 12% |
| Paid | `paidAmount` | No | 10% |
| Balance | `totalAmount - paidAmount` | No | 10% |
| Status | `status` | Yes | 9% |

#### Action Buttons per Row

| Status | Actions Available |
|--------|-------------------|
| UNPAID | View, Record Payment |
| PARTIALLY_PAID | View, Record Payment |
| PAID | View |
| OVERDUE | View, Record Payment |
| CANCELLED | View |

#### Status Badge Styles

| Status | Color | Icon |
|--------|-------|------|
| UNPAID | Red (`bg-red-100 text-red-800`) | 🔴 Circle |
| PARTIALLY_PAID | Yellow (`bg-yellow-100 text-yellow-800`) | 🟡 Half |
| PAID | Green (`bg-green-100 text-green-800`) | 🟢 Check |
| OVERDUE | Orange (`bg-orange-100 text-orange-800`) | ⚠️ Warning |
| CANCELLED | Gray (`bg-gray-100 text-gray-800`) | ✕ X |

---

### 3.2 Invoice Detail Page

**Route:** `/admin/billing/{id}` or `/patient/billing/{id}`  
**Component:** `InvoiceDetailPage`  
**Access:** ADMIN (all), PATIENT (own only)

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ [← Back to Invoices]                    [Print] [Record Payment]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────┐  ┌───────────────────────────┐│
│  │ Invoice #INV-20251205-0001      │  │ Status: 🔴 UNPAID         ││
│  │ Date: December 5, 2025          │  │ Due: December 12, 2025    ││
│  │ Related: Appointment #APT001    │  │                           ││
│  └─────────────────────────────────┘  └───────────────────────────┘│
│                                                                     │
│  Patient Information                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Name:        Nguyen Van A                                    │   │
│  │ Phone:       0901234567                                      │   │
│  │ [View Patient Profile →]                                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Invoice Items                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Type       │ Description            │ Qty │ Price   │ Amount │   │
│  ├────────────┼────────────────────────┼─────┼─────────┼────────┤   │
│  │ CONSULT    │ Cardiology Consultation│  1  │ ₫200,000│₫200,000│   │
│  │ MEDICINE   │ Amoxicillin 500mg      │ 20  │  ₫8,000 │₫160,000│   │
│  │ MEDICINE   │ Paracetamol 500mg      │ 10  │  ₫1,500 │ ₫15,000│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Totals                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                              Subtotal:          ₫375,000     │   │
│  │                              Discount:                ₫0     │   │
│  │                              Tax (10%):          ₫37,500     │   │
│  │                              ─────────────────────────────   │   │
│  │                              TOTAL:             ₫412,500     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Payment Summary                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Total Amount:                                   ₫412,500     │   │
│  │ Amount Paid:                                          ₫0     │   │
│  │ ─────────────────────────────────────────────────────────   │   │
│  │ BALANCE DUE:                                    ₫412,500     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Payment History (0 payments)                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ No payments recorded yet.                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Actions                                                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ [Record Payment]  [Cancel Invoice]  [View Medical Exam]      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Audit Information                                                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Created: Dec 5, 2025 10:30 AM                                │   │
│  │ Last Updated: Dec 5, 2025 10:30 AM                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Invoice Items Table

| Column | Field | Width |
|--------|-------|-------|
| Type | `type` (badge) | 15% |
| Description | `description` | 40% |
| Qty | `quantity` | 10% |
| Unit Price | `unitPrice` | 15% |
| Amount | `amount` | 20% |

#### Item Type Badge Styles

| Type | Color | Icon |
|------|-------|------|
| CONSULTATION | Purple (`bg-purple-100 text-purple-800`) | 🩺 |
| MEDICINE | Blue (`bg-blue-100 text-blue-800`) | 💊 |
| TEST | Cyan (`bg-cyan-100 text-cyan-800`) | 🧪 |
| OTHER | Gray (`bg-gray-100 text-gray-800`) | 📋 |

#### Payment History Table (if payments exist)

| Column | Field | Width |
|--------|-------|-------|
| Date | `paymentDate` | 20% |
| Amount | `amount` | 20% |
| Method | `method` (badge) | 20% |
| Status | `status` | 15% |
| Notes | `notes` | 25% |

#### Conditional Actions by Status & Role

| Status | ADMIN | PATIENT |
|--------|-------|---------|
| UNPAID | Record Payment, Cancel, Print | Pay Now, Print |
| PARTIALLY_PAID | Record Payment, Print | Pay Now, Print |
| PAID | Print, Download Receipt | Download Receipt |
| OVERDUE | Record Payment, Print | Pay Now, Print |
| CANCELLED | View only | Hidden from list |

---

### 3.3 Payment Form Page (Admin)

**Route:** `/admin/billing/{id}/payment`  
**Component:** `PaymentFormPage`  
**Access:** ADMIN

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: "Record Payment"                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Invoice Summary                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Invoice:     #INV-20251205-0001                              │   │
│  │ Patient:     Nguyen Van A                                    │   │
│  │ Total:       ₫412,500                                        │   │
│  │ Paid:        ₫200,000                                        │   │
│  │ Balance Due: ₫212,500                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Payment Details                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Amount*                                                      │   │
│  │ ┌─────────────────────────────────┐ [Pay Full Balance]      │   │
│  │ │ ₫212,500                        │                          │   │
│  │ └─────────────────────────────────┘                          │   │
│  │ Maximum: ₫212,500                                            │   │
│  │                                                              │   │
│  │ Payment Method*                                              │   │
│  │ (●) Cash          ( ) Credit Card                            │   │
│  │ ( ) Bank Transfer ( ) Insurance                              │   │
│  │                                                              │   │
│  │ Notes                                                        │   │
│  │ ┌─────────────────────────────────────────────────────────┐ │   │
│  │ │ Optional payment notes...                                │ │   │
│  │ └─────────────────────────────────────────────────────────┘ │   │
│  │ 0/1000 characters                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                              [Cancel]  [Record Payment]             │
└─────────────────────────────────────────────────────────────────────┘
```

#### Form Fields

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `amount` | Number Input | Yes | > 0, <= balanceDue |
| `method` | Radio Group | Yes | CASH, CREDIT_CARD, BANK_TRANSFER, INSURANCE |
| `notes` | Textarea | No | Max 1000 chars |
| `idempotencyKey` | Hidden | Yes | Auto-generated UUID |

#### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| amount | Required | "Please enter payment amount" |
| amount | > 0 | "Amount must be greater than 0" |
| amount | <= balance | "Amount cannot exceed remaining balance (₫{balance})" |
| method | Required | "Please select payment method" |
| notes | Max 1000 | "Notes cannot exceed 1000 characters" |

#### Payment Method Options

| Method | Label | Icon |
|--------|-------|------|
| CASH | Cash | 💵 |
| CREDIT_CARD | Credit Card | 💳 |
| BANK_TRANSFER | Bank Transfer | 🏦 |
| INSURANCE | Insurance | 🏥 |

---

### 3.4 Patient Invoice List Page

**Route:** `/patient/billing`  
**Component:** `PatientInvoiceListPage`  
**Access:** PATIENT only

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ My Bills & Invoices                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Outstanding Balance                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ You have 2 unpaid invoices totaling ₫612,500                 │   │
│  │                                              [Pay All Now]   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Filter: [All] [Unpaid] [Paid]                                     │
│                                                                     │
│  Unpaid Invoices                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📄 Invoice #INV-20251205-0001              🔴 UNPAID        │   │
│  │    December 5, 2025 • Due: December 12, 2025                 │   │
│  │    Cardiology Consultation + 2 medicines                     │   │
│  │    Total: ₫412,500          Balance: ₫412,500                │   │
│  │                                        [View] [Pay Now]      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📄 Invoice #INV-20251203-0003              🟡 PARTIALLY_PAID│   │
│  │    December 3, 2025 • Due: December 10, 2025                 │   │
│  │    General Checkup + 1 medicine                              │   │
│  │    Total: ₫200,000          Balance: ₫100,000                │   │
│  │                                        [View] [Pay Now]      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Paid Invoices                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 📄 Invoice #INV-20251201-0005              🟢 PAID          │   │
│  │    December 1, 2025                                          │   │
│  │    Pediatrics Consultation                                   │   │
│  │    Total: ₫150,000          Paid: ₫150,000                   │   │
│  │                                   [View] [Download Receipt]  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.5 Patient Payment Page

**Route:** `/patient/billing/{id}/pay`  
**Component:** `PatientPaymentPage`  
**Access:** PATIENT only

#### Layout Structure (Step Wizard)

```
Step 1: Review Invoice
┌─────────────────────────────────────────────────────────────────────┐
│ Pay Invoice                                                         │
│ ─────────────────────────────────────────────────────────────────── │
│ Step 1 of 2: Review Invoice                                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Invoice #INV-20251205-0001                                         │
│                                                                     │
│  Items:                                                             │
│  • Cardiology Consultation                          ₫200,000        │
│  • Amoxicillin 500mg (20 units)                     ₫160,000        │
│  • Paracetamol 500mg (10 units)                      ₫15,000        │
│  ──────────────────────────────────────────────────────────         │
│  Subtotal                                           ₫375,000        │
│  Tax (10%)                                           ₫37,500        │
│  ──────────────────────────────────────────────────────────         │
│  Total                                              ₫412,500        │
│  Already Paid                                              ₫0       │
│  ──────────────────────────────────────────────────────────         │
│  Amount Due                                         ₫412,500        │
│                                                                     │
│                                           [Cancel]  [Continue →]    │
└─────────────────────────────────────────────────────────────────────┘

Step 2: Payment Method
┌─────────────────────────────────────────────────────────────────────┐
│ Pay Invoice                                                         │
│ ─────────────────────────────────────────────────────────────────── │
│ Step 2 of 2: Choose Payment Method                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Amount to Pay: ₫412,500                                            │
│                                                                     │
│  Payment Amount                                                     │
│  (●) Pay Full Balance (₫412,500)                                    │
│  ( ) Pay Partial Amount: [___________]                              │
│                                                                     │
│  Payment Method                                                     │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │ 💳 Credit Card      │  │ 🏦 Bank Transfer    │                  │
│  │ Pay online now      │  │ Pay online now      │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ 💵 Pay at Hospital Counter                                   │   │
│  │ Visit the cashier at the hospital reception                  │   │
│  │ Hours: 7:00 AM - 5:00 PM (Mon-Sat)                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                                      [← Back]  [Cancel]  [Pay Now]  │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 3.6 Payment History Page (Admin)

**Route:** `/admin/billing/payments`  
**Component:** `PaymentListPage`  
**Access:** ADMIN

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header: "Payment History"                                           │
├─────────────────────────────────────────────────────────────────────┤
│ Summary Cards Row:                                                  │
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │
│ │ Today      │ │ This Week  │ │ Cash       │ │ Card       │        │
│ │ ₫2.5M      │ │ ₫8.2M      │ │ ₫5.1M      │ │ ₫3.1M      │        │
│ │ 15 payments│ │ 48 payments│ │ 62%        │ │ 38%        │        │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘        │
├─────────────────────────────────────────────────────────────────────┤
│ Filters Row:                                                        │
│ [Search Invoice #...] [Method ▼] [Start Date] [End Date] [Clear]   │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Payment ID │ Invoice #    │ Patient      │ Amount   │ Method │Da│ │
│ ├────────────┼──────────────┼──────────────┼──────────┼────────┼──┤ │
│ │ PAY001     │ INV-20251205 │ Nguyen Van A │ ₫412,500 │ 💵CASH │12│ │
│ │ PAY002     │ INV-20251204 │ Tran Thi B   │ ₫275,000 │ 💳CARD │12│ │
│ │ PAY003     │ INV-20251203 │ Le Van C     │ ₫100,000 │ 🏦BANK │12│ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ Showing 1-10 of 150                             [< 1 2 3 4 5 >]     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Table Columns

| Column | Field | Sortable | Width |
|--------|-------|----------|-------|
| Payment ID | `id` (truncated) | No | 12% |
| Invoice # | `invoice.invoiceNumber` | Yes | 18% |
| Patient | `patient.fullName` | Yes | 18% |
| Amount | `amount` | Yes | 15% |
| Method | `method` | Yes | 12% |
| Status | `status` | No | 10% |
| Date | `paymentDate` | Yes (default desc) | 15% |

#### Payment Method Badge Styles

| Method | Color | Icon |
|--------|-------|------|
| CASH | Green (`bg-green-100 text-green-800`) | 💵 |
| CREDIT_CARD | Blue (`bg-blue-100 text-blue-800`) | 💳 |
| BANK_TRANSFER | Purple (`bg-purple-100 text-purple-800`) | 🏦 |
| INSURANCE | Cyan (`bg-cyan-100 text-cyan-800`) | 🏥 |

---

## 4. API Integration

### 4.1 API Service File

**File:** `services/billing.service.ts`

```typescript
import api from '@/config/axios';

const BASE_URL = '/api/billing';

// ============ Type Definitions ============

export type InvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type ItemType = 'CONSULTATION' | 'MEDICINE' | 'TEST' | 'OTHER';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'INSURANCE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PatientSummary {
  id: string;
  fullName: string;
}

export interface AppointmentSummary {
  id: string;
  appointmentTime: string;
}

export interface InvoiceItem {
  id: string;
  type: ItemType;
  description: string;
  referenceId: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patient: PatientSummary;
  appointment: AppointmentSummary | null;
  invoiceDate: string;
  dueDate: string | null;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  patient: PatientSummary;
  invoiceDate: string;
  dueDate: string | null;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
}

export interface Payment {
  id: string;
  invoice: InvoiceSummary;
  idempotencyKey: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  paymentDate: string;
  createdAt: string;
}

export interface PaymentListItem {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
}

export interface PaymentsByInvoice {
  payments: PaymentListItem[];
  totalPaid: number;
  invoiceTotal: number;
  remainingBalance: number;
}

// ============ Request Types ============

export interface GenerateInvoiceRequest {
  appointmentId: string;
}

export interface CreatePaymentRequest {
  invoiceId: string;
  idempotencyKey: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

export interface InvoiceListParams {
  patientId?: string;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PatientInvoiceParams {
  status?: InvoiceStatus;
  page?: number;
  size?: number;
}

// ============ Response Types ============

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ============ API Service ============

const billingService = {
  // ---- Invoice APIs ----

  // Generate invoice (internal - triggered by prescription creation)
  generateInvoice: (data: GenerateInvoiceRequest) =>
    api.post<{ status: string; data: Invoice }>(`${BASE_URL}/invoices/generate`, data),

  // Get invoice by ID
  getInvoiceById: (id: string) =>
    api.get<{ status: string; data: Invoice }>(`${BASE_URL}/invoices/${id}`),

  // Get invoice by appointment
  getInvoiceByAppointment: (appointmentId: string) =>
    api.get<{ status: string; data: Invoice }>(`${BASE_URL}/invoices/by-appointment/${appointmentId}`),

  // List invoices (admin)
  getInvoiceList: (params: InvoiceListParams) =>
    api.get<{ status: string; data: PaginatedResponse<InvoiceListItem> }>(`${BASE_URL}/invoices`, { params }),

  // Get patient invoices
  getPatientInvoices: (patientId: string, params?: PatientInvoiceParams) =>
    api.get<{ status: string; data: PaginatedResponse<InvoiceListItem> }>(
      `${BASE_URL}/invoices/by-patient/${patientId}`,
      { params }
    ),

  // ---- Payment APIs ----

  // Create payment
  createPayment: (data: CreatePaymentRequest) =>
    api.post<{ status: string; data: Payment }>(`${BASE_URL}/payments`, data),

  // Get payment by ID
  getPaymentById: (id: string) =>
    api.get<{ status: string; data: Payment }>(`${BASE_URL}/payments/${id}`),

  // Get payments by invoice
  getPaymentsByInvoice: (invoiceId: string) =>
    api.get<{ status: string; data: PaymentsByInvoice }>(`${BASE_URL}/payments/by-invoice/${invoiceId}`),
};

export default billingService;
```

### 4.2 React Query Hooks

**File:** `hooks/queries/useBilling.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import billingService, {
  InvoiceListParams,
  PatientInvoiceParams,
  CreatePaymentRequest,
  GenerateInvoiceRequest,
} from '@/services/billing.service';
import { toast } from 'sonner';

// ============ Query Keys ============

export const billingKeys = {
  all: ['billing'] as const,
  invoices: () => [...billingKeys.all, 'invoices'] as const,
  invoiceList: (params: InvoiceListParams) => [...billingKeys.invoices(), 'list', params] as const,
  invoiceDetail: (id: string) => [...billingKeys.invoices(), 'detail', id] as const,
  invoiceByAppointment: (appointmentId: string) => [...billingKeys.invoices(), 'by-appointment', appointmentId] as const,
  patientInvoices: (patientId: string, params?: PatientInvoiceParams) => 
    [...billingKeys.invoices(), 'by-patient', patientId, params] as const,
  payments: () => [...billingKeys.all, 'payments'] as const,
  paymentDetail: (id: string) => [...billingKeys.payments(), 'detail', id] as const,
  paymentsByInvoice: (invoiceId: string) => [...billingKeys.payments(), 'by-invoice', invoiceId] as const,
};

// ============ Invoice Hooks ============

// Get invoice list (admin)
export const useInvoiceList = (params: InvoiceListParams) => {
  return useQuery({
    queryKey: billingKeys.invoiceList(params),
    queryFn: () => billingService.getInvoiceList(params),
    select: (response) => response.data.data,
  });
};

// Get invoice by ID
export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: billingKeys.invoiceDetail(id),
    queryFn: () => billingService.getInvoiceById(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

// Get invoice by appointment
export const useInvoiceByAppointment = (appointmentId: string) => {
  return useQuery({
    queryKey: billingKeys.invoiceByAppointment(appointmentId),
    queryFn: () => billingService.getInvoiceByAppointment(appointmentId),
    select: (response) => response.data.data,
    enabled: !!appointmentId,
  });
};

// Get patient invoices
export const usePatientInvoices = (patientId: string, params?: PatientInvoiceParams) => {
  return useQuery({
    queryKey: billingKeys.patientInvoices(patientId, params),
    queryFn: () => billingService.getPatientInvoices(patientId, params),
    select: (response) => response.data.data,
    enabled: !!patientId,
  });
};

// Generate invoice (mutation)
export const useGenerateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateInvoiceRequest) => billingService.generateInvoice(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      toast.success('Invoice generated successfully');
      return response.data.data;
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = getBillingErrorMessage(errorCode);
      toast.error(errorMessage);
    },
  });
};

// ============ Payment Hooks ============

// Get payments by invoice
export const usePaymentsByInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: billingKeys.paymentsByInvoice(invoiceId),
    queryFn: () => billingService.getPaymentsByInvoice(invoiceId),
    select: (response) => response.data.data,
    enabled: !!invoiceId,
  });
};

// Get payment by ID
export const usePayment = (id: string) => {
  return useQuery({
    queryKey: billingKeys.paymentDetail(id),
    queryFn: () => billingService.getPaymentById(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

// Create payment (mutation)
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => billingService.createPayment(data),
    onSuccess: (response, variables) => {
      // Invalidate invoice detail to refresh payment history
      queryClient.invalidateQueries({ queryKey: billingKeys.invoiceDetail(variables.invoiceId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.paymentsByInvoice(variables.invoiceId) });
      queryClient.invalidateQueries({ queryKey: billingKeys.invoices() });
      toast.success('Payment recorded successfully');
      return response.data.data;
    },
    onError: (error: any) => {
      const errorCode = error.response?.data?.error?.code;
      const errorMessage = getBillingErrorMessage(errorCode);
      toast.error(errorMessage);
    },
  });
};

// ============ Error Message Mapping ============

function getBillingErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    // Validation errors
    VALIDATION_ERROR: 'Please check your input and try again',
    
    // Invoice errors
    APPOINTMENT_NOT_FOUND: 'Appointment not found',
    PRESCRIPTION_NOT_FOUND: 'No prescription found for this appointment',
    INVOICE_NOT_FOUND: 'Invoice not found',
    INVOICE_EXISTS: 'Invoice already exists for this appointment',
    
    // Payment errors
    DUPLICATE_PAYMENT: 'Payment already processed (duplicate request)',
    INVOICE_ALREADY_PAID: 'Invoice is already fully paid',
    INVOICE_CANCELLED: 'Cannot pay a cancelled invoice',
    PAYMENT_NOT_FOUND: 'Payment not found',
    
    // Patient errors
    PATIENT_NOT_FOUND: 'Patient not found',
    
    // Auth errors
    UNAUTHORIZED: 'Please log in to continue',
    FORBIDDEN: 'You do not have permission to perform this action',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
}
```

### 4.3 API Endpoints Reference

#### 4.3.1 Generate Invoice (Internal)

**Endpoint:** `POST /api/billing/invoices/generate`  
**Access:** Internal (triggered by prescription creation)

**Request:**
```json
{
  "appointmentId": "apt001"
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "id": "inv001",
    "invoiceNumber": "INV-20251205-0001",
    "patient": {
      "id": "p001",
      "fullName": "Nguyen Van A"
    },
    "appointment": {
      "id": "apt001",
      "appointmentTime": "2025-12-05T09:00:00"
    },
    "invoiceDate": "2025-12-05T10:30:00Z",
    "dueDate": "2025-12-12T10:30:00Z",
    "items": [
      {
        "id": "ini001",
        "type": "CONSULTATION",
        "description": "Cardiology Consultation",
        "referenceId": null,
        "quantity": 1,
        "unitPrice": 200000,
        "amount": 200000
      },
      {
        "id": "ini002",
        "type": "MEDICINE",
        "description": "Amoxicillin 500mg",
        "referenceId": "rxi001",
        "quantity": 20,
        "unitPrice": 8000,
        "amount": 160000
      }
    ],
    "subtotal": 360000,
    "discount": 0,
    "tax": 36000,
    "totalAmount": 396000,
    "status": "UNPAID",
    "createdAt": "2025-12-05T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Code | Message | UI Action |
|--------|------|---------|-----------|
| 400 | VALIDATION_ERROR | appointmentId is required | Show field error |
| 400 | PRESCRIPTION_NOT_FOUND | No prescription for this appointment | Show toast error |
| 404 | APPOINTMENT_NOT_FOUND | Appointment doesn't exist | Show toast error |
| 409 | INVOICE_EXISTS | Invoice already exists | Show toast info |

---

#### 4.3.2 Get Invoice by ID

**Endpoint:** `GET /api/billing/invoices/{id}`  
**Access:** ADMIN, PATIENT (own)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "id": "inv001",
    "invoiceNumber": "INV-20251205-0001",
    "patient": {
      "id": "p001",
      "fullName": "Nguyen Van A"
    },
    "appointment": {
      "id": "apt001",
      "appointmentTime": "2025-12-05T09:00:00"
    },
    "invoiceDate": "2025-12-05T10:30:00Z",
    "dueDate": "2025-12-12T10:30:00Z",
    "items": [...],
    "subtotal": 360000,
    "discount": 0,
    "tax": 36000,
    "totalAmount": 396000,
    "paidAmount": 0,
    "balanceDue": 396000,
    "status": "UNPAID",
    "createdAt": "2025-12-05T10:30:00Z",
    "updatedAt": "2025-12-05T10:30:00Z"
  }
}
```

**Error Responses:**

| Status | Code | Message | UI Action |
|--------|------|---------|-----------|
| 401 | UNAUTHORIZED | Missing or invalid access token | Redirect to login |
| 403 | FORBIDDEN | User not authorized to view this invoice | Show 403 page |
| 404 | INVOICE_NOT_FOUND | Invoice doesn't exist | Show 404 page |

---

#### 4.3.3 Get Invoice by Appointment

**Endpoint:** `GET /api/billing/invoices/by-appointment/{appointmentId}`  
**Access:** ADMIN, PATIENT (own)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "id": "inv001",
    "invoiceNumber": "INV-20251205-0001",
    "patient": {...},
    "appointment": {...},
    "invoiceDate": "2025-12-05T10:30:00Z",
    "dueDate": "2025-12-12T10:30:00Z",
    "subtotal": 360000,
    "discount": 0,
    "tax": 36000,
    "totalAmount": 396000,
    "paidAmount": 0,
    "status": "UNPAID"
  }
}
```

**Error Responses:**

| Status | Code | Message | UI Action |
|--------|------|---------|-----------|
| 401 | UNAUTHORIZED | Missing or invalid access token | Redirect to login |
| 403 | FORBIDDEN | User not authorized | Show 403 page |
| 404 | APPOINTMENT_NOT_FOUND | Appointment doesn't exist | Show 404 page |
| 404 | INVOICE_NOT_FOUND | No invoice for this appointment | Show message |

---

#### 4.3.4 List Invoices (Admin)

**Endpoint:** `GET /api/billing/invoices`  
**Access:** ADMIN

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| patientId | string | No | - | Filter by patient |
| status | string | No | - | UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED |
| startDate | date | No | - | Filter from date (YYYY-MM-DD) |
| endDate | date | No | - | Filter until date (YYYY-MM-DD) |
| page | integer | No | 0 | Page number (0-indexed) |
| size | integer | No | 20 | Page size (max: 100) |
| sort | string | No | invoiceDate,desc | Sort field and direction |

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "content": [
      {
        "id": "inv001",
        "invoiceNumber": "INV-20251205-0001",
        "patient": {
          "id": "p001",
          "fullName": "Nguyen Van A"
        },
        "invoiceDate": "2025-12-05T10:30:00Z",
        "dueDate": "2025-12-12T10:30:00Z",
        "totalAmount": 396000,
        "paidAmount": 0,
        "status": "UNPAID"
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

| Status | Code | Message | UI Action |
|--------|------|---------|-----------|
| 401 | UNAUTHORIZED | Missing or invalid access token | Redirect to login |
| 400 | VALIDATION_ERROR | Invalid query parameters | Show toast error |
| 403 | FORBIDDEN | Requires ADMIN role | Show 403 page |

**Validation Error Details:**
- `page must be >= 0`
- `size must be between 1 and 100`
- `startDate must be valid ISO 8601 date`
- `endDate must be valid ISO 8601 date`
- `startDate cannot be after endDate`
- `status must be one of [UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED]`

---

#### 4.3.5 Get Patient Invoices

**Endpoint:** `GET /api/billing/invoices/by-patient/{patientId}`  
**Access:** ADMIN, PATIENT (own)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| status | string | No | - | Filter by status |
| page | integer | No | 0 | Page number |
| size | integer | No | 20 | Page size (max: 100) |

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "content": [
      {
        "id": "inv001",
        "invoiceNumber": "INV-20251205-0001",
        "invoiceDate": "2025-12-05T10:30:00Z",
        "dueDate": "2025-12-12T10:30:00Z",
        "totalAmount": 396000,
        "paidAmount": 0,
        "status": "UNPAID"
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

| Status | Code | Message | UI Action |
|--------|------|---------|-----------|
| 401 | UNAUTHORIZED | Missing or invalid access token | Redirect to login |
| 403 | FORBIDDEN | Patients can only view own invoices | Show 403 page |
| 404 | PATIENT_NOT_FOUND | Patient doesn't exist | Show 404 page |

---

#### 4.3.6 Create Payment

**Endpoint:** `POST /api/billing/payments`  
**Access:** ADMIN, PATIENT (own invoices)

**Request:**
```json
{
  "invoiceId": "inv001",
  "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 396000,
  "method": "CASH",
  "notes": "Paid in full"
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "id": "pay001",
    "invoice": {
      "id": "inv001",
      "invoiceNumber": "INV-20251205-0001",
      "totalAmount": 396000
    },
    "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 396000,
    "method": "CASH",
    "status": "COMPLETED",
    "paymentDate": "2025-12-05T11:00:00Z",
    "createdAt": "2025-12-05T11:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code | Message | UI Action |
|--------|------|---------|-----------|
| 401 | UNAUTHORIZED | Missing or invalid access token | Redirect to login |
| 400 | VALIDATION_ERROR | Field validation failed | Show field errors |
| 403 | FORBIDDEN | Patients can only pay own invoices | Show toast error |
| 404 | INVOICE_NOT_FOUND | Invoice doesn't exist | Show 404 page |
| 409 | DUPLICATE_PAYMENT | Idempotency key already exists | Return existing payment |
| 409 | INVOICE_ALREADY_PAID | Invoice is fully paid | Show toast info |
| 409 | INVOICE_CANCELLED | Cannot pay cancelled invoice | Show toast error |

**Validation Error Details:**
- `invoiceId is required`
- `idempotencyKey is required`
- `idempotencyKey must be valid UUID format`
- `amount is required`
- `amount must be positive (> 0)`
- `amount cannot exceed invoice remaining balance`
- `method is required`
- `method must be one of [CASH, CREDIT_CARD, BANK_TRANSFER, INSURANCE]`
- `notes exceeds maximum length (1000 characters)`

---

#### 4.3.7 Get Payment by ID

**Endpoint:** `GET /api/billing/payments/{id}`  
**Access:** ADMIN, PATIENT (own)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "id": "pay001",
    "invoice": {
      "id": "inv001",
      "invoiceNumber": "INV-20251205-0001",
      "totalAmount": 396000
    },
    "idempotencyKey": "550e8400-e29b-41d4-a716-446655440000",
    "amount": 396000,
    "method": "CASH",
    "status": "COMPLETED",
    "notes": "Paid in full",
    "paymentDate": "2025-12-05T11:00:00Z",
    "createdAt": "2025-12-05T11:00:00Z"
  }
}
```

**Error Responses:**

| Status | Code | Message | UI Action |
|--------|------|---------|-----------|
| 401 | UNAUTHORIZED | Missing or invalid access token | Redirect to login |
| 403 | FORBIDDEN | Patients can only view own payments | Show 403 page |
| 404 | PAYMENT_NOT_FOUND | Payment doesn't exist | Show 404 page |

---

#### 4.3.8 List Payments by Invoice

**Endpoint:** `GET /api/billing/payments/by-invoice/{invoiceId}`  
**Access:** ADMIN, PATIENT (own)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "payments": [
      {
        "id": "pay001",
        "amount": 200000,
        "method": "CASH",
        "status": "COMPLETED",
        "paymentDate": "2025-12-05T11:00:00Z"
      },
      {
        "id": "pay002",
        "amount": 196000,
        "method": "CREDIT_CARD",
        "status": "COMPLETED",
        "paymentDate": "2025-12-06T09:00:00Z"
      }
    ],
    "totalPaid": 396000,
    "invoiceTotal": 396000,
    "remainingBalance": 0
  }
}
```

**Error Responses:**

| Status | Code | Message | UI Action |
|--------|------|---------|-----------|
| 401 | UNAUTHORIZED | Missing or invalid access token | Redirect to login |
| 403 | FORBIDDEN | Patients can only view own invoice payments | Show 403 page |
| 404 | INVOICE_NOT_FOUND | Invoice doesn't exist | Show 404 page |


---

## 5. Shared Components

### 5.1 Component Registry

| Component | Purpose | Used In |
|-----------|---------|---------|
| `InvoiceStatusBadge` | Display invoice status with color coding | List, Detail |
| `ItemTypeBadge` | Display item type (CONSULTATION, MEDICINE, etc.) | Invoice Detail |
| `PaymentMethodBadge` | Display payment method with icon | Payment History |
| `InvoiceCard` | Card layout for patient invoice list | Patient Portal |
| `InvoiceSummaryCard` | Quick summary of invoice totals | Payment Form |
| `PaymentHistoryTable` | Table of payments for an invoice | Invoice Detail |
| `CurrencyDisplay` | Formatted currency display (VND) | Throughout |
| `IdempotencyKeyProvider` | Generate/manage idempotency keys | Payment Forms |

### 5.2 InvoiceStatusBadge Component

```typescript
// components/billing/InvoiceStatusBadge.tsx

interface Props {
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  UNPAID: {
    label: 'Unpaid',
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: '��',
  },
  PARTIALLY_PAID: {
    label: 'Partial',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '���',
  },
  PAID: {
    label: 'Paid',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: '���',
  },
  OVERDUE: {
    label: 'Overdue',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '⚠️',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '✕',
  },
};

export function InvoiceStatusBadge({ status, size = 'md' }: Props) {
  const config = statusConfig[status];
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span className={\`inline-flex items-center gap-1 rounded-full border font-medium \${config.className} \${sizeClasses[size]}\`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
```

### 5.3 ItemTypeBadge Component

```typescript
// components/billing/ItemTypeBadge.tsx

interface Props {
  type: 'CONSULTATION' | 'MEDICINE' | 'TEST' | 'OTHER';
}

const typeConfig = {
  CONSULTATION: {
    label: 'Consultation',
    className: 'bg-purple-100 text-purple-800',
    icon: '���',
  },
  MEDICINE: {
    label: 'Medicine',
    className: 'bg-blue-100 text-blue-800',
    icon: '���',
  },
  TEST: {
    label: 'Test',
    className: 'bg-cyan-100 text-cyan-800',
    icon: '���',
  },
  OTHER: {
    label: 'Other',
    className: 'bg-gray-100 text-gray-800',
    icon: '���',
  },
};

export function ItemTypeBadge({ type }: Props) {
  const config = typeConfig[type];
  return (
    <span className={\`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium \${config.className}\`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
```

### 5.4 PaymentMethodBadge Component

```typescript
// components/billing/PaymentMethodBadge.tsx

interface Props {
  method: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'INSURANCE';
}

const methodConfig = {
  CASH: {
    label: 'Cash',
    className: 'bg-green-100 text-green-800',
    icon: '���',
  },
  CREDIT_CARD: {
    label: 'Card',
    className: 'bg-blue-100 text-blue-800',
    icon: '���',
  },
  BANK_TRANSFER: {
    label: 'Bank',
    className: 'bg-purple-100 text-purple-800',
    icon: '���',
  },
  INSURANCE: {
    label: 'Insurance',
    className: 'bg-cyan-100 text-cyan-800',
    icon: '���',
  },
};

export function PaymentMethodBadge({ method }: Props) {
  const config = methodConfig[method];
  return (
    <span className={\`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium \${config.className}\`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
```

### 5.5 CurrencyDisplay Component

```typescript
// components/billing/CurrencyDisplay.tsx

interface Props {
  amount: number;
  currency?: string;
  locale?: string;
  className?: string;
  showSymbol?: boolean;
}

export function CurrencyDisplay({
  amount,
  currency = 'VND',
  locale = 'vi-VN',
  className = '',
  showSymbol = true,
}: Props) {
  const formatted = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return <span className={className}>{formatted}</span>;
}

// Utility function for formatting
export function formatCurrency(amount: number, locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
```

### 5.6 InvoiceSummaryCard Component

```typescript
// components/billing/InvoiceSummaryCard.tsx

interface Props {
  invoice: {
    invoiceNumber: string;
    patient: { fullName: string };
    totalAmount: number;
    paidAmount: number;
  };
}

export function InvoiceSummaryCard({ invoice }: Props) {
  const balanceDue = invoice.totalAmount - invoice.paidAmount;

  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Invoice:</span>
          <span className="font-medium">#{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Patient:</span>
          <span className="font-medium">{invoice.patient.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total:</span>
          <CurrencyDisplay amount={invoice.totalAmount} className="font-medium" />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Paid:</span>
          <CurrencyDisplay amount={invoice.paidAmount} className="font-medium text-green-600" />
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-gray-800 font-semibold">Balance Due:</span>
          <CurrencyDisplay amount={balanceDue} className="font-bold text-lg text-red-600" />
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5.7 PaymentHistoryTable Component

```typescript
// components/billing/PaymentHistoryTable.tsx

interface PaymentItem {
  id: string;
  amount: number;
  method: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'INSURANCE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentDate: string;
  notes?: string;
}

interface Props {
  payments: PaymentItem[];
  totalPaid: number;
  remainingBalance: number;
}

export function PaymentHistoryTable({ payments, totalPaid, remainingBalance }: Props) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <span className="text-4xl mb-2 block">���</span>
        No payments recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{formatDate(payment.paymentDate)}</TableCell>
              <TableCell>
                <CurrencyDisplay amount={payment.amount} className="font-medium" />
              </TableCell>
              <TableCell>
                <PaymentMethodBadge method={payment.method} />
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={payment.status} />
              </TableCell>
              <TableCell className="text-gray-500 text-sm">
                {payment.notes || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-end gap-8 pt-4 border-t">
        <div>
          <span className="text-gray-600">Total Paid:</span>
          <CurrencyDisplay amount={totalPaid} className="ml-2 font-semibold text-green-600" />
        </div>
        <div>
          <span className="text-gray-600">Remaining:</span>
          <CurrencyDisplay 
            amount={remainingBalance} 
            className={\`ml-2 font-semibold \${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}\`} 
          />
        </div>
      </div>
    </div>
  );
}
```

### 5.8 IdempotencyKeyProvider Hook

```typescript
// hooks/useIdempotencyKey.ts

import { useState, useCallback } from 'react';

/**
 * Hook to manage idempotency keys for payment safety.
 */
export function useIdempotencyKey() {
  const [key, setKey] = useState<string>(() => crypto.randomUUID());

  const generateKey = useCallback(() => {
    const newKey = crypto.randomUUID();
    setKey(newKey);
    return newKey;
  }, []);

  const resetKey = useCallback(() => {
    return generateKey();
  }, [generateKey]);

  return {
    idempotencyKey: key,
    generateKey,
    resetKey,
  };
}
```

### 5.9 InvoiceCard Component (Patient View)

```typescript
// components/billing/InvoiceCard.tsx

interface Props {
  invoice: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string | null;
    totalAmount: number;
    paidAmount: number;
    status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    itemsSummary?: string;
  };
  onView: () => void;
  onPay?: () => void;
}

export function InvoiceCard({ invoice, onView, onPay }: Props) {
  const balanceDue = invoice.totalAmount - invoice.paidAmount;
  const isPayable = ['UNPAID', 'PARTIALLY_PAID', 'OVERDUE'].includes(invoice.status);
  const isOverdue = invoice.status === 'OVERDUE';

  return (
    <Card className={cn('p-4', { 
      'border-red-200 bg-red-50/30': isOverdue,
      'border-yellow-200 bg-yellow-50/30': invoice.status === 'UNPAID',
    })}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">���</span>
            <span className="font-medium">Invoice #{invoice.invoiceNumber}</span>
          </div>
          <p className="text-sm text-gray-600">
            {formatDate(invoice.invoiceDate)}
            {invoice.dueDate && \` • Due: \${formatDate(invoice.dueDate)}\`}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <InvoiceStatusBadge status={invoice.status} />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onView}>View</Button>
            {isPayable && onPay && <Button size="sm" onClick={onPay}>Pay Now</Button>}
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

| HTTP Status | Error Code | Description | UI Handling |
|-------------|------------|-------------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid access token | Redirect to /login, clear auth state |
| 403 | FORBIDDEN | User role not authorized | Show toast "You don't have permission" |
| 403 | FORBIDDEN | Patients can only view own invoices | Show 403 page |
| 403 | FORBIDDEN | Patients can only pay own invoices | Show toast error |

#### 6.2.2 Validation Errors (400 VALIDATION_ERROR)

**Create Payment Validation:**

| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| invoiceId | Required | "invoiceId is required" |
| idempotencyKey | Required | "idempotencyKey is required" |
| idempotencyKey | Valid UUID | "idempotencyKey must be valid UUID format" |
| amount | Required | "amount is required" |
| amount | Positive | "amount must be positive (> 0)" |
| amount | <= balance | "amount cannot exceed invoice remaining balance" |
| method | Required | "method is required" |
| method | Enum check | "method must be one of [CASH, CREDIT_CARD, BANK_TRANSFER, INSURANCE]" |
| notes | Max length | "notes exceeds maximum length (1000 characters)" |

**List Query Parameters Validation:**

| Parameter | Validation Rule | Error Message |
|-----------|-----------------|---------------|
| page | Non-negative | "page must be >= 0" |
| size | Range 1-100 | "size must be between 1 and 100" |
| startDate | Valid date | "startDate must be valid ISO 8601 date" |
| endDate | Valid date | "endDate must be valid ISO 8601 date" |
| startDate/endDate | Date range | "startDate cannot be after endDate" |
| status | Enum check | "status must be one of [UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED]" |

#### 6.2.3 Business Logic Errors

| HTTP Status | Error Code | Description | When Triggered | UI Handling |
|-------------|------------|-------------|----------------|-------------|
| 400 | PRESCRIPTION_NOT_FOUND | No prescription for appointment | Generate invoice without prescription | Show toast error |
| 409 | INVOICE_EXISTS | Invoice already exists | Generate duplicate invoice | Show toast info, navigate to existing |
| 409 | DUPLICATE_PAYMENT | Idempotency key already used | Retry with same key | Return existing payment (success) |
| 409 | INVOICE_ALREADY_PAID | Invoice fully paid | Pay already paid invoice | Show toast info "Already paid" |
| 409 | INVOICE_CANCELLED | Invoice is cancelled | Pay cancelled invoice | Show toast error |

#### 6.2.4 Resource Not Found Errors (404)

| Error Code | Description | When Triggered | UI Handling |
|------------|-------------|----------------|-------------|
| INVOICE_NOT_FOUND | Invoice doesn't exist | Get/Pay with invalid ID | Show 404 page |
| APPOINTMENT_NOT_FOUND | Appointment doesn't exist | Generate invoice with invalid appointment | Show toast error |
| PATIENT_NOT_FOUND | Patient doesn't exist | Get patient invoices with invalid ID | Show 404 page |
| PAYMENT_NOT_FOUND | Payment doesn't exist | Get payment with invalid ID | Show 404 page |

### 6.3 Client-Side Validation (Zod Schema)

```typescript
import { z } from 'zod';

// Create Payment Schema
export const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  idempotencyKey: z.string().uuid('Invalid idempotency key format'),
  amount: z.number().positive('Amount must be greater than 0'),
  method: z.enum(['CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'INSURANCE'], {
    required_error: 'Please select a payment method',
  }),
  notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

// Custom validation for amount <= balance
export const createPaymentSchemaWithBalance = (balanceDue: number) =>
  createPaymentSchema.extend({
    amount: z.number()
      .positive('Amount must be greater than 0')
      .max(balanceDue, 'Amount cannot exceed remaining balance'),
  });

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
```

### 6.4 Error Display Utilities

```typescript
// utils/billingErrors.ts

export function handleBillingError(error: any, defaultMessage = 'An error occurred') {
  const errorCode = error.response?.data?.error?.code;
  const errorMessage = error.response?.data?.error?.message;
  
  const errorMessages: Record<string, string> = {
    UNAUTHORIZED: 'Please log in to continue',
    FORBIDDEN: 'You do not have permission to perform this action',
    VALIDATION_ERROR: errorMessage || 'Please check your input',
    INVOICE_NOT_FOUND: 'Invoice not found',
    APPOINTMENT_NOT_FOUND: 'Appointment not found',
    PRESCRIPTION_NOT_FOUND: 'No prescription found for this appointment',
    PATIENT_NOT_FOUND: 'Patient not found',
    PAYMENT_NOT_FOUND: 'Payment not found',
    INVOICE_EXISTS: 'Invoice already exists for this appointment',
    DUPLICATE_PAYMENT: 'Payment already processed',
    INVOICE_ALREADY_PAID: 'Invoice is already fully paid',
    INVOICE_CANCELLED: 'Cannot process payment for cancelled invoice',
  };
  
  const message = errorMessages[errorCode] || errorMessage || defaultMessage;
  
  if (['DUPLICATE_PAYMENT', 'INVOICE_ALREADY_PAID'].includes(errorCode)) {
    toast.info(message);
  } else {
    toast.error(message);
  }
  
  return message;
}
```

### 6.5 Loading & Empty States

**Loading States:**

| State | UI Behavior |
|-------|-------------|
| Initial Load | Show skeleton loader for table/cards |
| Form Submit | Disable submit button, show spinner, text "Processing..." |
| Payment Processing | Full-screen overlay with "Processing payment..." |
| Refetching | Show subtle loading indicator (not full skeleton) |

**Empty States:**

| Scenario | Message | Action |
|----------|---------|--------|
| No invoices (admin) | "No invoices found" | "Adjust filters" |
| No invoices (patient) | "You don't have any invoices yet" | - |
| No unpaid invoices (patient) | "All caught up! No outstanding bills" | - |
| No payments on invoice | "No payments recorded yet" | "Record Payment" button |

---

## Appendix A: TypeScript Interfaces

```typescript
// interfaces/billing.ts

// ============ Enums ============

export type InvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type ItemType = 'CONSULTATION' | 'MEDICINE' | 'TEST' | 'OTHER';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'INSURANCE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// ============ Nested Types ============

export interface PatientSummary {
  id: string;
  fullName: string;
}

export interface AppointmentSummary {
  id: string;
  appointmentTime: string;
}

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
}

// ============ Invoice Types ============

export interface InvoiceItem {
  id: string;
  type: ItemType;
  description: string;
  referenceId: string | null;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patient: PatientSummary;
  appointment: AppointmentSummary | null;
  invoiceDate: string;
  dueDate: string | null;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  patient: PatientSummary;
  invoiceDate: string;
  dueDate: string | null;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
}

// ============ Payment Types ============

export interface Payment {
  id: string;
  invoice: InvoiceSummary;
  idempotencyKey: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  notes?: string;
  paymentDate: string;
  createdAt: string;
}

export interface PaymentListItem {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paymentDate: string;
}

export interface PaymentsByInvoice {
  payments: PaymentListItem[];
  totalPaid: number;
  invoiceTotal: number;
  remainingBalance: number;
}

// ============ Request Types ============

export interface GenerateInvoiceRequest {
  appointmentId: string;
}

export interface CreatePaymentRequest {
  invoiceId: string;
  idempotencyKey: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

// ============ Query Params ============

export interface InvoiceListParams {
  patientId?: string;
  status?: InvoiceStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PatientInvoiceParams {
  status?: InvoiceStatus;
  page?: number;
  size?: number;
}

// ============ Pagination ============

export interface PaginatedResponse<T> {
  content: T[];
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

- [ ] /admin/billing - InvoiceListPage
- [ ] /admin/billing/{id} - InvoiceDetailPage
- [ ] /admin/billing/{id}/payment - PaymentFormPage
- [ ] /admin/billing/payments - PaymentListPage
- [ ] /patient/billing - PatientInvoiceListPage
- [ ] /patient/billing/{id} - InvoiceDetailPage (patient context)
- [ ] /patient/billing/{id}/pay - PatientPaymentPage

### B.2 Components to Build

- [ ] InvoiceStatusBadge
- [ ] ItemTypeBadge
- [ ] PaymentMethodBadge
- [ ] PaymentStatusBadge
- [ ] InvoiceCard
- [ ] InvoiceSummaryCard
- [ ] PaymentHistoryTable
- [ ] CurrencyDisplay
- [ ] InvoiceItemsTable

### B.3 Services & Hooks

- [ ] billing.service.ts
- [ ] useBilling.ts (React Query hooks)
- [ ] useIdempotencyKey.ts

### B.4 API Integration Checklist

**Invoice APIs:**
- [ ] POST /api/billing/invoices/generate (internal)
- [ ] GET /api/billing/invoices/{id}
- [ ] GET /api/billing/invoices/by-appointment/{appointmentId}
- [ ] GET /api/billing/invoices (admin list)
- [ ] GET /api/billing/invoices/by-patient/{patientId}

**Payment APIs:**
- [ ] POST /api/billing/payments
- [ ] GET /api/billing/payments/{id}
- [ ] GET /api/billing/payments/by-invoice/{invoiceId}

### B.5 Cross-Service Integration

- [ ] GET /api/appointments/{id} (appointment reference)
- [ ] GET /api/patients/{id} (patient info)
- [ ] GET /api/exams/{examId}/prescription (prescription reference)

### B.6 Testing Scenarios

**Happy Path:**
- [ ] View invoice list with filters
- [ ] View invoice detail with line items
- [ ] Record full payment (UNPAID -> PAID)
- [ ] Record partial payment (UNPAID -> PARTIALLY_PAID)
- [ ] Record second payment (PARTIALLY_PAID -> PAID)
- [ ] Patient views own invoices
- [ ] Patient views invoice detail
- [ ] Print/download invoice

**Error Scenarios:**
- [ ] Validation errors displayed correctly
- [ ] DUPLICATE_PAYMENT handled (idempotency)
- [ ] INVOICE_ALREADY_PAID handled gracefully
- [ ] INVOICE_CANCELLED error handling
- [ ] Amount exceeds balance validation
- [ ] Permission denied (FORBIDDEN) handling
- [ ] Not found (404) handling

**Edge Cases:**
- [ ] Patient can only see/pay own invoices
- [ ] Idempotency key prevents duplicate payments
- [ ] Balance calculation accuracy
- [ ] Status auto-update after payment
- [ ] OVERDUE status display with warning
- [ ] Currency formatting consistency

---

*End of Billing Service FE Specification*
Beta
0 / 0
used queries
1