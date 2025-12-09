# Quick Start for AI Agents

**Welcome, AI Agent!** 👋  
You've been assigned to work on the Hospital Management System frontend project.

---

## 🚀 Step-by-Step Onboarding

### **Step 1: Read Foundation Documents (15 minutes)**

Read these files **in order**:

1. **`DOCS/AI-CODING-STANDARDS.md`** ⭐ MANDATORY
   - Coding conventions all AI agents must follow
   - Fixes common inconsistency issues (especially datetime handling)
   - **Skip at your own peril!**

2. **`DOCS/AI-AGENT-OPERATIONS-GUIDE.md`**
   - How to navigate the codebase
   - Common workflows and patterns
   - Where things are located

3. **`README.md`**
   - Basic project setup
   - How to run the dev server
   - Available scripts

### **Step 2: Understand the Project Structure**

```
HMS_FE/
├── DOCS/                    # 📚 START HERE
│   ├── AI-CODING-STANDARDS.md      ⭐ MANDATORY READ
│   ├── AI-AGENT-OPERATIONS-GUIDE.md
│   └── fe-specs/                   # Feature specifications
│       ├── ROLE-PERMISSIONS-MATRIX.md
│       ├── fe-spec-appointment-service.md
│       ├── fe-spec-billing-service.md
│       ├── fe-spec-hr-service.md
│       ├── fe-spec-medical-exam.md
│       ├── fe-spec-patient-service.md
│       └── fe-spec-reports-service.md
├── app/                     # Next.js App Router pages
├── components/              # React components
├── services/                # API service layers
├── hooks/                   # Custom React hooks
├── interfaces/              # TypeScript interfaces
└── lib/                     # Utilities & schemas
```

### **Step 3: Get Your Assignment**

When you receive a task, ask yourself:

1. **What feature?** (Appointments, Billing, HR, Medical Exams, Patients, Reports)
2. **What action?** (Create, Read, Update, Delete, List)
3. **What role?** (ADMIN, DOCTOR, NURSE, RECEPTIONIST, PATIENT)

### **Step 4: Check the Spec**

Before writing any code:

```bash
# Find the relevant spec
cat DOCS/fe-specs/fe-spec-[feature]-service.md

# Example: For appointments
cat DOCS/fe-specs/fe-spec-appointment-service.md
```

**Look for:**

- User flows
- Acceptance criteria
- API endpoints
- Data models
- Permission requirements

### **Step 5: Find Reference Implementation**

Search for similar existing code:

```bash
# Example: Find how datetime is handled
grep -r "appointmentTime" app/
grep -r "format.*yyyy-MM-dd" services/

# Example: Find how forms are implemented
grep -r "useForm" app/admin/appointments/

# Example: Find role checks
grep -r "user?.role ===" app/
```

### **Step 6: Follow the Standards**

Refer to `DOCS/AI-CODING-STANDARDS.md` for:

- ✅ DateTime handling patterns
- ✅ Form implementation
- ✅ Component structure
- ✅ Role-based access control
- ✅ Error handling
- ✅ Naming conventions

### **Step 7: Implement & Test**

1. **Write code** following the established patterns
2. **Check browser console** - No errors?
3. **Check network tab** - API calls correct?
4. **Test with different roles** - ADMIN, DOCTOR, RECEPTIONIST, etc.
5. **Run linter** - `npm run lint`

---

## 🎯 Common Tasks Reference

### **Task: Add a new route**

Example: Add `/admin/appointments/[id]/cancel` page

1. **Check spec**: `fe-spec-appointment-service.md` → Find "Cancel Appointment" flow
2. **Check permissions**: `ROLE-PERMISSIONS-MATRIX.md` → Who can cancel?
3. **Find reference**: Look at similar action (e.g., edit page)
4. **Create files**:
   ```
   app/admin/appointments/[id]/cancel/page.tsx
   ```
5. **Follow patterns** from `AI-CODING-STANDARDS.md`
6. **Add RoleGuard** with correct roles
7. **Test with multiple roles**

### **Task: Add a new form field**

Example: Add "urgency level" to appointment form

1. **Update interface**: `interfaces/appointment.ts`

   ```typescript
   export interface Appointment {
     // ...existing fields
     urgencyLevel?: "LOW" | "MEDIUM" | "HIGH";
   }
   ```

2. **Update Zod schema**: `app/admin/appointments/new/page.tsx`

   ```typescript
   const schema = z.object({
     // ...existing fields
     urgencyLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
   });
   ```

3. **Add form field**: Follow existing pattern

   ```typescript
   <FormField
     control={form.control}
     name="urgencyLevel"
     render={({ field }) => (
       <FormItem>
         <FormLabel>Urgency Level</FormLabel>
         <Select onValueChange={field.onChange} value={field.value}>
           {/* Options */}
         </Select>
       </FormItem>
     )}
   />
   ```

4. **Update service**: `services/appointment.service.ts`
5. **Test**: Create appointment with new field

### **Task: Fix a datetime bug**

1. **Read**: `AI-CODING-STANDARDS.md` → Date & Time Handling section
2. **Identify issue**: Is it format? Assembly? Display?
3. **Check console**: Look for malformed datetime strings
4. **Apply pattern**:

   ```typescript
   // Correct assembly
   const datetime = format(dateObject, "yyyy-MM-dd") + "T" + timeString + ":00";

   // Correct display
   const displayDate = format(parseISO(isoString), "PPp");
   ```

5. **Test**: Verify in browser & network tab

### **Task: Add role-based visibility**

Example: Hide "Delete" button from non-ADMIN users

1. **Check spec**: `ROLE-PERMISSIONS-MATRIX.md` → Who can delete?
2. **Apply pattern**:

   ```typescript
   import { useAuth } from "@/contexts/AuthContext";

   const { user } = useAuth();

   {user?.role === "ADMIN" && (
     <Button onClick={handleDelete} variant="destructive">
       Delete
     </Button>
   )}
   ```

3. **Test with different roles**: Login as ADMIN, DOCTOR, RECEPTIONIST

---

## 🐛 Debugging Checklist

When something doesn't work:

### **1. Browser Console (F12)**

- [ ] Any red errors?
- [ ] Any yellow warnings about datetime?
- [ ] Any 403/404 errors?

### **2. Network Tab**

- [ ] API call going to correct endpoint?
- [ ] Request payload correct format?
- [ ] Response status 200 or error?

### **3. Code Review**

- [ ] Followed patterns from `AI-CODING-STANDARDS.md`?
- [ ] Checked similar working implementation?
- [ ] Used correct imports?
- [ ] TypeScript errors?

### **4. Common Issues**

| Issue               | Check                             | Fix                                           |
| ------------------- | --------------------------------- | --------------------------------------------- |
| DateTime malformed  | Console shows duplicate dates     | Follow datetime assembly pattern in standards |
| Permission denied   | User role doesn't match RoleGuard | Check `ROLE-PERMISSIONS-MATRIX.md`            |
| Form not submitting | Validation errors?                | Check Zod schema, required fields             |
| Component not found | Import path wrong?                | Use `@/` aliases, check file exists           |
| Styling broken      | Tailwind classes wrong?           | Use `cn()` utility, check shadcn docs         |

---

## 📚 Essential Cheat Sheet

### **File Locations**

```bash
# Where to find...
Auth logic          → hooks/use-auth.ts
Role definitions    → hooks/use-auth.ts (UserRole type)
API base URL        → config/axios.ts
API interceptors    → config/axios.ts
Form validation     → lib/schemas/*.ts
UI primitives       → components/ui/*
Domain components   → components/[domain]/*
Services            → services/*.service.ts
React Query hooks   → hooks/queries/*.ts
Interfaces          → interfaces/*.ts
Mock data           → lib/mocks/index.ts
```

### **Key Patterns**

```typescript
// DateTime assembly
format(date, "yyyy-MM-dd") + "T" + time + ":00"

// Role check
{user?.role === "ADMIN" && <Component />}

// Form with validation
const form = useForm({ resolver: zodResolver(schema) })

// Mutation with error handling
const mutation = useMutation({
  mutationFn: service.create,
  onSuccess: () => toast.success("Success"),
  onError: (e) => toast.error(getErrorMessage(e)),
})

// Conditional styling
className={cn("base-class", { "active-class": isActive })}
```

### **Common Commands**

```bash
# Development
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npx tsc --noEmit    # Type check

# Search codebase
grep -r "pattern" app/
grep -r "pattern" services/

# Find files
find app -name "*appointment*"
```

---

## ✅ Before You Start Coding

- [ ] Read `DOCS/AI-CODING-STANDARDS.md` completely
- [ ] Read the relevant spec in `DOCS/fe-specs/`
- [ ] Check `ROLE-PERMISSIONS-MATRIX.md` for permissions
- [ ] Search for similar existing implementation
- [ ] Understand the data flow: Component → Hook → Service → API
- [ ] Know which role(s) can access the feature

---

## 🎓 Learning Path

If you're new to this codebase, implement features in this order:

1. **Simple view**: List page with table (e.g., view patients)
2. **Detail page**: Single item view (e.g., patient detail)
3. **Create form**: Form with validation (e.g., register patient)
4. **Edit form**: Pre-filled form (e.g., edit patient)
5. **Complex form**: Multiple steps, datetime (e.g., create appointment)
6. **Role-based UI**: Different views per role

---

## 🆘 Need Help?

1. **Search this guide**: Ctrl+F for keywords
2. **Check standards**: `AI-CODING-STANDARDS.md` has detailed examples
3. **Check operations guide**: `AI-AGENT-OPERATIONS-GUIDE.md` for workflows
4. **Search codebase**: Find working examples
5. **Read specs**: `fe-specs/*.md` for requirements
6. **Ask with context**: Include error messages, what you tried, relevant code

---

## 🎯 Success Criteria

You're ready to code when you can answer:

1. **What am I building?** (Feature, action, UI)
2. **Who can use it?** (Roles)
3. **What's the data flow?** (Component → API)
4. **What's the datetime format?** (ISO 8601)
5. **Where's a similar example?** (Reference file)

---

**Welcome to the team! 🎉**  
**Remember:** Consistency > Cleverness. Follow the patterns, and you'll do great!

---

**Quick Links:**

- [AI Coding Standards](./AI-CODING-STANDARDS.md) ⭐
- [Operations Guide](./AI-AGENT-OPERATIONS-GUIDE.md)
- [Role Permissions Matrix](./fe-specs/ROLE-PERMISSIONS-MATRIX.md)
- [Feature Specs](./fe-specs/)
