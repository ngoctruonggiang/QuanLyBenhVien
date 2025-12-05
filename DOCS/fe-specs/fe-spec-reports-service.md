# Reports Service - Frontend Specification

**Project:** Hospital Management System  
**Service:** Reports Service (Analytics & Statistics)  
**Version:** 1.0  
**Last Updated:** December 4, 2025  
**Target Users:** ADMIN (primary), DOCTOR (limited - own appointment stats)

---

## 1. Overview & Screen Inventory

### 1.1 Service Scope

The Reports Service provides analytical dashboards and statistical reports for hospital operations. It aggregates data from multiple services to provide:

- Revenue reports (from Billing Service)
- Appointment statistics (from Appointment Service)
- Doctor performance metrics (from HR + Appointment + Medical Exam Services)
- Patient activity reports (from Patient + Medical Exam Services)
- Report caching for performance optimization (12-hour TTL)

### 1.2 Related Backend

| Item          | Value           |
| ------------- | --------------- |
| **Service**   | reports-service |
| **Port**      | 8088            |
| **Base Path** | `/api/reports`  |
| **Database**  | `reports_db`    |
| **Tables**    | `report_cache`  |
| **Cache TTL** | 12 hours        |

### 1.3 Data Sources (Cross-Service)

| Report Type            | Data Sources                                                      |
| ---------------------- | ----------------------------------------------------------------- |
| Revenue Report         | billing-service (invoices, payments)                              |
| Appointment Statistics | appointment-service (appointments)                                |
| Doctor Performance     | hr-service (employees), appointment-service, medical-exam-service |
| Patient Activity       | patient-service (patients), medical-exam-service (records)        |

### 1.4 Screen Inventory

| Route                                | Screen Name            | Component               | Access          | Priority |
| ------------------------------------ | ---------------------- | ----------------------- | --------------- | -------- |
| `/admin/reports`                     | Reports Dashboard      | `ReportsDashboardPage`  | ADMIN           | P0       |
| `/admin/reports/revenue`             | Revenue Report         | `RevenueReportPage`     | ADMIN           | P0       |
| `/admin/reports/appointments`        | Appointment Statistics | `AppointmentStatsPage`  | ADMIN, DOCTOR\* | P0       |
| `/admin/reports/doctors/performance` | Doctor Performance     | `DoctorPerformancePage` | ADMIN           | P1       |
| `/admin/reports/patients/activity`   | Patient Activity       | `PatientActivityPage`   | ADMIN           | P1       |

\*DOCTOR can only view their own appointment statistics

### 1.5 Screen Hierarchy Diagram

```
/admin/reports
├── (dashboard - summary cards & quick charts)
├── /revenue
│   └── (detailed revenue report with filters)
├── /appointments
│   └── (appointment statistics with trends)
├── /doctors/performance
│   └── (doctor performance metrics table)
└── /patients/activity
    └── (patient activity analysis)

/doctor/reports (limited access)
└── /appointments (own stats only via dashboard)
```

---

## 2. User Flows & Acceptance Criteria

### 2.1 Flow: View Reports Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN navigates to /admin/reports                           │
│                          ↓                                  │
│ System loads summary data from all report endpoints         │
│ (parallel API calls with loading states)                    │
│                          ↓                                  │
│ Dashboard displays:                                         │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Summary Cards Row                                       ││
│ │ [Total Revenue] [Appointments] [Active Doctors] [Patients]│
│ ├─────────────────────────────────────────────────────────┤│
│ │ Quick Charts Row                                        ││
│ │ [Revenue Trend]        [Appointments by Status]         ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Navigation Cards                                        ││
│ │ [View Full Revenue] [View Full Appointments] [...]      ││
│ └─────────────────────────────────────────────────────────┘│
│                          ↓                                  │
│ ADMIN clicks card → Navigate to detailed report page        │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Page loads within 3 seconds (cached data)
- [ ] Summary cards show key metrics for current month
- [ ] Quick charts show trends for last 7 days
- [ ] Each card links to detailed report page
- [ ] Loading skeleton shown while fetching
- [ ] Error state shown if any report fails (partial load OK)
- [ ] Refresh button to clear cache and reload

---

### 2.2 Flow: Generate Revenue Report

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN navigates to /admin/reports/revenue                   │
│                          ↓                                  │
│ System shows filter form:                                   │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Date Range: [Start Date] - [End Date]                   ││
│ │ Department: [All Departments ▼]                         ││
│ │ Payment Method: [All Methods ▼]                         ││
│ │                              [Generate Report]          ││
│ └─────────────────────────────────────────────────────────┘│
│                          ↓                                  │
│ ADMIN sets filters and clicks "Generate Report"             │
│                          ↓                                  │
│ GET /api/reports/revenue?startDate=...&endDate=...          │
│         ↓                              ↓                    │
│   [Success]                      [Error]                    │
│      ↓                              ↓                       │
│ Display report:              Show error toast               │
│ - Summary metrics                                           │
│ - Revenue by department chart                               │
│ - Revenue by payment method chart                           │
│ - Export options (CSV, PDF)                                 │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Default date range: Current month (1st to today)
- [ ] Date range max: 1 year
- [ ] Start date cannot be after end date
- [ ] Department dropdown populated from HR service
- [ ] Loading state while generating report
- [ ] Report displays: Total Revenue, Paid Revenue, Unpaid Revenue, Invoice Count
- [ ] Bar chart: Revenue by Department
- [ ] Pie chart: Revenue by Payment Method
- [ ] Export to CSV button
- [ ] Export to PDF button (stretch goal)

---

### 2.3 Flow: View Appointment Statistics

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN navigates to /admin/reports/appointments              │
│                          ↓                                  │
│ System shows filter form:                                   │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Date Range: [Start Date] - [End Date]                   ││
│ │ Department: [All Departments ▼]                         ││
│ │ Doctor: [All Doctors ▼] (filtered by dept)              ││
│ │                              [Generate Report]          ││
│ └─────────────────────────────────────────────────────────┘│
│                          ↓                                  │
│ GET /api/reports/appointments?startDate=...&endDate=...     │
│                          ↓                                  │
│ Display statistics:                                         │
│ - Total appointments count                                  │
│ - Breakdown by status (pie chart)                           │
│ - Breakdown by type (bar chart)                             │
│ - Daily trend (line chart)                                  │
│ - Department comparison (horizontal bar)                    │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Default date range: Last 30 days
- [ ] Doctor dropdown filters by selected department
- [ ] Statistics show: Total, Completed, Cancelled, No-show rates
- [ ] Pie chart: Appointments by Status
- [ ] Bar chart: Appointments by Type (CONSULTATION, FOLLOW_UP, etc.)
- [ ] Line chart: Daily appointment trend
- [ ] Horizontal bar: Appointments by Department
- [ ] DOCTOR role: Can only see their own statistics (doctorId auto-set)

---

### 2.4 Flow: View Doctor Performance

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN navigates to /admin/reports/doctors/performance       │
│                          ↓                                  │
│ System shows filter form:                                   │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Date Range: [Start Date] - [End Date]                   ││
│ │ Department: [All Departments ▼]                         ││
│ │ Sort By: [Completion Rate ▼]                            ││
│ │                              [Generate Report]          ││
│ └─────────────────────────────────────────────────────────┘│
│                          ↓                                  │
│ GET /api/reports/doctors/performance?startDate=...          │
│                          ↓                                  │
│ Display performance table:                                  │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Doctor │ Dept │ Patients │ Completion │ Revenue │ Rx    ││
│ │ Dr. A  │ Card │ 150      │ 95%        │ $45,000 │ 120   ││
│ │ Dr. B  │ Neur │ 120      │ 92%        │ $38,000 │ 98    ││
│ └─────────────────────────────────────────────────────────┘│
│                          ↓                                  │
│ Click row → Show detailed doctor stats modal                │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Default date range: Current month
- [ ] Table columns: Doctor Name, Department, Patients Seen, Completion Rate, Total Revenue, Prescriptions Written
- [ ] Sortable by all numeric columns
- [ ] Click row opens detail modal with trends
- [ ] Export to CSV
- [ ] Color coding: Completion rate <80% (red), 80-90% (yellow), >90% (green)

---

### 2.5 Flow: View Patient Activity

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN navigates to /admin/reports/patients/activity         │
│                          ↓                                  │
│ System shows filter form:                                   │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Date Range: [Start Date] - [End Date]                   ││
│ │ Patient Status: [All ▼]                                 ││
│ │                              [Generate Report]          ││
│ └─────────────────────────────────────────────────────────┘│
│                          ↓                                  │
│ GET /api/reports/patients/activity?startDate=...            │
│                          ↓                                  │
│ Display activity report:                                    │
│ - Summary: Total, New, Active patients                      │
│ - Demographics: Gender distribution, Blood type             │
│ - Top diagnoses list                                        │
│ - Registration trend (line chart)                           │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Default date range: Current month
- [ ] Summary cards: Total Patients, New Patients, Active Patients
- [ ] Pie chart: Patients by Gender
- [ ] Pie chart: Patients by Blood Type
- [ ] Bar chart: Top 10 Diagnoses
- [ ] Line chart: Patient registration trend
- [ ] Export to CSV

---

### 2.6 Flow: Clear Report Cache (Admin Only)

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN clicks "Refresh Data" or "Clear Cache" button         │
│                          ↓                                  │
│ Show confirmation dialog:                                   │
│ "Clear all cached report data? Reports will be regenerated  │
│  from source data on next request."                         │
│         ↓                              ↓                    │
│   [Confirm]                        [Cancel]                 │
│      ↓                                ↓                     │
│ DELETE /api/reports/cache         Close dialog              │
│      ↓                                                      │
│ Success → Toast "Cache cleared"                             │
│        → Refresh current report                             │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**

- [ ] Confirmation required before clearing cache
- [ ] Success: Toast "Report cache cleared successfully"
- [ ] Auto-refresh current report after clearing
- [ ] Only visible to ADMIN role

---

## 3. Screen Specifications

### 3.1 Reports Dashboard Page

**Route:** `/admin/reports`  
**Component:** `ReportsDashboardPage`

#### 3.1.1 Component Hierarchy

```
ReportsDashboardPage
├── PageHeader
│   ├── Title ("Reports & Analytics")
│   ├── DateRangeDisplay ("Data as of: Dec 4, 2025 10:30 AM")
│   └── RefreshButton (clears cache)
├── SummaryCardsRow
│   ├── MetricCard (Total Revenue - links to /revenue)
│   │   ├── Icon (DollarSign)
│   │   ├── Value ("$125,000")
│   │   ├── Label ("Total Revenue")
│   │   └── Trend ("+12% vs last month")
│   ├── MetricCard (Appointments - links to /appointments)
│   │   ├── Icon (Calendar)
│   │   ├── Value ("1,234")
│   │   ├── Label ("Total Appointments")
│   │   └── Trend ("+5% vs last month")
│   ├── MetricCard (Active Doctors - links to /doctors/performance)
│   │   ├── Icon (UserMd)
│   │   ├── Value ("45")
│   │   ├── Label ("Active Doctors")
│   │   └── SubLabel ("Avg 92% completion")
│   └── MetricCard (Patients - links to /patients/activity)
│       ├── Icon (Users)
│       ├── Value ("2,500")
│       ├── Label ("Total Patients")
│       └── Trend ("+8% new this month")
├── ChartsRow
│   ├── ChartCard (Revenue Trend - 7 days)
│   │   └── LineChart
│   └── ChartCard (Appointments by Status)
│       └── PieChart
├── QuickLinksRow
│   ├── LinkCard ("View Full Revenue Report")
│   ├── LinkCard ("View Appointment Statistics")
│   ├── LinkCard ("View Doctor Performance")
│   └── LinkCard ("View Patient Activity")
└── LoadingOverlay (when refreshing)
```

#### 3.1.2 Dashboard State

```typescript
interface DashboardState {
  // Data state
  revenueData: RevenueReportData | null;
  appointmentData: AppointmentStatsData | null;
  doctorData: DoctorPerformanceData | null;
  patientData: PatientActivityData | null;

  // Loading states (parallel fetching)
  loadingStates: {
    revenue: boolean;
    appointments: boolean;
    doctors: boolean;
    patients: boolean;
  };

  // Error states
  errorStates: {
    revenue: string | null;
    appointments: string | null;
    doctors: string | null;
    patients: string | null;
  };

  // Cache info
  lastUpdated: string | null;
  isRefreshing: boolean;
}
```

#### 3.1.3 Role-Based Visibility

| Element                 | ADMIN | DOCTOR        | NURSE | RECEPTIONIST |
| ----------------------- | ----- | ------------- | ----- | ------------ |
| Page Access             | ✅    | ✅ (limited)  | ❌    | ❌           |
| Revenue Card            | ✅    | ❌            | ❌    | ❌           |
| Appointments Card       | ✅    | ✅ (own only) | ❌    | ❌           |
| Doctor Performance Card | ✅    | ❌            | ❌    | ❌           |
| Patient Activity Card   | ✅    | ❌            | ❌    | ❌           |
| Clear Cache Button      | ✅    | ❌            | ❌    | ❌           |

---

### 3.2 Revenue Report Page

**Route:** `/admin/reports/revenue`  
**Component:** `RevenueReportPage`

#### 3.2.1 Filter Fields

| Field           | Label          | Type   | Required | Default              | Validation                           |
| --------------- | -------------- | ------ | -------- | -------------------- | ------------------------------------ |
| `startDate`     | Start Date     | date   | ✅       | 1st of current month | Not after endDate                    |
| `endDate`       | End Date       | date   | ✅       | Today                | Not before startDate, not future     |
| `departmentId`  | Department     | select | ❌       | All                  | Valid department ID                  |
| `paymentMethod` | Payment Method | select | ❌       | All                  | CASH, CARD, INSURANCE, BANK_TRANSFER |

#### 3.2.2 Component Hierarchy

```
RevenueReportPage
├── PageHeader
│   ├── BackButton → /admin/reports
│   ├── Title ("Revenue Report")
│   └── ExportDropdown
│       ├── ExportCSV
│       └── ExportPDF
├── FilterForm
│   ├── DateRangePicker (startDate, endDate)
│   ├── DepartmentSelect
│   ├── PaymentMethodSelect
│   └── GenerateButton
├── ReportContent (shown after generation)
│   ├── SummaryCards
│   │   ├── Card (Total Revenue)
│   │   ├── Card (Paid Revenue)
│   │   ├── Card (Unpaid Revenue)
│   │   └── Card (Invoice Count)
│   ├── ChartsSection
│   │   ├── BarChart (Revenue by Department)
│   │   └── PieChart (Revenue by Payment Method)
│   └── DataTable (optional - detailed breakdown)
└── EmptyState (when no data)
```

#### 3.2.3 Report Data Display

```typescript
interface RevenueReportDisplay {
  // Summary metrics
  summary: {
    totalRevenue: number; // Format: $XXX,XXX.XX
    paidRevenue: number;
    unpaidRevenue: number;
    invoiceCount: number;
    collectionRate: number; // Calculated: paid/total * 100
  };

  // Chart data
  revenueByDepartment: Array<{
    departmentId: string;
    departmentName: string;
    revenue: number;
    percentage: number; // Calculated
  }>;

  revenueByPaymentMethod: Array<{
    method: string;
    amount: number;
    count: number;
    percentage: number; // Calculated
  }>;
}
```

---

### 3.3 Appointment Statistics Page

**Route:** `/admin/reports/appointments`  
**Component:** `AppointmentStatsPage`

#### 3.3.1 Filter Fields

| Field          | Label      | Type   | Required | Default                  | Validation           |
| -------------- | ---------- | ------ | -------- | ------------------------ | -------------------- |
| `startDate`    | Start Date | date   | ✅       | 30 days ago              | Not after endDate    |
| `endDate`      | End Date   | date   | ✅       | Today                    | Not before startDate |
| `departmentId` | Department | select | ❌       | All                      | Valid department ID  |
| `doctorId`     | Doctor     | select | ❌       | All (or self for DOCTOR) | Valid employee ID    |

#### 3.3.2 Component Hierarchy

```
AppointmentStatsPage
├── PageHeader
│   ├── BackButton
│   ├── Title ("Appointment Statistics")
│   └── ExportButton
├── FilterForm
│   ├── DateRangePicker
│   ├── DepartmentSelect
│   ├── DoctorSelect (filtered by department, disabled for DOCTOR role)
│   └── GenerateButton
├── ReportContent
│   ├── SummaryCards
│   │   ├── Card (Total Appointments)
│   │   ├── Card (Completed)
│   │   ├── Card (Cancelled)
│   │   └── Card (No-Show Rate)
│   ├── ChartsSection
│   │   ├── PieChart (By Status)
│   │   ├── BarChart (By Type)
│   │   ├── LineChart (Daily Trend)
│   │   └── HorizontalBarChart (By Department)
│   └── TrendAnalysis
│       └── ComparisonText ("12% increase vs previous period")
└── EmptyState
```

#### 3.3.3 Report Data Display

```typescript
interface AppointmentStatsDisplay {
  // Summary
  summary: {
    totalAppointments: number;
    completedCount: number;
    cancelledCount: number;
    noShowCount: number;
    completionRate: number; // Calculated
    noShowRate: number; // Calculated
  };

  // By status (for pie chart)
  appointmentsByStatus: Array<{
    status: string; // SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW
    count: number;
    percentage: number;
  }>;

  // By type (for bar chart)
  appointmentsByType: Array<{
    type: string; // CONSULTATION, FOLLOW_UP, EMERGENCY, CHECK_UP
    count: number;
  }>;

  // By department (for horizontal bar)
  appointmentsByDepartment: Array<{
    departmentId: string;
    departmentName: string;
    count: number;
  }>;

  // Daily trend (for line chart)
  dailyTrend: Array<{
    date: string; // "2025-12-01"
    count: number;
  }>;
}
```

---

### 3.4 Doctor Performance Page

**Route:** `/admin/reports/doctors/performance`  
**Component:** `DoctorPerformancePage`

#### 3.4.1 Filter Fields

| Field          | Label      | Type   | Required | Default              | Validation                                 |
| -------------- | ---------- | ------ | -------- | -------------------- | ------------------------------------------ |
| `startDate`    | Start Date | date   | ✅       | 1st of current month | Not after endDate                          |
| `endDate`      | End Date   | date   | ✅       | Today                | Not before startDate                       |
| `departmentId` | Department | select | ❌       | All                  | Valid department ID                        |
| `sortBy`       | Sort By    | select | ❌       | completionRate       | completionRate, patientsSeen, totalRevenue |

#### 3.4.2 Component Hierarchy

```
DoctorPerformancePage
├── PageHeader
│   ├── BackButton
│   ├── Title ("Doctor Performance")
│   └── ExportButton
├── FilterForm
│   ├── DateRangePicker
│   ├── DepartmentSelect
│   ├── SortBySelect
│   └── GenerateButton
├── ReportContent
│   ├── SummaryCards
│   │   ├── Card (Total Doctors)
│   │   ├── Card (Avg Completion Rate)
│   │   ├── Card (Total Patients Seen)
│   │   └── Card (Total Revenue Generated)
│   ├── PerformanceTable
│   │   └── DataTable
│   │       ├── Column: Doctor Name (with avatar)
│   │       ├── Column: Department
│   │       ├── Column: Patients Seen
│   │       ├── Column: Completion Rate (with color coding)
│   │       ├── Column: Total Revenue
│   │       ├── Column: Prescriptions Written
│   │       └── Column: Actions (View Details)
│   └── TopPerformersChart (optional - top 5 bar chart)
├── DoctorDetailModal
│   ├── DoctorInfo
│   ├── PerformanceTrend (line chart)
│   └── DetailedMetrics
└── EmptyState
```

#### 3.4.3 Performance Table Columns

| Column          | Field                  | Type            | Sortable | Color Coding                        |
| --------------- | ---------------------- | --------------- | -------- | ----------------------------------- |
| Doctor          | `doctorName`           | string + avatar | ✅       | -                                   |
| Department      | `departmentName`       | string          | ✅       | -                                   |
| Patients Seen   | `patientsSeen`         | number          | ✅       | -                                   |
| Completion Rate | `completionRate`       | percentage      | ✅       | <80% red, 80-90% yellow, >90% green |
| Total Revenue   | `totalRevenue`         | currency        | ✅       | -                                   |
| Prescriptions   | `prescriptionsWritten` | number          | ✅       | -                                   |
| Actions         | -                      | button          | ❌       | -                                   |

#### 3.4.4 Report Data Display

```typescript
interface DoctorPerformanceDisplay {
  // Summary
  summary: {
    totalDoctors: number;
    avgCompletionRate: number;
    totalPatientsSeen: number;
    totalRevenue: number;
  };

  // Doctor list
  doctors: Array<{
    doctorId: string;
    doctorName: string;
    departmentId: string;
    departmentName: string;
    specialization: string;
    statistics: {
      appointmentsCompleted: number;
      appointmentsTotal: number;
      completionRate: number;
      totalRevenue: number;
      patientsSeen: number;
      prescriptionsWritten: number;
      avgConsultationTime: number; // in minutes
    };
  }>;
}
```

---

### 3.5 Patient Activity Page

**Route:** `/admin/reports/patients/activity`  
**Component:** `PatientActivityPage`

#### 3.5.1 Filter Fields

| Field       | Label          | Type   | Required | Default              | Validation           |
| ----------- | -------------- | ------ | -------- | -------------------- | -------------------- |
| `startDate` | Start Date     | date   | ✅       | 1st of current month | Not after endDate    |
| `endDate`   | End Date       | date   | ✅       | Today                | Not before startDate |
| `status`    | Patient Status | select | ❌       | All                  | ACTIVE, INACTIVE     |

#### 3.5.2 Component Hierarchy

```
PatientActivityPage
├── PageHeader
│   ├── BackButton
│   ├── Title ("Patient Activity")
│   └── ExportButton
├── FilterForm
│   ├── DateRangePicker
│   ├── StatusSelect
│   └── GenerateButton
├── ReportContent
│   ├── SummaryCards
│   │   ├── Card (Total Patients)
│   │   ├── Card (New Patients - in period)
│   │   ├── Card (Active Patients - with recent visits)
│   │   └── Card (Returning Patients)
│   ├── DemographicsSection
│   │   ├── PieChart (Patients by Gender)
│   │   └── PieChart (Patients by Blood Type)
│   ├── DiagnosesSection
│   │   └── HorizontalBarChart (Top 10 Diagnoses)
│   ├── TrendSection
│   │   └── LineChart (Patient Registration Trend)
│   └── AgeDistribution (optional)
│       └── BarChart (Patients by Age Group)
└── EmptyState
```

#### 3.5.3 Report Data Display

```typescript
interface PatientActivityDisplay {
  // Summary
  summary: {
    totalPatients: number;
    newPatients: number; // Registered in period
    activePatients: number; // Had visit in period
    returningPatients: number; // Multiple visits
  };

  // Demographics
  patientsByGender: Array<{
    gender: string; // MALE, FEMALE, OTHER
    count: number;
    percentage: number;
  }>;

  patientsByBloodType: Array<{
    bloodType: string; // A+, A-, B+, B-, AB+, AB-, O+, O-
    count: number;
    percentage: number;
  }>;

  // Medical data
  topDiagnoses: Array<{
    diagnosis: string;
    icdCode: string;
    count: number;
    percentage: number;
  }>;

  // Trend
  registrationTrend: Array<{
    date: string;
    newPatients: number;
    visits: number;
  }>;
}
```

---

## 4. API Integration & Data Mapping

### 4.1 Revenue Report API

#### 4.1.1 Get Revenue Report

| Property     | Value                                       |
| ------------ | ------------------------------------------- |
| **Endpoint** | `GET /api/reports/revenue`                  |
| **Used By**  | `RevenueReportPage`, `ReportsDashboardPage` |
| **Access**   | ADMIN only                                  |

**Query Parameters:**

| Parameter       | Type   | Required | Description              |
| --------------- | ------ | -------- | ------------------------ |
| `startDate`     | string | ✅       | Start date (YYYY-MM-DD)  |
| `endDate`       | string | ✅       | End date (YYYY-MM-DD)    |
| `departmentId`  | string | ❌       | Filter by department     |
| `paymentMethod` | string | ❌       | Filter by payment method |

**Request Example:**

```typescript
const params = {
  startDate: "2025-12-01",
  endDate: "2025-12-04",
  departmentId: "dept001", // Optional
  paymentMethod: "CASH", // Optional
};

// GET /api/reports/revenue?startDate=2025-12-01&endDate=2025-12-04&departmentId=dept001
```

**Response (200 OK):**

```typescript
{
  status: 'success',
  data: {
    totalRevenue: 125000.00,
    paidRevenue: 100000.00,
    unpaidRevenue: 25000.00,
    invoiceCount: 450,
    revenueByDepartment: [
      {
        departmentId: 'dept001',
        departmentName: 'Cardiology',
        revenue: 45000.00
      },
      {
        departmentId: 'dept002',
        departmentName: 'Neurology',
        revenue: 38000.00
      }
    ],
    revenueByPaymentMethod: [
      {
        method: 'CASH',
        amount: 30000.00,
        count: 150
      },
      {
        method: 'CARD',
        amount: 50000.00,
        count: 200
      },
      {
        method: 'INSURANCE',
        amount: 45000.00,
        count: 100
      }
    ],
    generatedAt: '2025-12-04T10:30:00Z',
    cached: true,
    cacheExpiresAt: '2025-12-04T22:30:00Z'
  }
}
```

**Response Handling:**

```typescript
// Success (200)
// → Display report data
// → Show cache info ("Data cached at [time], expires [time]")

// Error (400) - Validation
// → Show field errors (startDate, endDate)

// Error (403) - Forbidden
// → Toast "You don't have permission to view revenue reports"
// → Redirect to dashboard
```

---

### 4.2 Appointment Statistics API

#### 4.2.1 Get Appointment Statistics

| Property     | Value                                          |
| ------------ | ---------------------------------------------- |
| **Endpoint** | `GET /api/reports/appointments`                |
| **Used By**  | `AppointmentStatsPage`, `ReportsDashboardPage` |
| **Access**   | ADMIN (all), DOCTOR (own stats only)           |

**Query Parameters:**

| Parameter      | Type   | Required | Description                                 |
| -------------- | ------ | -------- | ------------------------------------------- |
| `startDate`    | string | ✅       | Start date (YYYY-MM-DD)                     |
| `endDate`      | string | ✅       | End date (YYYY-MM-DD)                       |
| `departmentId` | string | ❌       | Filter by department                        |
| `doctorId`     | string | ❌       | Filter by doctor (auto-set for DOCTOR role) |

**Request Example:**

```typescript
const params = {
  startDate: "2025-11-04",
  endDate: "2025-12-04",
  departmentId: "dept001",
  doctorId: undefined, // For DOCTOR role, backend auto-filters to own ID
};
```

**Response (200 OK):**

```typescript
{
  status: 'success',
  data: {
    totalAppointments: 1234,
    appointmentsByStatus: [
      { status: 'COMPLETED', count: 890 },
      { status: 'CANCELLED', count: 120 },
      { status: 'NO_SHOW', count: 45 },
      { status: 'SCHEDULED', count: 150 },
      { status: 'CONFIRMED', count: 29 }
    ],
    appointmentsByType: [
      { type: 'CONSULTATION', count: 600 },
      { type: 'FOLLOW_UP', count: 400 },
      { type: 'CHECK_UP', count: 200 },
      { type: 'EMERGENCY', count: 34 }
    ],
    appointmentsByDepartment: [
      { departmentId: 'dept001', departmentName: 'Cardiology', count: 350 },
      { departmentId: 'dept002', departmentName: 'Neurology', count: 280 }
    ],
    dailyTrend: [
      { date: '2025-12-01', count: 45 },
      { date: '2025-12-02', count: 52 },
      { date: '2025-12-03', count: 48 },
      { date: '2025-12-04', count: 38 }
    ],
    generatedAt: '2025-12-04T10:30:00Z',
    cached: true
  }
}
```

**Role-Based Filtering:**

```typescript
// For ADMIN - can filter any doctor
const adminParams = { startDate, endDate, doctorId: selectedDoctorId };

// For DOCTOR - backend auto-filters to own employeeId
const doctorParams = { startDate, endDate };
// Backend adds: doctorId = current user's employeeId
```

---

### 4.3 Doctor Performance API

#### 4.3.1 Get Doctor Performance Report

| Property     | Value                                           |
| ------------ | ----------------------------------------------- |
| **Endpoint** | `GET /api/reports/doctors/performance`          |
| **Used By**  | `DoctorPerformancePage`, `ReportsDashboardPage` |
| **Access**   | ADMIN only                                      |

**Query Parameters:**

| Parameter      | Type   | Required | Description             |
| -------------- | ------ | -------- | ----------------------- |
| `startDate`    | string | ✅       | Start date (YYYY-MM-DD) |
| `endDate`      | string | ✅       | End date (YYYY-MM-DD)   |
| `departmentId` | string | ❌       | Filter by department    |

**Response (200 OK):**

```typescript
{
  status: 'success',
  data: {
    doctors: [
      {
        doctorId: 'emp001',
        doctorName: 'Dr. Nguyen Van Hung',
        departmentId: 'dept001',
        departmentName: 'Cardiology',
        specialization: 'Interventional Cardiology',
        statistics: {
          appointmentsCompleted: 145,
          appointmentsTotal: 150,
          completionRate: 96.67,
          totalRevenue: 45000.00,
          patientsSeen: 120,
          prescriptionsWritten: 135,
          avgConsultationTime: 25
        }
      },
      {
        doctorId: 'emp002',
        doctorName: 'Dr. Tran Thi Mai',
        departmentId: 'dept002',
        departmentName: 'Neurology',
        specialization: 'Pediatric Neurology',
        statistics: {
          appointmentsCompleted: 110,
          appointmentsTotal: 120,
          completionRate: 91.67,
          totalRevenue: 38000.00,
          patientsSeen: 95,
          prescriptionsWritten: 102,
          avgConsultationTime: 30
        }
      }
    ],
    generatedAt: '2025-12-04T10:30:00Z',
    cached: true
  }
}
```

---

### 4.4 Patient Activity API

#### 4.4.1 Get Patient Activity Report

| Property     | Value                                         |
| ------------ | --------------------------------------------- |
| **Endpoint** | `GET /api/reports/patients/activity`          |
| **Used By**  | `PatientActivityPage`, `ReportsDashboardPage` |
| **Access**   | ADMIN only                                    |

**Query Parameters:**

| Parameter   | Type   | Required | Description             |
| ----------- | ------ | -------- | ----------------------- |
| `startDate` | string | ✅       | Start date (YYYY-MM-DD) |
| `endDate`   | string | ✅       | End date (YYYY-MM-DD)   |

**Response (200 OK):**

```typescript
{
  status: 'success',
  data: {
    totalPatients: 2500,
    newPatients: 150,
    activePatients: 1800,
    patientsByGender: [
      { gender: 'MALE', count: 1200 },
      { gender: 'FEMALE', count: 1250 },
      { gender: 'OTHER', count: 50 }
    ],
    patientsByBloodType: [
      { bloodType: 'O+', count: 900 },
      { bloodType: 'A+', count: 750 },
      { bloodType: 'B+', count: 500 },
      { bloodType: 'AB+', count: 200 },
      { bloodType: 'O-', count: 80 },
      { bloodType: 'A-', count: 40 },
      { bloodType: 'B-', count: 20 },
      { bloodType: 'AB-', count: 10 }
    ],
    topDiagnoses: [
      { diagnosis: 'Hypertension', icdCode: 'I10', count: 320 },
      { diagnosis: 'Type 2 Diabetes', icdCode: 'E11', count: 280 },
      { diagnosis: 'Acute Bronchitis', icdCode: 'J20', count: 150 }
    ],
    generatedAt: '2025-12-04T10:30:00Z',
    cached: true
  }
}
```

---

### 4.5 Clear Cache API

#### 4.5.1 Clear Report Cache

| Property     | Value                                   |
| ------------ | --------------------------------------- |
| **Endpoint** | `DELETE /api/reports/cache`             |
| **Used By**  | `ReportsDashboardPage` (Refresh button) |
| **Access**   | ADMIN only                              |

**Request:**

```typescript
// No body required
await axios.delete("/api/reports/cache");
```

**Response (200 OK):**

```typescript
{
  status: 'success',
  message: 'Report cache cleared successfully',
  clearedAt: '2025-12-04T10:35:00Z'
}
```

**Response Handling:**

```typescript
// Success (200)
// → Toast "Report cache cleared successfully"
// → Refetch current report data

// Error (403)
// → Toast "You don't have permission to clear cache"
```

---

### 4.6 React Query Hooks

```typescript
// hooks/queries/useReports.ts

// Revenue Report
export function useRevenueReport(params: RevenueReportParams) {
  return useQuery({
    queryKey: ["reports", "revenue", params],
    queryFn: () => reportsService.getRevenueReport(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours (matches backend cache)
  });
}

// Appointment Statistics
export function useAppointmentStats(params: AppointmentStatsParams) {
  return useQuery({
    queryKey: ["reports", "appointments", params],
    queryFn: () => reportsService.getAppointmentStats(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 12 * 60 * 60 * 1000,
  });
}

// Doctor Performance
export function useDoctorPerformance(params: DoctorPerformanceParams) {
  return useQuery({
    queryKey: ["reports", "doctors", "performance", params],
    queryFn: () => reportsService.getDoctorPerformance(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 12 * 60 * 60 * 1000,
  });
}

// Patient Activity
export function usePatientActivity(params: PatientActivityParams) {
  return useQuery({
    queryKey: ["reports", "patients", "activity", params],
    queryFn: () => reportsService.getPatientActivity(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 12 * 60 * 60 * 1000,
  });
}

// Clear Cache Mutation
export function useClearReportCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reportsService.clearCache(),
    onSuccess: () => {
      // Invalidate all report queries
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report cache cleared successfully");
    },
    onError: (error) => {
      handleApiError(error);
    },
  });
}

// Dashboard - parallel queries
export function useDashboardReports(dateRange: DateRange) {
  const params = {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  };

  return {
    revenue: useRevenueReport(params),
    appointments: useAppointmentStats(params),
    doctors: useDoctorPerformance(params),
    patients: usePatientActivity(params),
  };
}
```

---

### 4.7 Cache Key Patterns

```typescript
const reportQueryKeys = {
  // Base
  all: ["reports"] as const,

  // Revenue
  revenue: (params: RevenueReportParams) =>
    ["reports", "revenue", params] as const,

  // Appointments
  appointments: (params: AppointmentStatsParams) =>
    ["reports", "appointments", params] as const,

  // Doctor Performance
  doctorPerformance: (params: DoctorPerformanceParams) =>
    ["reports", "doctors", "performance", params] as const,

  // Patient Activity
  patientActivity: (params: PatientActivityParams) =>
    ["reports", "patients", "activity", params] as const,
};

// After clearing cache:
queryClient.invalidateQueries({ queryKey: reportQueryKeys.all });
```

---

## 5. Shared Components & Global State

### 5.1 Reusable Components for Reports

| Component          | Used In                 | Props                                   | Description          |
| ------------------ | ----------------------- | --------------------------------------- | -------------------- |
| `MetricCard`       | Dashboard, Report pages | value, label, icon, trend?, onClick?    | Summary stat card    |
| `ChartCard`        | All report pages        | title, children, loading?               | Wrapper for charts   |
| `DateRangePicker`  | All report pages        | startDate, endDate, onChange, maxRange? | Date range selector  |
| `ReportFilterForm` | All report pages        | filters, onSubmit, children             | Filter form wrapper  |
| `ExportDropdown`   | All report pages        | onExportCSV, onExportPDF?               | Export options menu  |
| `LoadingSkeleton`  | All pages               | variant: 'card' \| 'chart' \| 'table'   | Loading placeholders |
| `EmptyReportState` | All report pages        | message, onRefresh?                     | No data state        |
| `CacheInfoBanner`  | Report pages            | generatedAt, expiresAt, onRefresh       | Cache status display |

### 5.2 Chart Components

```typescript
// Using a charting library like Recharts or Chart.js

// Line Chart - for trends
interface LineChartProps {
  data: Array<{ date: string; value: number }>;
  xAxisKey: string;
  yAxisKey: string;
  color?: string;
  showGrid?: boolean;
}

// Pie Chart - for distributions
interface PieChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  showLabels?: boolean;
  showLegend?: boolean;
}

// Bar Chart - for comparisons
interface BarChartProps {
  data: Array<{ name: string; value: number }>;
  orientation?: "vertical" | "horizontal";
  color?: string;
  showValues?: boolean;
}
```

### 5.3 Color Schemes

```typescript
// Chart color palette
const chartColors = {
  primary: "#3b82f6", // Blue
  secondary: "#10b981", // Green
  tertiary: "#f59e0b", // Yellow
  quaternary: "#ef4444", // Red
  quinary: "#8b5cf6", // Purple

  // Status colors for appointment charts
  statusColors: {
    COMPLETED: "#10b981", // Green
    CONFIRMED: "#3b82f6", // Blue
    SCHEDULED: "#6b7280", // Gray
    CANCELLED: "#ef4444", // Red
    NO_SHOW: "#f59e0b", // Yellow
  },

  // Payment method colors
  paymentColors: {
    CASH: "#10b981",
    CARD: "#3b82f6",
    INSURANCE: "#8b5cf6",
    BANK_TRANSFER: "#f59e0b",
  },

  // Gender colors
  genderColors: {
    MALE: "#3b82f6",
    FEMALE: "#ec4899",
    OTHER: "#6b7280",
  },

  // Performance rate colors
  performanceColors: {
    excellent: "#10b981", // >= 90%
    good: "#f59e0b", // 80-89%
    poor: "#ef4444", // < 80%
  },
};

// Get performance color based on rate
function getPerformanceColor(rate: number): string {
  if (rate >= 90) return chartColors.performanceColors.excellent;
  if (rate >= 80) return chartColors.performanceColors.good;
  return chartColors.performanceColors.poor;
}
```

### 5.4 Date Range Utilities

```typescript
// utils/dateRanges.ts

export const presetDateRanges = {
  today: () => ({
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date()),
    label: "Today",
  }),

  last7Days: () => ({
    startDate: formatDate(subDays(new Date(), 7)),
    endDate: formatDate(new Date()),
    label: "Last 7 Days",
  }),

  last30Days: () => ({
    startDate: formatDate(subDays(new Date(), 30)),
    endDate: formatDate(new Date()),
    label: "Last 30 Days",
  }),

  thisMonth: () => ({
    startDate: formatDate(startOfMonth(new Date())),
    endDate: formatDate(new Date()),
    label: "This Month",
  }),

  lastMonth: () => ({
    startDate: formatDate(startOfMonth(subMonths(new Date(), 1))),
    endDate: formatDate(endOfMonth(subMonths(new Date(), 1))),
    label: "Last Month",
  }),

  thisYear: () => ({
    startDate: formatDate(startOfYear(new Date())),
    endDate: formatDate(new Date()),
    label: "This Year",
  }),
};

// Validate date range
export function validateDateRange(
  startDate: string,
  endDate: string
): string | null {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (start > end) {
    return "Start date cannot be after end date";
  }

  if (end > new Date()) {
    return "End date cannot be in the future";
  }

  const maxRange = 365; // 1 year
  if (differenceInDays(end, start) > maxRange) {
    return "Date range cannot exceed 1 year";
  }

  return null; // Valid
}
```

### 5.5 Number Formatting Utilities

```typescript
// utils/formatters.ts

// Currency formatting
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Percentage formatting
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Large number formatting (1.2K, 1.5M)
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// Add percentage to array items
export function addPercentages<T extends { count: number }>(
  items: T[]
): Array<T & { percentage: number }> {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  return items.map((item) => ({
    ...item,
    percentage: calculatePercentage(item.count, total),
  }));
}
```

### 5.6 Export Utilities

```typescript
// utils/export.ts

// Export to CSV
export function exportToCSV(
  data: any[],
  filename: string,
  columns: ColumnConfig[]
) {
  // Build header row
  const headers = columns.map((col) => col.label).join(",");

  // Build data rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        // Escape commas and quotes
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(",")
  );

  // Combine and download
  const csv = [headers, ...rows].join("\n");
  downloadFile(csv, `${filename}.csv`, "text/csv");
}

// Download file helper
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Export configurations for each report
export const exportConfigs = {
  revenue: {
    filename: "revenue-report",
    columns: [
      { key: "departmentName", label: "Department" },
      { key: "revenue", label: "Revenue" },
      { key: "percentage", label: "Percentage" },
    ],
  },
  appointments: {
    filename: "appointment-statistics",
    columns: [
      { key: "date", label: "Date" },
      { key: "total", label: "Total" },
      { key: "completed", label: "Completed" },
      { key: "cancelled", label: "Cancelled" },
    ],
  },
  doctorPerformance: {
    filename: "doctor-performance",
    columns: [
      { key: "doctorName", label: "Doctor" },
      { key: "departmentName", label: "Department" },
      { key: "patientsSeen", label: "Patients Seen" },
      { key: "completionRate", label: "Completion Rate" },
      { key: "totalRevenue", label: "Total Revenue" },
      { key: "prescriptionsWritten", label: "Prescriptions" },
    ],
  },
  patientActivity: {
    filename: "patient-activity",
    columns: [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value" },
    ],
  },
};
```

### 5.7 Cross-Service Dependencies

| Reports Service Needs | From Service | Endpoint                      |
| --------------------- | ------------ | ----------------------------- |
| Department list       | HR Service   | `GET /api/hr/departments`     |
| Doctor list           | HR Service   | `GET /api/hr/doctors`         |
| Department names      | HR Service   | Embedded in reports or lookup |

### 5.8 Global State for Reports

```typescript
// stores/reportStore.ts (if using Zustand)
import { create } from "zustand";

interface ReportFiltersState {
  // Common filters
  dateRange: {
    startDate: string;
    endDate: string;
  };

  // Department filter (shared across reports)
  selectedDepartmentId: string | null;

  // Actions
  setDateRange: (start: string, end: string) => void;
  setDepartment: (id: string | null) => void;
  resetFilters: () => void;
}

const defaultDateRange = presetDateRanges.thisMonth();

export const useReportFilters = create<ReportFiltersState>((set) => ({
  dateRange: {
    startDate: defaultDateRange.startDate,
    endDate: defaultDateRange.endDate,
  },
  selectedDepartmentId: null,

  setDateRange: (startDate, endDate) =>
    set({ dateRange: { startDate, endDate } }),

  setDepartment: (selectedDepartmentId) => set({ selectedDepartmentId }),

  resetFilters: () =>
    set({
      dateRange: {
        startDate: defaultDateRange.startDate,
        endDate: defaultDateRange.endDate,
      },
      selectedDepartmentId: null,
    }),
}));
```

---

## 6. Error Handling & Edge Cases

### 6.1 API Error Response Format

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
  timestamp: string;
}
```

### 6.2 Error Code Reference (Reports Service)

| HTTP | Code                      | When                                   | UI Response                                                                  |
| ---- | ------------------------- | -------------------------------------- | ---------------------------------------------------------------------------- |
| 400  | `VALIDATION_ERROR`        | Invalid date range, missing params     | Show field errors on filter form                                             |
| 401  | `UNAUTHORIZED`            | Missing/invalid token                  | Redirect to `/login`, clear auth state                                       |
| 403  | `FORBIDDEN`               | Non-ADMIN accessing admin-only reports | Toast "You don't have permission to view this report", redirect to dashboard |
| 404  | `DEPARTMENT_NOT_FOUND`    | Invalid departmentId filter            | Toast "Department not found", reset department filter                        |
| 404  | `EMPLOYEE_NOT_FOUND`      | Invalid doctorId filter                | Toast "Doctor not found", reset doctor filter                                |
| 500  | `REPORT_GENERATION_ERROR` | Backend aggregation failed             | Toast "Failed to generate report. Please try again.", show retry button      |
| 503  | `SERVICE_UNAVAILABLE`     | Dependent service down                 | Toast "Some data sources are unavailable. Report may be incomplete."         |

### 6.3 Validation Errors

```typescript
const reportValidationErrors = {
  startDate: [
    "startDate is required",
    "startDate must be valid ISO 8601 date (YYYY-MM-DD)",
    "startDate cannot be after endDate",
  ],
  endDate: [
    "endDate is required",
    "endDate must be valid ISO 8601 date (YYYY-MM-DD)",
    "endDate cannot be in the future",
  ],
  dateRange: ["Date range cannot exceed 1 year"],
  departmentId: ["departmentId must be valid UUID"],
  doctorId: ["doctorId must be valid UUID"],
  paymentMethod: [
    "paymentMethod must be one of [CASH, CARD, INSURANCE, BANK_TRANSFER]",
  ],
};
```

### 6.4 Error Handling Implementation

```typescript
// Centralized error handler for Reports Service
function handleReportError(
  error: ApiErrorResponse,
  options?: {
    setFieldErrors?: (errors: Record<string, string>) => void;
    onForbidden?: () => void;
  }
) {
  const { code, message, details } = error.error;

  switch (code) {
    case "UNAUTHORIZED":
      clearAuthState();
      router.push("/login");
      toast.error("Your session has expired. Please log in again.");
      break;

    case "FORBIDDEN":
      toast.error("You don't have permission to view this report");
      if (options?.onForbidden) {
        options.onForbidden();
      } else {
        router.push("/admin/reports");
      }
      break;

    case "VALIDATION_ERROR":
      if (details && options?.setFieldErrors) {
        const fieldErrors = details.reduce((acc, err) => {
          acc[err.field] = err.message;
          return acc;
        }, {} as Record<string, string>);
        options.setFieldErrors(fieldErrors);
      } else {
        toast.error(message || "Invalid filter parameters");
      }
      break;

    case "DEPARTMENT_NOT_FOUND":
      toast.error("Selected department not found");
      // Reset department filter
      break;

    case "EMPLOYEE_NOT_FOUND":
      toast.error("Selected doctor not found");
      // Reset doctor filter
      break;

    case "REPORT_GENERATION_ERROR":
      toast.error("Failed to generate report. Please try again.");
      break;

    case "SERVICE_UNAVAILABLE":
      toast.warning(
        "Some data sources are unavailable. Report may be incomplete."
      );
      // Still display partial data if available
      break;

    default:
      toast.error(message || "Something went wrong. Please try again.");
      console.error("Unhandled report error:", error);
  }
}
```

### 6.5 Edge Cases

| Scenario                                      | Handling                                                                          |
| --------------------------------------------- | --------------------------------------------------------------------------------- |
| No data for selected date range               | Show "No data available for selected period" with suggestion to change date range |
| Partial data (some sources failed)            | Show available data with banner "Some data may be incomplete"                     |
| Very large date range (performance)           | Show loading indicator, consider pagination or streaming                          |
| Cache expired during viewing                  | Auto-refresh with subtle loading indicator                                        |
| Concurrent cache clear                        | Queue requests, show "Refreshing..." state                                        |
| Export with no data                           | Disable export button, tooltip "No data to export"                                |
| Chart with single data point                  | Show value as label, not chart                                                    |
| Network timeout                               | Toast "Request timed out", show retry button                                      |
| Browser tab inactive (long load)              | Resume on focus, show "Data may be stale"                                         |
| DOCTOR viewing own stats with no appointments | Show "No appointments found for selected period"                                  |

### 6.6 Loading States

```typescript
// Loading state variants for reports
const loadingStates = {
  // Initial load
  initialLoading: {
    showSkeleton: true,
    showSpinner: false,
    disableFilters: true,
  },

  // Refetching (filter change)
  refetching: {
    showSkeleton: false,
    showSpinner: true,
    disableFilters: false,
    showStaleData: true,
  },

  // Cache refresh
  refreshing: {
    showSkeleton: false,
    showSpinner: true,
    disableFilters: true,
    showStaleData: true,
  },

  // Export in progress
  exporting: {
    showSkeleton: false,
    showSpinner: false,
    disableExportButton: true,
    showExportProgress: true,
  },
};
```

### 6.7 Toast Messages

```typescript
const reportToastMessages = {
  // Success
  success: {
    reportGenerated: "Report generated successfully",
    cacheCleared: "Report cache cleared successfully",
    exportComplete: "Report exported successfully",
  },

  // Error
  error: {
    UNAUTHORIZED: "Your session has expired. Please log in again.",
    FORBIDDEN: "You don't have permission to view this report",
    VALIDATION_ERROR: "Please check the filter parameters",
    DEPARTMENT_NOT_FOUND: "Selected department not found",
    EMPLOYEE_NOT_FOUND: "Selected doctor not found",
    REPORT_GENERATION_ERROR: "Failed to generate report. Please try again.",
    SERVICE_UNAVAILABLE: "Some data sources are unavailable",
    NETWORK_ERROR: "Network error. Please check your connection.",
    TIMEOUT: "Request timed out. Please try again.",
  },

  // Warning
  warning: {
    partialData: "Some data may be incomplete due to service issues",
    staleData: "Showing cached data. Click refresh for latest.",
    noData: "No data available for the selected filters",
    largeExport: "Large export may take a moment...",
  },

  // Info
  info: {
    cacheHit: "Showing cached report data",
    filterApplied: "Filters applied",
  },
};
```

### 6.8 HTTP Status Code Quick Reference

| HTTP Code | Meaning             | UI Action                              |
| --------- | ------------------- | -------------------------------------- |
| 200       | Success             | Display report data                    |
| 400       | Bad Request         | Show validation errors on form         |
| 401       | Unauthorized        | Redirect to login                      |
| 403       | Forbidden           | Redirect to allowed page with toast    |
| 404       | Not Found           | Toast + reset invalid filter           |
| 500       | Server Error        | Toast "Failed to generate", show retry |
| 503       | Service Unavailable | Toast warning, show partial data       |

### 6.9 Retry Logic

```typescript
// React Query retry configuration for reports
const reportQueryOptions = {
  retry: (failureCount: number, error: any) => {
    // Don't retry auth/permission errors
    if (error?.status === 401 || error?.status === 403) {
      return false;
    }
    // Retry server errors up to 2 times
    if (error?.status >= 500) {
      return failureCount < 2;
    }
    return false;
  },
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 10000),
};

// Manual retry button
function RetryButton({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <Button onClick={onRetry} disabled={isRetrying} variant="outline">
      {isRetrying ? "Retrying..." : "Retry"}
    </Button>
  );
}
```

---

## Appendix A: TypeScript Interfaces

```typescript
// ============================================
// Report Request Interfaces
// ============================================

interface RevenueReportParams {
  startDate: string; // Required: YYYY-MM-DD
  endDate: string; // Required: YYYY-MM-DD
  departmentId?: string; // Optional: Filter by department
  paymentMethod?: PaymentMethod; // Optional: Filter by payment method
}

interface AppointmentStatsParams {
  startDate: string; // Required: YYYY-MM-DD
  endDate: string; // Required: YYYY-MM-DD
  departmentId?: string; // Optional: Filter by department
  doctorId?: string; // Optional: Filter by doctor (auto-set for DOCTOR role)
}

interface DoctorPerformanceParams {
  startDate: string; // Required: YYYY-MM-DD
  endDate: string; // Required: YYYY-MM-DD
  departmentId?: string; // Optional: Filter by department
}

interface PatientActivityParams {
  startDate: string; // Required: YYYY-MM-DD
  endDate: string; // Required: YYYY-MM-DD
}

// ============================================
// Report Response Interfaces
// ============================================

interface RevenueReportData {
  totalRevenue: number;
  paidRevenue: number;
  unpaidRevenue: number;
  invoiceCount: number;
  revenueByDepartment: Array<{
    departmentId: string;
    departmentName: string;
    revenue: number;
  }>;
  revenueByPaymentMethod: Array<{
    method: PaymentMethod;
    amount: number;
    count: number;
  }>;
  generatedAt: string;
  cached: boolean;
  cacheExpiresAt?: string;
}

interface AppointmentStatsData {
  totalAppointments: number;
  appointmentsByStatus: Array<{
    status: AppointmentStatus;
    count: number;
  }>;
  appointmentsByType: Array<{
    type: AppointmentType;
    count: number;
  }>;
  appointmentsByDepartment: Array<{
    departmentId: string;
    departmentName: string;
    count: number;
  }>;
  dailyTrend: Array<{
    date: string;
    count: number;
  }>;
  generatedAt: string;
  cached: boolean;
}

interface DoctorPerformanceData {
  doctors: Array<{
    doctorId: string;
    doctorName: string;
    departmentId: string;
    departmentName: string;
    specialization: string;
    statistics: {
      appointmentsCompleted: number;
      appointmentsTotal: number;
      completionRate: number;
      totalRevenue: number;
      patientsSeen: number;
      prescriptionsWritten: number;
      avgConsultationTime: number;
    };
  }>;
  generatedAt: string;
  cached: boolean;
}

interface PatientActivityData {
  totalPatients: number;
  newPatients: number;
  activePatients: number;
  patientsByGender: Array<{
    gender: Gender;
    count: number;
  }>;
  patientsByBloodType: Array<{
    bloodType: BloodType;
    count: number;
  }>;
  topDiagnoses: Array<{
    diagnosis: string;
    icdCode: string;
    count: number;
  }>;
  generatedAt: string;
  cached: boolean;
}

// ============================================
// Enums
// ============================================

type ReportType =
  | "REVENUE"
  | "APPOINTMENTS"
  | "DOCTOR_PERFORMANCE"
  | "PATIENT_ACTIVITY";

type PaymentMethod = "CASH" | "CARD" | "INSURANCE" | "BANK_TRANSFER";

type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

type AppointmentType = "CONSULTATION" | "FOLLOW_UP" | "EMERGENCY" | "CHECK_UP";

type Gender = "MALE" | "FEMALE" | "OTHER";

type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

// ============================================
// API Response Wrappers
// ============================================

interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  timestamp: string;
}

// Clear cache response
interface ClearCacheResponse {
  status: "success";
  message: string;
  clearedAt: string;
}

// ============================================
// Dashboard Summary Types
// ============================================

interface DashboardSummary {
  revenue: {
    total: number;
    trend: number; // Percentage change vs last period
  };
  appointments: {
    total: number;
    trend: number;
  };
  doctors: {
    activeCount: number;
    avgCompletionRate: number;
  };
  patients: {
    total: number;
    newThisMonth: number;
  };
  lastUpdated: string;
}

// ============================================
// Chart Data Types
// ============================================

interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface TrendDataPoint {
  date: string;
  value: number;
}

interface MultiSeriesTrendData {
  date: string;
  [key: string]: number | string;
}

// ============================================
// Filter State Types
// ============================================

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ReportFilters extends DateRange {
  departmentId?: string;
  doctorId?: string;
  paymentMethod?: PaymentMethod;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

// ============================================
// Export Types
// ============================================

interface ColumnConfig {
  key: string;
  label: string;
  format?: "currency" | "percentage" | "number" | "date";
}

interface ExportConfig {
  filename: string;
  columns: ColumnConfig[];
}
```

---

## Appendix B: Implementation Checklist

### Reports Dashboard

- [ ] Dashboard page layout with grid
- [ ] MetricCard component with trend indicator
- [ ] Revenue summary card (ADMIN only)
- [ ] Appointments summary card
- [ ] Doctor performance summary card (ADMIN only)
- [ ] Patient activity summary card (ADMIN only)
- [ ] Quick charts (revenue trend, appointment status)
- [ ] Navigation cards to detailed reports
- [ ] Refresh/clear cache button (ADMIN only)
- [ ] Loading skeletons for cards
- [ ] Error states for failed data loads
- [ ] Role-based visibility

### Revenue Report Page

- [ ] Filter form (date range, department, payment method)
- [ ] Date range validation
- [ ] Summary cards (total, paid, unpaid, invoice count)
- [ ] Bar chart: Revenue by Department
- [ ] Pie chart: Revenue by Payment Method
- [ ] Export to CSV
- [ ] Export to PDF (stretch)
- [ ] Loading state
- [ ] Empty state (no data)
- [ ] Cache info banner

### Appointment Statistics Page

- [ ] Filter form (date range, department, doctor)
- [ ] Doctor dropdown filtered by department
- [ ] DOCTOR role: auto-filter to own stats
- [ ] Summary cards (total, completed, cancelled, no-show rate)
- [ ] Pie chart: Appointments by Status
- [ ] Bar chart: Appointments by Type
- [ ] Line chart: Daily Trend
- [ ] Horizontal bar: By Department
- [ ] Export to CSV
- [ ] Loading/empty states

### Doctor Performance Page

- [ ] Filter form (date range, department, sort by)
- [ ] Summary cards (total doctors, avg completion, total patients, total revenue)
- [ ] Performance data table
- [ ] Sortable columns
- [ ] Completion rate color coding
- [ ] Doctor detail modal
- [ ] Export to CSV
- [ ] Loading/empty states

### Patient Activity Page

- [ ] Filter form (date range, status)
- [ ] Summary cards (total, new, active, returning)
- [ ] Pie chart: Patients by Gender
- [ ] Pie chart: Patients by Blood Type
- [ ] Horizontal bar: Top 10 Diagnoses
- [ ] Line chart: Registration Trend
- [ ] Export to CSV
- [ ] Loading/empty states

### Shared Components

- [ ] MetricCard (value, label, icon, trend)
- [ ] ChartCard (title, loading, children)
- [ ] DateRangePicker with presets
- [ ] ReportFilterForm wrapper
- [ ] ExportDropdown (CSV, PDF)
- [ ] LoadingSkeleton (card, chart, table variants)
- [ ] EmptyReportState
- [ ] CacheInfoBanner
- [ ] RetryButton

### Chart Components

- [ ] LineChart (trends)
- [ ] PieChart (distributions)
- [ ] BarChart (vertical)
- [ ] HorizontalBarChart
- [ ] Chart color schemes
- [ ] Responsive sizing
- [ ] Tooltips
- [ ] Legends

### Utilities

- [ ] Date range presets (today, last 7 days, this month, etc.)
- [ ] Date validation
- [ ] Currency formatting
- [ ] Percentage formatting
- [ ] Compact number formatting
- [ ] CSV export utility
- [ ] Performance color helper

### State Management

- [ ] React Query hooks for all 4 reports
- [ ] Clear cache mutation
- [ ] Dashboard parallel queries
- [ ] Cache key patterns
- [ ] Stale time configuration (12 hours)
- [ ] Report filters store (if using global state)

### Error Handling

- [ ] Centralized error handler
- [ ] Field-level validation errors
- [ ] 401 redirect to login
- [ ] 403 redirect with toast
- [ ] 404 filter reset
- [ ] 500 retry logic
- [ ] 503 partial data display
- [ ] Network error handling
- [ ] Timeout handling

### Access Control

- [ ] ADMIN: Full access to all reports
- [ ] DOCTOR: Own appointment stats only
- [ ] Route guards
- [ ] UI element hiding based on role
- [ ] API error handling for forbidden

### Testing

- [ ] Unit tests for formatting utilities
- [ ] Unit tests for date validation
- [ ] Component tests for charts
- [ ] Integration tests for report pages
- [ ] Mock data for development
- [ ] Error state testing
      Beta
      0 / 0
      used queries
      1
