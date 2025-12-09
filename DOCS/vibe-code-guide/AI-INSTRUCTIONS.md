# Instructions for AI Agents Working on HMS_FE

## 🎯 Before You Do ANYTHING

**Read these documents in order:**

1. **`DOCS/README.md`** - Documentation index (2 min)
2. **`DOCS/AI-QUICK-START.md`** - Fast onboarding (5 min)
3. **`DOCS/AI-CODING-STANDARDS.md`** ⭐ **MANDATORY** (15 min)

## ⚡ Quick Rules

### **DateTime Handling (MOST COMMON ERROR)**

```typescript
// ✅ CORRECT: Assemble from date + time
const datetime = format(dateObject, "yyyy-MM-dd") + "T" + timeString + ":00";
// Result: "2025-12-09T14:30:00" ✅

// ❌ WRONG: Double concatenation
const datetime = date + "T" + fullDatetimeString;
// Result: "2025-12-09T2025-12-09T14:30:00" ❌
```

**TimeSlotPicker returns**: `"14:30"` (just time, NOT full datetime)  
**Form date field**: `Date` object  
**API expects**: `"2025-12-09T14:30:00"` (ISO 8601)

### **Role Checks**

```typescript
// ✅ Use optional chaining
{user?.role === "ADMIN" && <Button />}

// ❌ Wrong
{user.role === "ADMIN" && <Button />}
```

### **Forms**

```typescript
// ✅ Use react-hook-form + Zod
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});
```

### **Imports**

```typescript
// ✅ Use @ alias
import { Button } from "@/components/ui/button";

// ❌ Relative paths
import { Button } from "../../../components/ui/button";
```

## 📚 Key Documents

| Need                 | Read                                       |
| -------------------- | ------------------------------------------ |
| Coding patterns      | `DOCS/AI-CODING-STANDARDS.md`              |
| Feature requirements | `DOCS/fe-specs/[feature].md`               |
| Permissions          | `DOCS/fe-specs/ROLE-PERMISSIONS-MATRIX.md` |
| Project structure    | `DOCS/AI-AGENT-OPERATIONS-GUIDE.md`        |

## ✅ Checklist Before Committing

- [ ] Read `AI-CODING-STANDARDS.md` completely
- [ ] No datetime format errors
- [ ] Role checks use `user?.role`
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Follows existing patterns

## 🚫 Don't

- ❌ Invent new patterns
- ❌ Skip reading coding standards
- ❌ Use `any` type without comment
- ❌ Hardcode error messages
- ❌ Forget role-based access control

## 💡 When Stuck

1. Search existing code: `grep -r "pattern" app/`
2. Check coding standards for pattern
3. Find similar working feature
4. Read the spec: `DOCS/fe-specs/*.md`

---

**Critical Path:**  
`DOCS/README.md` → `AI-QUICK-START.md` → `AI-CODING-STANDARDS.md` → Start coding

**Remember:** Consistency > Cleverness
