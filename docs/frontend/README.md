# Customer Web App (Frontend)

Frontend Next.js cho ứng dụng khách hàng quét QR, đặt món và thanh toán.

## 1. Giới thiệu
Mục tiêu: hiển thị menu theo tenant (quán), cho phép khách thêm vào giỏ, checkout, theo dõi trạng thái đơn hàng.

## 2. Quick Start
```bash
pnpm --filter @app/web-customer dev
```
Truy cập: http://localhost:3000

## 3. Tech Stack
- Next.js / React (App Router)
- TailwindCSS (utility-first styling)
- TanStack Query (fetch + cache dữ liệu server)
- Zustand (hoặc Context API) (global client state: giỏ hàng, UI flags)

## 4. Cấu trúc Thư mục (đề xuất)

```
client/
└─ src/
    ├─ app/
    │  ├─ layout.tsx
    │  ├─ page.tsx
    │  └─ menu/
    │     └─ [tenantId]/
    │        └─ page.tsx
    ├─ components/
    │  ├─ ui/
    │  │  ├─ Button.tsx
    │  │  ├─ Input.tsx
    │  │  ├─ Modal.tsx
    │  │  └─ Card.tsx
    │  └─ features/
    │     ├─ menu/
    │     │  └─ MenuList.tsx
    │     ├─ cart/
    │     │  └─ CartSidebar.tsx
    │     └─ checkout/
    │        └─ CheckoutForm.tsx
    ├─ hooks/
    │  ├─ useCartStore.ts
    │  ├─ useMenu.ts
    │  └─ useOrderStatus.ts
    ├─ lib/
    │  ├─ api.ts
    │  └─ utils.ts
    └─ styles/
        └─ globals.css
```

### Giải thích nhanh
- app/: Routing Next.js. Mỗi page là entry UI (SSR/SSG/CSR linh hoạt). Ví dụ: `app/menu/[tenantId]/page.tsx` lấy menu theo quán.
- components/ui/: Dumb/presentational components. Không chứa logic nghiệp vụ, chỉ nhận props và render.
- components/features/ (hoặc tách riêng thành `features/`): Smart components gắn logic của một domain (menu, cart, checkout). Có thể kết hợp hooks + query.
- hooks/: Custom hooks tái sử dụng (truy vấn, state, side-effects).
- lib/api.ts: Định nghĩa hàm gọi API + wrapper TanStack Query (ví dụ `getMenuByTenant`, `useMenuQuery`).
- lib/utils.ts: Format tiền, chuẩn hóa thời gian, helper chung.
- styles/: File CSS/Tailwind entry.

## 5. Quy ước Component
- Dumb (ui): Tên PascalCase, không side-effect, không gọi API.
- Smart (features): Có thể dùng TanStack Query, Zustand, tách nhỏ UI con nếu cần.
- Tránh logic bất biến lặp lại: đưa vào hooks (ví dụ: mapping response, derive state).

## 6. TanStack Query
- Khóa (query key) chuẩn: `['menu', tenantId]`, `['order', orderId]`.
- Dùng mutation cho hành động: tạo order, update status.
- Prefetch trong server component nếu cần SEO.

## 7. Zustand (giỏ hàng)
- Store tối giản: items[], addItem, removeItem, clearCart, total.
- Không lưu dữ liệu nặng (chỉ id, qty, price).

## 8. Utils (ví dụ)
```ts
// lib/utils.ts
export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
```

## 9. Naming / Import
- Tuyệt đối import tương đối từ `@/` alias (nếu config): `import MenuList from '@/components/features/menu/MenuList'`.
- Không để logic API trong component; dùng hook hoặc hàm ở `lib/api.ts`.

## 10. Mở rộng
Thêm feature mới:
1. Tạo folder trong `components/features/<feature>/`.
2. Tạo hook chuyên biệt (nếu cần) trong `hooks/`.
3. Định nghĩa query/mutation trong `lib/api.ts`.
4. Viết test (nếu áp dụng) cho utils và hooks quan trọng.

Ngắn gọn, ưu tiên tách biệt: UI (trình bày) / Feature (nghiệp vụ) / Data (query) / State (store) / Helpers (utils).