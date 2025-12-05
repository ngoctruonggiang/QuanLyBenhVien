# HMS Frontend - Hướng dẫn đóng góp

## Mục lục

- [Tổng quan dự án](#tổng-quan-dự-án)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Quy ước code](#quy-ước-code)
- [Hướng dẫn tạo module mới](#hướng-dẫn-tạo-module-mới)
- [Mock Data](#mock-data)

---

## Tổng quan dự án

**HMS (Hospital Management System)** là hệ thống quản lý bệnh viện bao gồm:

- **Quản lý bệnh nhân (Patients)** - Đăng ký, xem, sửa, xóa thông tin bệnh nhân
- **Quản lý thuốc (Medicines)** - Quản lý kho thuốc, danh mục
- **Quản lý lịch hẹn (Appointments)** - Đặt lịch khám, quản lý slot thời gian
- **Khám bệnh (Examinations)** - Tạo phiếu khám, kê đơn thuốc
- **Nhân sự (HR)** - Quản lý nhân viên, phòng ban, lịch làm việc
- **Thanh toán (Billing)** - Hóa đơn, thanh toán
- **Báo cáo (Reports)** - Thống kê, báo cáo

---

## Cấu trúc thư mục

```
HMS_FE/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group cho auth (login, signup, ...)
│   │   ├── login/
│   │   ├── signup/
│   │   └── password-reset/
│   ├── admin/                    # Admin dashboard
│   │   ├── appointments/         # Module lịch hẹn
│   │   ├── billing/              # Module thanh toán
│   │   ├── exams/                # Module khám bệnh
│   │   ├── hr/                   # Module nhân sự
│   │   │   ├── employees/
│   │   │   ├── departments/
│   │   │   ├── schedules/
│   │   │   └── attendance/
│   │   ├── medicines/            # Module thuốc
│   │   │   ├── page.tsx          # Danh sách thuốc
│   │   │   ├── new/              # Thêm thuốc mới
│   │   │   ├── [id]/             # Chi tiết & sửa thuốc
│   │   │   └── _components/      # Components riêng của module
│   │   ├── patients/             # Module bệnh nhân
│   │   │   ├── page.tsx          # Danh sách bệnh nhân
│   │   │   ├── new/              # Đăng ký bệnh nhân
│   │   │   ├── [id]/             # Chi tiết & sửa bệnh nhân
│   │   │   └── _components/      # Components riêng của module
│   │   ├── reports/              # Module báo cáo
│   │   ├── _components/          # Components dùng chung trong admin
│   │   ├── layout.tsx            # Layout admin (sidebar, header)
│   │   └── page.tsx              # Dashboard
│   ├── doctor/                   # Doctor portal (future)
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/                   # Shared components
│   └── ui/                       # Shadcn/UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── table.tsx
│       └── ...
│
├── config/                       # Configuration
│   └── axios.ts                  # Axios instance & interceptors
│
├── hooks/                        # Custom hooks
│   ├── queries/                  # React Query hooks
│   │   ├── usePatient.ts         # Patient CRUD hooks
│   │   ├── useMedicine.ts        # Medicine CRUD hooks
│   │   ├── useAppointment.ts
│   │   ├── useBilling.ts
│   │   ├── useHr.ts
│   │   └── ...
│   ├── use-mobile.ts
│   └── useDebounce.ts
│
├── interfaces/                   # TypeScript interfaces
│   ├── patient.ts                # Patient types
│   ├── medicine.ts               # Medicine types
│   ├── appointment.ts
│   ├── billing.ts
│   ├── hr.ts
│   └── ...
│
├── lib/                          # Utilities & helpers
│   ├── mocks/
│   │   └── toggle.ts             # USE_MOCK flag
│   ├── schemas/                  # Zod validation schemas
│   │   ├── patient.ts
│   │   ├── medicine.ts
│   │   └── ...
│   └── utils.ts                  # Utility functions (cn, ...)
│
├── services/                     # API services
│   ├── patient.service.ts        # Patient API calls + mock data
│   ├── medicine.service.ts       # Medicine API calls + mock data
│   ├── appointment.service.ts
│   ├── billing.service.ts
│   ├── hr.service.ts
│   └── ...
│
├── .env.local                    # Environment variables
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Công nghệ sử dụng

| Công nghệ           | Phiên bản | Mục đích                       |
| ------------------- | --------- | ------------------------------ |
| **Next.js**         | 16.x      | Framework React với App Router |
| **React**           | 19.x      | UI Library                     |
| **TypeScript**      | 5.x       | Type safety                    |
| **TanStack Query**  | 5.x       | Data fetching & caching        |
| **React Hook Form** | 7.x       | Form management                |
| **Zod**             | 3.x       | Schema validation              |
| **Shadcn/UI**       | -         | UI component library           |
| **Tailwind CSS**    | 4.x       | Styling                        |
| **Axios**           | 1.x       | HTTP client                    |
| **Lucide React**    | -         | Icons                          |

---

## Cài đặt và chạy dự án

### Yêu cầu

- Node.js >= 18.x
- pnpm (khuyến nghị) hoặc npm

### Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd HMS_FE

# Cài đặt dependencies
pnpm install
# hoặc
npm install
```

### Chạy development server

```bash
pnpm dev
# hoặc
npm run dev
```

Truy cập: http://localhost:3000

### Environment Variables

Tạo file `.env.local`:

```env
# Bật mock data (không cần backend)
NEXT_PUBLIC_USE_MOCK=1

# API URL (khi tắt mock)
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## Quy ước code

### 1. Naming Convention

| Loại                    | Convention           | Ví dụ                                |
| ----------------------- | -------------------- | ------------------------------------ |
| **Files/Folders**       | kebab-case           | `patient-form.tsx`, `use-patient.ts` |
| **Components**          | PascalCase           | `PatientForm`, `MedicineCard`        |
| **Functions/Variables** | camelCase            | `getPatients`, `handleSubmit`        |
| **Interfaces/Types**    | PascalCase           | `Patient`, `CreatePatientRequest`    |
| **Constants**           | SCREAMING_SNAKE_CASE | `USE_MOCK`, `API_URL`                |

### 2. Cấu trúc component

```tsx
"use client"; // Nếu là client component

// 1. Imports - theo thứ tự: external → internal → types
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getPatients } from "@/services/patient.service";
import { Patient } from "@/interfaces/patient";

// 2. Types (nếu có)
interface Props {
  initialData?: Patient;
}

// 3. Component
export function PatientForm({ initialData }: Props) {
  // State
  const [loading, setLoading] = useState(false);

  // Queries/Mutations
  const { data } = useQuery({...});

  // Handlers
  const handleSubmit = () => {...};

  // Render
  return (
    <div>...</div>
  );
}
```

### 3. Folder `_components`

- Prefix `_` cho thư mục components riêng của module
- Components trong đây chỉ dùng trong module đó
- Export qua `index.ts` để import gọn

```tsx
// app/admin/patients/_components/index.ts
export { PatientForm } from "./patient-form";
export { PatientCard } from "./patient-card";
export { PatientFilters } from "./patient-filters";

// Sử dụng
import { PatientForm, PatientCard } from "./_components";
```

---

## Hướng dẫn tạo module mới

Ví dụ: Tạo module **Suppliers** (Nhà cung cấp)

### Bước 1: Tạo Interface

```typescript
// interfaces/supplier.ts
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierListParams {
  page?: number;
  size?: number;
  search?: string;
}

export interface SupplierListResponse {
  content: Supplier[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
}
```

### Bước 2: Tạo Schema validation

```typescript
// lib/schemas/supplier.ts
import { z } from "zod";

export const supplierFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactPerson: z.string().min(2, "Contact person is required"),
  phone: z.string().min(10, "Invalid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
```

### Bước 3: Tạo Service

```typescript
// services/supplier.service.ts
import api from "@/config/axios";
import { USE_MOCK } from "@/lib/mocks/toggle";
import {
  Supplier,
  SupplierListParams,
  SupplierListResponse,
  CreateSupplierRequest,
} from "@/interfaces/supplier";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Mock data
const mockSuppliers: Supplier[] = [...];

export const getSuppliers = async (
  params: SupplierListParams
): Promise<SupplierListResponse> => {
  if (USE_MOCK) {
    await delay(200);
    // Filter, paginate mock data
    return {...};
  }
  const response = await api.get("/suppliers", { params });
  return response.data.data;
};

export const createSupplier = async (
  data: CreateSupplierRequest
): Promise<Supplier> => {
  if (USE_MOCK) {
    await delay(300);
    // Create mock supplier
    return {...};
  }
  const response = await api.post("/suppliers", data);
  return response.data.data;
};

// ... other CRUD methods
```

### Bước 4: Tạo React Query Hooks

```typescript
// hooks/queries/useSupplier.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "@/services/supplier.service";
import {
  SupplierListParams,
  CreateSupplierRequest,
} from "@/interfaces/supplier";

export const supplierKeys = {
  all: ["suppliers"] as const,
  list: (params: SupplierListParams) => ["suppliers", "list", params] as const,
  detail: (id: string) => ["suppliers", "detail", id] as const,
};

export const useSuppliers = (params: SupplierListParams) => {
  return useQuery({
    queryKey: supplierKeys.list(params),
    queryFn: () => getSuppliers(params),
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.all });
      toast.success("Supplier created successfully");
    },
    onError: () => {
      toast.error("Failed to create supplier");
    },
  });
};

// ... other hooks
```

### Bước 5: Tạo Pages

```
app/admin/suppliers/
├── page.tsx              # List page
├── new/
│   └── page.tsx          # Create page
├── [id]/
│   ├── page.tsx          # Detail page
│   └── edit/
│       └── page.tsx      # Edit page
└── _components/
    ├── index.ts
    ├── supplier-form.tsx
    └── supplier-card.tsx
```

### Bước 6: Thêm vào Navigation

```tsx
// app/admin/layout.tsx
const navItems = [
  // ... existing items
  {
    title: "Suppliers",
    icon: Truck,
    href: "/admin/suppliers",
  },
];
```

---

## Mock Data

### Bật/Tắt Mock Mode

```env
# .env.local
NEXT_PUBLIC_USE_MOCK=1   # Bật mock (không cần backend)
NEXT_PUBLIC_USE_MOCK=0   # Tắt mock (gọi API thực)
```

### Cách mock hoạt động

```typescript
// services/patient.service.ts
export const getPatients = async (params) => {
  if (USE_MOCK) {
    await delay(200); // Simulate network delay
    // Return mock data
    return mockPatients;
  }

  // Call real API
  const response = await api.get("/patients", { params });
  return response.data.data;
};
```

### Thêm mock data mới

1. Thêm vào đầu file service
2. Đảm bảo cấu trúc giống response API thật
3. Implement filter/pagination logic trong mock

---

## Tips & Best Practices

1. **Luôn sử dụng TypeScript** - Không dùng `any` trừ khi bắt buộc

2. **React Query cho data fetching** - Không dùng useEffect để fetch

3. **Zod cho validation** - Schema validation cả client và server

4. **Toast notifications** - Dùng `sonner` cho feedback

5. **Loading states** - Luôn handle loading với skeleton/spinner

6. **Error handling** - Try-catch và hiển thị lỗi user-friendly

7. **Responsive design** - Mobile-first với Tailwind

---

## Liên hệ

Nếu có thắc mắc, vui lòng tạo issue hoặc liên hệ team lead.
