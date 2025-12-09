# Documentation Index

**For AI Agents & Human Developers**

---

## 🚦 Start Here

If you're an **AI agent** assigned to this project, read documents in this order:

### **1. AI Quick Start** ⚡ (5 minutes)

📄 [`AI-QUICK-START.md`](./AI-QUICK-START.md)  
**What:** Fast onboarding guide  
**When:** First time working on this project  
**Why:** Get oriented quickly

### **2. AI Coding Standards** ⭐ (15 minutes)

📄 [`AI-CODING-STANDARDS.md`](./AI-CODING-STANDARDS.md)  
**What:** Mandatory coding conventions  
**When:** Before writing ANY code  
**Why:** Ensures consistency across multiple AI agents (prevents datetime bugs, naming conflicts, etc.)

### **3. AI Agent Operations Guide** 📖 (30 minutes)

📄 [`AI-AGENT-OPERATIONS-GUIDE.md`](./AI-AGENT-OPERATIONS-GUIDE.md)  
**What:** Comprehensive operational manual  
**When:** Deep dive into codebase architecture  
**Why:** Understand project structure, patterns, workflows

### **4. Feature Specifications** 📋 (As needed)

📁 [`fe-specs/`](./fe-specs/)  
**What:** Detailed requirements for each service  
**When:** Working on a specific feature  
**Why:** Source of truth for business logic, API contracts, permissions

---

## 📚 Document Overview

### **For AI Agents (New Contributors)**

| Document                                                         | Purpose            | Read When                   | Priority     |
| ---------------------------------------------------------------- | ------------------ | --------------------------- | ------------ |
| [`AI-QUICK-START.md`](./AI-QUICK-START.md)                       | Fast onboarding    | First day                   | 🔥 Critical  |
| [`AI-CODING-STANDARDS.md`](./AI-CODING-STANDARDS.md)             | Coding conventions | Before every coding session | ⭐ Mandatory |
| [`AI-AGENT-OPERATIONS-GUIDE.md`](./AI-AGENT-OPERATIONS-GUIDE.md) | Operational manual | First week                  | 📖 Important |

### **Feature Specifications**

| Document                                                                               | Service            | Contains                          |
| -------------------------------------------------------------------------------------- | ------------------ | --------------------------------- |
| [`fe-specs/ROLE-PERMISSIONS-MATRIX.md`](./fe-specs/ROLE-PERMISSIONS-MATRIX.md)         | All                | Who can do what                   |
| [`fe-specs/fe-spec-patient-service.md`](./fe-specs/fe-spec-patient-service.md)         | Patient Management | Patient CRUD, registration        |
| [`fe-specs/fe-spec-appointment-service.md`](./fe-specs/fe-spec-appointment-service.md) | Appointments       | Booking, scheduling, cancellation |
| [`fe-specs/fe-spec-billing-service.md`](./fe-specs/fe-spec-billing-service.md)         | Billing            | Invoices, payments                |
| [`fe-specs/fe-spec-hr-service.md`](./fe-specs/fe-spec-hr-service.md)                   | HR Management      | Employees, departments, schedules |
| [`fe-specs/fe-spec-medical-exam.md`](./fe-specs/fe-spec-medical-exam.md)               | Medical Exams      | Clinical notes, prescriptions     |
| [`fe-specs/fe-spec-reports-service.md`](./fe-specs/fe-spec-reports-service.md)         | Reports            | Analytics, statistics             |

### **Testing & Validation**

| Document                                                                             | Purpose                                     |
| ------------------------------------------------------------------------------------ | ------------------------------------------- |
| [`ADMIN-APPOINTMENT-TESTING-CHECKLIST.md`](./ADMIN-APPOINTMENT-TESTING-CHECKLIST.md) | Complete test cases for appointment booking |

### **Progress Tracking**

| Document                                                                                     | Purpose                            |
| -------------------------------------------------------------------------------------------- | ---------------------------------- |
| [`Tien-Do-Hien-Tai/So-sanh-spec-code-base.md`](./Tien-Do-Hien-Tai/So-sanh-spec-code-base.md) | Implementation status & comparison |

---

## 🎯 Quick Navigation by Task

### **I need to...**

#### **Understand the project**

→ Start with [`AI-QUICK-START.md`](./AI-QUICK-START.md)

#### **Write code**

→ Read [`AI-CODING-STANDARDS.md`](./AI-CODING-STANDARDS.md) first!

#### **Implement a feature**

1. Read [`AI-CODING-STANDARDS.md`](./AI-CODING-STANDARDS.md)
2. Find feature spec in [`fe-specs/`](./fe-specs/)
3. Check [`fe-specs/ROLE-PERMISSIONS-MATRIX.md`](./fe-specs/ROLE-PERMISSIONS-MATRIX.md)
4. Refer to [`AI-AGENT-OPERATIONS-GUIDE.md`](./AI-AGENT-OPERATIONS-GUIDE.md) for patterns

#### **Fix a datetime bug**

→ [`AI-CODING-STANDARDS.md`](./AI-CODING-STANDARDS.md) → Section: "Date & Time Handling"

#### **Add role-based access**

→ [`fe-specs/ROLE-PERMISSIONS-MATRIX.md`](./fe-specs/ROLE-PERMISSIONS-MATRIX.md)

#### **Test appointment booking**

→ [`ADMIN-APPOINTMENT-TESTING-CHECKLIST.md`](./ADMIN-APPOINTMENT-TESTING-CHECKLIST.md)

#### **Check implementation status**

→ [`Tien-Do-Hien-Tai/So-sanh-spec-code-base.md`](./Tien-Do-Hien-Tai/So-sanh-spec-code-base.md)

---

## 🔥 Most Important Rules

### **1. DateTime Handling**

**Always use ISO 8601 format**: `"2025-12-09T14:30:00"`

```typescript
// ✅ CORRECT
const datetime = format(date, "yyyy-MM-dd") + "T" + time + ":00";

// ❌ WRONG
const datetime = date + "T" + fullDatetimeString; // Causes duplication!
```

See: [`AI-CODING-STANDARDS.md`](./AI-CODING-STANDARDS.md) → "Date & Time Handling"

### **2. Role-Based Access**

**Always check permissions** before showing UI or allowing actions

```typescript
// ✅ CORRECT
{user?.role === "ADMIN" && <DeleteButton />}

// ❌ WRONG
<DeleteButton /> // Everyone can see it!
```

See: [`fe-specs/ROLE-PERMISSIONS-MATRIX.md`](./fe-specs/ROLE-PERMISSIONS-MATRIX.md)

### **3. Consistency**

**Follow existing patterns** - Don't invent new ways

```typescript
// ✅ CORRECT - Use existing pattern
const form = useForm({ resolver: zodResolver(schema) });

// ❌ WRONG - New pattern
const [formData, setFormData] = useState({});
```

See: [`AI-CODING-STANDARDS.md`](./AI-CODING-STANDARDS.md) → "Form Implementation Standards"

---

## 🎓 Learning Resources

### **For New AI Agents**

**Week 1:** Foundation

- Day 1: Read Quick Start
- Day 2-3: Study Coding Standards thoroughly
- Day 4-5: Read Operations Guide, explore codebase

**Week 2:** Implementation

- Study one feature spec per day
- Implement simple features (list pages, detail views)
- Refer to standards constantly

**Week 3+:** Advanced

- Complex forms with datetime handling
- Multi-step workflows
- Role-based features

### **For Human Developers**

If you're a human developer:

1. Read the AI documentation - it's well-organized!
2. The coding standards apply to you too
3. Specs in `fe-specs/` are requirements, not suggestions
4. Tests in testing checklists should pass

---

## 🔄 Document Update Policy

### **When to Update**

| Document                       | Update When                                   |
| ------------------------------ | --------------------------------------------- |
| `AI-CODING-STANDARDS.md`       | New pattern established, common mistake found |
| `AI-AGENT-OPERATIONS-GUIDE.md` | New workflow added, architecture changed      |
| `fe-specs/*.md`                | Requirements changed, API updated             |
| `ROLE-PERMISSIONS-MATRIX.md`   | New role added, permission changed            |

### **How to Update**

1. Update the document
2. Update "Last Updated" date
3. If breaking change, increment version number
4. Announce to team (human or AI)

---

## 📞 Getting Help

### **As an AI Agent**

1. **Search these docs**: Use Ctrl+F liberally
2. **Search the codebase**: `grep -r "pattern" app/`
3. **Check references**: Look at similar working features
4. **Ask with context**: Include error messages, code snippets

### **As a Human Developer**

1. **Read the AI docs**: They're actually good!
2. **Check specs**: Business requirements are in `fe-specs/`
3. **Ask another developer**: If docs are unclear

---

## 🗺️ Document Map

```
DOCS/
├── 📄 README.md (this file)
│
├── 🚀 AI Quick Start Guide
│   └── AI-QUICK-START.md
│
├── ⭐ AI Coding Standards (MANDATORY)
│   └── AI-CODING-STANDARDS.md
│
├── 📖 AI Operations Manual
│   └── AI-AGENT-OPERATIONS-GUIDE.md
│
├── 📋 Feature Specifications
│   └── fe-specs/
│       ├── ROLE-PERMISSIONS-MATRIX.md
│       ├── fe-spec-patient-service.md
│       ├── fe-spec-appointment-service.md
│       ├── fe-spec-billing-service.md
│       ├── fe-spec-hr-service.md
│       ├── fe-spec-medical-exam.md
│       └── fe-spec-reports-service.md
│
├── 🧪 Testing Resources
│   └── ADMIN-APPOINTMENT-TESTING-CHECKLIST.md
│
└── 📊 Progress Tracking
    └── Tien-Do-Hien-Tai/
        └── So-sanh-spec-code-base.md
```

---

## ✅ Checklist for New AI Agents

Before starting work:

- [ ] Read [`AI-QUICK-START.md`](./AI-QUICK-START.md)
- [ ] Study [`AI-CODING-STANDARDS.md`](./AI-CODING-STANDARDS.md) completely
- [ ] Skim [`AI-AGENT-OPERATIONS-GUIDE.md`](./AI-AGENT-OPERATIONS-GUIDE.md)
- [ ] Bookmark [`fe-specs/ROLE-PERMISSIONS-MATRIX.md`](./fe-specs/ROLE-PERMISSIONS-MATRIX.md)
- [ ] Explore the codebase structure
- [ ] Run `npm run dev` successfully

Before writing code:

- [ ] Read the relevant feature spec
- [ ] Check role permissions
- [ ] Find similar working implementation
- [ ] Review datetime handling patterns
- [ ] Know your imports (use `@/` aliases)

Before committing:

- [ ] No console errors
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No lint errors (`npm run lint`)
- [ ] Tested with relevant roles
- [ ] Follows coding standards

---

**Welcome! 🎉**  
**You're now ready to contribute effectively to this project.**

**Remember:** When in doubt, check the docs. When still in doubt, check working code. When really stuck, ask with context!

---

Last Updated: December 9, 2025
