# Code Generation Guide - Customer App

## Overview

Customer app sử dụng **Orval** để generate typed API client và React Query hooks từ OpenAPI spec của backend.

**Benefits**:

- ✅ **Type-safe 100%**: Types tự động đồng bộ với backend
- ✅ **Auto-sync**: Backend thay đổi API → chạy codegen → compile error ngay
- ✅ **React Query hooks**: `useCartControllerGetCart()`, `useOrderControllerCheckout()`
- ✅ **Giảm boilerplate**: Không cần viết manual API calls
- ✅ **Validation**: Zod schemas tự động

---

## Architecture

### Before (Manual Axios)

```
Feature Layer
├── data/
│   ├── adapter.interface.ts
│   ├── api/
│   │   └── menu.adapter.ts     ❌ Manual axios calls
│   └── factory.ts
```

**Problems**:

- Manual type definitions
- Response unwrapping by hand: `response.data.data`
- Backend changes → manual updates
- No compile-time safety

### After (Orval Generated)

```
Services Layer (Generated)
└── services/
    ├── axios.ts                 ✅ Custom mutator (unwraps responses)
    └── generated/               ✅ Auto-generated from OpenAPI
        ├── cart/
        │   └── cart.ts          ✅ cartControllerGetCart, useCartControllerGetCart
        ├── orders/
        │   └── orders.ts        ✅ orderControllerCheckout
        ├── payments/
        │   └── payments.ts      ✅ paymentControllerCreatePaymentIntent
        └── models/              ✅ TypeScript types

Feature Layer (Wrapper)
├── data/
│   ├── api/
│   │   └── menuApi.ts           ✅ Wraps generated functions
│   └── factory.ts               ✅ Exports adapter (mock/real)
```

**Benefits**:

- Types auto-generated from backend
- Response unwrapping in one place (`customInstance`)
- Backend changes → re-gen → TypeScript errors guide fixes
- 100% type safety

---

## Setup

### 1. OpenAPI Spec

Backend phải expose OpenAPI spec tại `/api-docs-json`:

```bash
# Backend (NestJS)
curl http://localhost:3000/api-docs-json > openapi-spec.json
```

### 2. Orval Config

File: `orval.config.ts`

```typescript
export default defineConfig({
  customerApi: {
    input: {
      target: "./openapi-spec.json", // Local spec file
    },
    output: {
      mode: "tags-split", // Organize by API tags
      target: "src/services/generated",
      schemas: "src/services/generated/models",
      client: "react-query", // Generate React Query hooks
      override: {
        mutator: {
          path: "src/services/axios.ts",
          name: "customInstance", // Custom response unwrapper
        },
        reactQuery: {
          version: 5,
        },
      },
    },
  },
});
```

### 3. Custom Mutator

File: `src/services/axios.ts`

```typescript
export const customInstance = async <T>(config: any): Promise<T> => {
  return api(config).then(({ data }) => {
    // Backend response: { success: true, data: {...} }
    // Unwrap to return only data part
    if (data && typeof data === "object" && "data" in data) {
      return data.data as T; // ✅ Auto-unwrap
    }
    return data as T;
  });
};
```

---

## Usage

### Commands

```bash
# Sync OpenAPI spec from backend (requires backend running)
pnpm run sync-spec

# Generate TypeScript client (from openapi-spec.json)
pnpm run orval

# Full codegen (sync + generate)
pnpm run codegen
```

### Development Workflow

#### When Backend API Changes

```bash
# 1. Backend running on localhost:3000
cd source/apps/api
pnpm dev

# 2. Pull new spec and regenerate
cd source/apps/web-customer
pnpm run codegen

# 3. TypeScript will show errors if types changed
pnpm type-check
```

**Example**: Backend renames field `customerName` → `customerFullName`

```typescript
// Before codegen
const order = await orderControllerCheckout({
  customerName: "John", // ✅ Compiles
});

// After codegen (backend changed to customerFullName)
const order = await orderControllerCheckout({
  customerName: "John", // ❌ TypeScript error: Property doesn't exist
  customerFullName: "John", // ✅ Fix required
});
```

---

## Generated Files Structure

```
src/services/generated/
├── cart/
│   └── cart.ts
│       - cartControllerGetCart()
│       - cartControllerAddToCart()
│       - useCartControllerGetCart()      # React Query hook
│       - useCartControllerAddToCart()    # Mutation hook
│
├── orders/
│   └── orders.ts
│       - orderControllerCheckout()
│       - orderControllerGetTableOrders()
│       - useOrderControllerCheckout()
│
├── payments/
│   └── payments.ts
│       - paymentControllerCreatePaymentIntent()
│       - paymentControllerGetPaymentStatus()
│
└── models/
    ├── index.ts                          # All types
    ├── cartResponseDto.ts
    ├── orderResponseDto.ts
    └── ... (100+ type files)
```

---

## Migration Strategy

### Phase 1: Generate & Setup ✅ DONE

- [x] Setup orval.config.ts
- [x] Create customInstance mutator
- [x] Generate initial types
- [x] Add codegen scripts

### Phase 2: Refactor Data Layer ✅ DONE

- [x] Menu: `menuApi` uses generated functions
- [x] Cart: `CartApiService` uses generated functions
- [x] Checkout: `CheckoutApiService` uses generated functions
- [x] Keep adapter pattern (wraps generated functions)

### Phase 3: Direct Hook Usage 🔜 FUTURE

Controllers có thể dùng hooks trực tiếp:

```typescript
// Current (via adapter)
const cart = await cartApi.getCart();

// Future (direct hook)
const { data: cart } = useCartControllerGetCart();
```

**Trade-offs**:

- **Pro**: Less boilerplate, React Query features (caching, refetch)
- **Con**: Tightly coupled to React Query, harder to test

**Decision**: Keep adapter pattern for now (easier testing, clear separation)

---

## Best Practices

### 1. Never Edit Generated Files

```typescript
// ❌ DON'T
// File: src/services/generated/cart/cart.ts
export const cartControllerGetCart = () => {
  // Custom logic here  ❌ Will be overwritten on next codegen!
};

// ✅ DO
// File: src/features/cart/data/cart.service.ts
import { cartControllerGetCart } from "@/services/generated/cart/cart";

export class CartApiService {
  async getCart() {
    const cart = await cartControllerGetCart();
    // Add custom logic here ✅
    return transformCart(cart);
  }
}
```

### 2. Wrap Generated Functions

**Why**: Add feature-specific logic, transform types, handle errors

```typescript
// src/features/menu/data/api/menuApi.ts
import { publicMenuControllerGetPublicMenu } from "@/services/generated/menu-public/menu-public";

export const menuApi = {
  async getPublicMenu() {
    const response = await publicMenuControllerGetPublicMenu();

    // Transform DTOs to domain models
    const items = response.categories.flatMap((cat) =>
      cat.items.map((item) => transformMenuItem(item, cat.name))
    );

    return { items, categories: response.categories.map((c) => c.name) };
  },
};
```

### 3. Commit openapi-spec.json

```bash
git add openapi-spec.json
git commit -m "chore: update OpenAPI spec"
```

**Why**: Team members can generate without backend running

### 4. Add to CI/CD

```json
{
  "scripts": {
    "prebuild": "pnpm run orval", // Auto-gen before build
    "build": "next build"
  }
}
```

---

## Troubleshooting

### Error: `Cannot find module '@/services/generated'`

**Fix**: Run codegen first

```bash
pnpm run orval
```

### Error: Backend API changed, getting 400/404

**Fix**: Regenerate types

```bash
pnpm run codegen
pnpm type-check  # Find breaking changes
```

### Error: `customInstance is not defined`

**Fix**: Check `src/services/axios.ts` exists and exports `customInstance`

### Generated types don't match backend

**Fix**: Ensure spec is up-to-date

```bash
# Backend must be running
pnpm run sync-spec
pnpm run orval
```

---

## Comparison: web-customer vs web-tenant

| Feature              | web-customer              | web-tenant                |
| -------------------- | ------------------------- | ------------------------- |
| **Orval**            | ✅ tags-split             | ✅ tags-split             |
| **React Query**      | ✅ v5 hooks               | ✅ v5 hooks               |
| **Mutator**          | `customInstance`          | `customInstance`          |
| **Auth**             | Cookie (session)          | JWT token (localStorage)  |
| **Generated folder** | `src/services/generated/` | `src/services/generated/` |
| **Adapter pattern**  | ✅ Kept                   | ✅ Kept                   |

**Key Difference**: Customer app uses session cookies, tenant app uses JWT tokens

---

## Future Enhancements

### 1. MSW Mocks from OpenAPI

```bash
pnpm add -D msw @mswjs/data
```

Generate MSW handlers from spec → test without backend

### 2. Zod Validation

```typescript
// orval.config.ts
override: {
  zod: {
    enabled: true,  // Generate Zod schemas
  }
}
```

Validate API responses at runtime

### 3. React Query DevTools

```typescript
// app/providers.tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<QueryClientProvider client={queryClient}>
  <ReactQueryDevtools /> {/* Debug queries */}
</QueryClientProvider>;
```

---

## Summary

✅ **Codegen hoàn tất cho web-customer**

**Architecture**:

- Generated layer: Type-safe API functions
- Adapter layer: Feature-specific wrappers
- Controller layer: Business logic

**Next Steps**:

1. Test all flows with real backend
2. Update remaining features (tables, orders tracking)
3. Consider direct hook usage in future

**Command to remember**:

```bash
pnpm run codegen  # Sync spec + generate types
```
