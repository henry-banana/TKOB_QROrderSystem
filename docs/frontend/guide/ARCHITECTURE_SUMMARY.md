# ARCHITECTURE SUMMARY (Phiên Bản Rút Gọn)

> Mục tiêu: Cho dev mới cái nhìn nhanh về kiến trúc frontend mà không phải đọc toàn bộ tài liệu dài. Nếu cần chi tiết, chuyển sang `../ARCHITECTURE.md`.

## 1. Tổng Quan
- Monorepo pnpm: `source/apps/web-tenant` (admin/staff) & `source/apps/web-customer` (khách hàng).
- Dùng Next.js 15 App Router + React 19 + TypeScript + TailwindCSS.
- Nguyên tắc: **Page mỏng**, logic nghiệp vụ nằm trong `features/`, tái sử dụng trong `shared/`, hạ tầng trong `lib/`.
- Server Components mặc định; Client Components khi cần interactivity, context, hooks.

## 2. Layering Nhanh
| Layer | Mục tiêu | Không được |
|-------|----------|-----------|
| app/ (presentation) | Routing, layout, wrapper | Chứa business logic |
| features/ (domain) | Nghiệp vụ + UI đặc thù | Import từ app/ |
| shared/ (generic) | UI atoms, hooks chung | Logic đặc thù nghiệp vụ |
| lib/ (infrastructure) | API client, helpers hệ thống | Import từ features/app |

## 3. Cấu Trúc Feature Chuẩn
```
features/<feature>/
  components/  # UI chuyên biệt
  hooks/       # Custom hooks
  services/    # API server/client tách riêng
  types/       # Interfaces / DTO nội bộ
  utils/       # Pure helpers
  index.ts     # Barrel exports (public surface)
```

## 4. Routing & App Router Essentials
| Thành phần | Vai trò |
|------------|---------|
| `layout.tsx` | Root HTML + wrapper providers |
| `page.tsx` | Trang chính segment (mỏng) |
| `loading.tsx` | Streaming loading UI |
| `error.tsx` | Error boundary cho segment |
| `middleware.ts` | Auth/RBAC, rewrites |
| Route Group `(auth)/` | Tổ chức code, không đổi URL |
| Dynamic `[id]` | Tham số trên URL |

Server fetch dữ liệu ổn định, client dùng React Query cho tương tác và cache.

## 5. RBAC (Admin Portal)
| Role | Quyền chính |
|------|-------------|
| `tenant-admin` | Full quản lý |
| `manager` | Quản lý đa số, trừ setting cấp cao |
| `kitchen` | KDS / bếp |
| `server` | Bàn / order lấy món |

Áp dụng qua `RoleGuard` hoặc middleware kiểm tra cookie/token.

## 6. QR Flow (Khách Hàng)
1. Admin tạo QR → URL dạng `https://.../s/<tenantSlug>/<token>`.
2. Khách scan → route `app/s/[tenantSlug]/[token]/page.tsx`.
3. Server component gọi backend validate token.
4. SessionContext lưu `tenantId`, `tableId` (localStorage + React state).
5. TenantProvider/TableProvider tải chi tiết quán & bàn.
6. Khách vào menu, đặt món, checkout.

## 7. Service Pattern
| File | Dùng khi |
|------|----------|
| `*.server.ts` | SSR / SEO / ít JS bundle |
| `*.client.ts` | Tương tác realtime, cần token, mutation |

Server: native `fetch` + `process.env.API_URL`.  Client: Axios + interceptors + `NEXT_PUBLIC_API_URL`.

## 8. State Management
| Loại | Công cụ | Ví dụ |
|------|---------|-------|
| Server state | React Query | Menu, orders, analytics |
| Client ephemeral | Zustand | Cart, UI toggles |
| Context | React Context | Auth, Session (QR), Tenant, Table |

Quy tắc: React Query cho dữ liệu từ API; Zustand cho biến động cục bộ và persistent nhẹ (giỏ hàng).

## 9. Quy Tắc Import
- Dùng path alias `@/`.
- Import feature khác qua barrel (`import { useCart } from '@/features/cart';`).
- Không deep import sang folder con nội bộ feature khác.
- Shared không import lại vào features.

## 10. Naming Nhanh
| Loại | Quy chuẩn |
|------|-----------|
| Component | PascalCase (`MenuList.tsx`) |
| Hook | camelCase + prefix `use` (`useMenu.ts`) |
| Service | camelCase + suffix Service (`menuService.ts`) |
| Types file | kebab-case `.types.ts` |
| Store | camelCase + Store (`cartStore.ts`) |
| Utils | camelCase (`formatCurrency.ts`) |

## 11. Performance Checklist
- Mặc định Server Component để giảm bundle.
- Dynamic import cho chart/editor nặng.
- `no-store` cho data luôn cập nhật; `revalidate` cho data ổn định.
- React Query `staleTime` hợp lý giảm refetch.
- Tách component lớn > 200 dòng thành các phần nhỏ.

## 12. Testing Hướng Dẫn Nhanh
| Ưu tiên test | Lý do |
|--------------|-------|
| Pure utils | Ổn định, dễ regression |
| Hooks data quan trọng | Logic fetch/cache/phản ứng lỗi |
| RBAC guard | Đảm bảo bảo vệ route |
| UI phức tạp | Nếu nhiều nhánh điều kiện |

## 13. Lỗi Thường Gặp & Fix
| Vấn đề | Nguyên nhân | Fix |
|--------|-------------|-----|
| `window is not defined` | Browser API trong Server Component | Thêm `'use client'` hoặc tách logic |
| 401 không redirect | Thiếu interceptor response | Kiểm tra `lib/api/interceptors.ts` |
| Circular import features | Feature import trực tiếp nhau | Dùng barrel + chuyển types vào `@packages/dto` |
| Bundle lớn | Quá nhiều client components | Chuyển sang server, dynamic import |

## 14. Khi Thêm Feature Mới
1. Lập folder & `index.ts`.
2. Viết `types` trước.
3. Chia service server/client nếu cần SEO + mutation.
4. Tạo hooks cho fetch + mutation.
5. Tạo UI components nhỏ.
6. Thêm page wrapper vào `app/.../page.tsx`.
7. Áp dụng RBAC nếu admin.
8. Thêm navigation.
9. Test tối thiểu 1 logic quan trọng.

## 15. Tài Liệu Liên Quan
- Chi tiết đầy đủ: `../ARCHITECTURE.md`
- Onboarding: `./ONBOARDING_CHECKLIST.md`
- App Router: `./NEXTJS_15_APP_ROUTER_GUIDE.md`
- Patterns: `./PATTERNS_AND_CONVENTIONS.md`
- Feature ví dụ: `./FEATURE_IMPLEMENTATION_GUIDE.md`
- Mục lục guide: `./README.md`

## 16. TL;DR Một Câu
"Page mỏng, domain vào feature, chia server/client service đúng chỗ, dùng React Query + Zustand, tránh import chéo sâu, ưu tiên Server Components để gọn nhẹ."

---
Last Updated: 2025-11-30
