# Codegen Workflow Guide

## 📋 TL;DR

✅ **COMMIT generated code vào git** (KHÔNG gitignore)  
✅ **Run `pnpm codegen` khi backend API changes**  
✅ **`prebuild` script auto-regenerates** (safety net)

---

## 🎯 Best Practice: Commit Generated Code

### Why NOT Gitignore?

```bash
# ❌ BAD: Gitignore generated code
src/services/generated/  # ignored

# Problems:
- Build fails without backend running
- Non-deterministic builds (different devs get different types)
- CI/CD needs backend connection
- New developers can't build immediately
```

```bash
# ✅ GOOD: Commit generated code
src/services/generated/  # committed

# Benefits:
- Build works offline (no backend needed)
- Deterministic builds (same commit = same types)
- Fast CI/CD (no codegen step needed)
- New developers productive immediately
```

### Industry Standards

**Commit generated code** is standard practice:

- **GraphQL Codegen**: Commit generated types ✅
- **Prisma Client**: Commit `.prisma/client/` ✅  
- **Protobuf**: Commit `.pb.ts` files ✅
- **OpenAPI**: Commit generated clients ✅

**Similar to**: `package-lock.json`, `pnpm-lock.yaml` (lock files are committed)

---

## 🔄 Developer Workflow

### Scenario 1: Backend API Changed

**Backend dev announces**:
> "API updated: checkout endpoint now requires `customerFullName` instead of `customerName`"

**Frontend workflow**:

```bash
# 1. Pull latest backend spec
cd source/apps/web-customer
pnpm run codegen

# Output:
# ✓ Downloaded openapi-spec.json
# ✓ Generated 150 files
# ⚠ Some types changed

# 2. TypeScript shows errors immediately
pnpm type-check

# Error: src/features/checkout/hooks/useCheckoutController.ts:45:7
#   Property 'customerName' does not exist on type 'CheckoutDto'
#   Did you mean 'customerFullName'?

# 3. Fix code (TypeScript guides you)
// Before
const order = await orderControllerCheckout({
  customerName: form.name,  // ❌ Error
});

// After
const order = await orderControllerCheckout({
  customerFullName: form.name,  // ✅ Fixed
});

# 4. Commit both generated code + fixes
git add src/services/generated/
git add src/features/checkout/
git commit -m "refactor(checkout): update to customerFullName API"
```

### Scenario 2: Starting New Feature

```bash
# 1. Check if backend has new endpoints
pnpm run codegen  # Pull latest spec

# 2. Check generated files
ls src/services/generated/promotions/  # New folder!

# 3. Use in your feature
import { 
  promotionsControllerValidate 
} from '@/services/generated/promotions/promotions';

const promo = await promotionsControllerValidate(code);
```

### Scenario 3: Daily Development (No Backend Changes)

```bash
# Just code normally
pnpm dev  # Uses existing generated code ✅

# No need to run codegen if backend hasn't changed
```

---

## 🚀 Automated Workflows

### Local Development

```json
{
  "scripts": {
    "dev": "next dev -p 3001",           // No codegen (fast startup)
    "prebuild": "pnpm run orval",        // Auto-gen before build (safety net)
    "build": "next build",
    "codegen": "pnpm run sync-spec && pnpm run orval"  // Manual trigger
  }
}
```

**Why `prebuild` and not `predev`?**

```bash
# dev: Run 100x per day
pnpm dev  # Fast! No codegen needed

# build: Run rarely (before deploy)
pnpm build  # Ensures types are fresh
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
- name: Install dependencies
  run: pnpm install

- name: Build  # prebuild hook runs orval automatically
  run: pnpm build

# ✅ No separate codegen step needed!
# ✅ Uses committed generated code (fast)
# ✅ prebuild regenerates as safety check
```

### Pre-commit Hook (Optional)

```bash
# .husky/pre-commit
#!/bin/sh
# Check if openapi-spec.json changed
if git diff --cached --name-only | grep -q "openapi-spec.json"; then
  echo "⚠️ OpenAPI spec changed. Running codegen..."
  pnpm run orval
  git add src/services/generated/
fi
```

---

## 📦 What to Commit

### ✅ Commit These

```
✅ openapi-spec.json             # Backend API contract
✅ src/services/generated/       # Generated TypeScript code
✅ src/services/axios.ts         # Custom mutator
✅ orval.config.ts               # Codegen configuration
```

### ❌ Don't Commit

```
❌ .env                          # Secrets
❌ node_modules/                 # Dependencies
❌ .next/                        # Build artifacts
```

---

## 🔍 Git Workflow Tips

### Large Diffs from Generated Code

**Problem**: Generated code creates huge diffs

**Solution**: Separate commits

```bash
# Commit 1: Generated code only
git add src/services/generated/ openapi-spec.json
git commit -m "chore(codegen): update API types from backend v2.1"

# Commit 2: Your actual changes
git add src/features/
git commit -m "feat(checkout): add tip selection"
```

### Merge Conflicts in Generated Code

**Problem**: Two branches both regenerated code

**Solution**: Always regenerate after merge

```bash
git checkout main
git pull origin main

git checkout feature/my-branch
git merge main

# Conflicts in src/services/generated/
git checkout --theirs src/services/generated/  # Take main's version
pnpm run codegen  # Regenerate fresh

git add src/services/generated/
git commit -m "chore: resolve codegen conflicts"
```

### Reviewing PRs with Generated Code

**Tip**: GitHub "Hide whitespace" + Collapse files

```
✅ Review: src/features/checkout/  # Your logic
❌ Skip:   src/services/generated/ # Auto-generated (trust the tool)
✅ Review: openapi-spec.json       # API contract changes
```

---

## 🕐 When to Run Codegen

| Situation | Command | Why |
|-----------|---------|-----|
| **Backend API changed** | `pnpm run codegen` | Pull new types |
| **New feature needs new endpoint** | `pnpm run codegen` | Get new generated functions |
| **TypeScript errors after git pull** | `pnpm run codegen` | Sync with team's changes |
| **Before deployment** | `pnpm build` (prebuild auto-runs) | Ensure fresh types |
| **Daily coding (no API changes)** | ❌ Not needed | Use existing generated code |
| **CI/CD pipeline** | Automatic via `prebuild` | Safety check |

---

## 🎓 Training New Developers

### Onboarding Checklist

```bash
# 1. Clone repo
git clone <repo-url>
cd source/apps/web-customer

# 2. Install dependencies
pnpm install

# 3. Setup environment
cp .env.example .env

# 4. Start dev (works without backend!)
pnpm dev  # ✅ Uses committed generated code

# 5. (Optional) Regenerate types if backend available
pnpm run codegen  # Only if you have backend running
```

**Key Message**: "You can start coding immediately. Only run `pnpm codegen` when backend API changes."

---

## 🔧 Troubleshooting

### Q: Should I run codegen on every git pull?

**A**: No! Only if:
- `openapi-spec.json` changed (check git diff)
- TypeScript errors about missing types

### Q: I get "Cannot find module '@/services/generated'"

**A**: Generated code missing from git. Run:
```bash
pnpm run codegen
git add src/services/generated/
git commit -m "chore: add missing generated code"
```

### Q: My PR has 10,000 line diff from generated code

**A**: Normal! Reviewers will skip generated files. Just ensure:
- [ ] `openapi-spec.json` diff makes sense
- [ ] Your actual code (features/) is correct

### Q: Merge conflict in 50 generated files

**A**: Don't resolve manually. Regenerate:
```bash
git checkout --theirs src/services/generated/
pnpm run codegen
git add .
```

---

## 📊 Comparison: Gitignore vs Commit

| Aspect | Gitignore ❌ | Commit ✅ |
|--------|-------------|----------|
| **Build without backend** | No | Yes |
| **CI/CD speed** | Slow (needs codegen) | Fast |
| **New dev setup** | Complex | Simple |
| **Deterministic** | No | Yes |
| **Git diff size** | Small | Large |
| **Merge conflicts** | Fewer | More (but auto-resolve) |
| **Industry standard** | Rare | Common |

**Verdict**: Commit generated code ✅

---

## 🎯 Summary

### DO ✅

- ✅ Commit `src/services/generated/` to git
- ✅ Commit `openapi-spec.json` to git
- ✅ Run `pnpm codegen` when backend API changes
- ✅ Use `prebuild` script for safety
- ✅ Separate commits for generated vs feature code

### DON'T ❌

- ❌ Gitignore generated code
- ❌ Run codegen on every `pnpm dev`
- ❌ Edit generated files manually
- ❌ Manually resolve merge conflicts in generated code

### Remember

> **Generated code is source code** (like compiled Prisma Client or GraphQL types)  
> **Treat it like `package-lock.json`**: committed, auto-generated, rarely manually edited

---

## 🚦 Quick Decision Tree

```
Backend API changed?
├─ Yes → Run `pnpm codegen`
│         Commit generated code
│         Fix TypeScript errors
│
└─ No → Just code normally
        Use existing generated code
```

**When in doubt**: Run `pnpm codegen`. It's fast (<5s) and ensures types are fresh.
