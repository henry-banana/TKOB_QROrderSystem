# Kế hoạch Tài liệu — Unified Restaurant Ordering Platform

Tài liệu này tóm tắt **những gì nhóm cần viết** trong từng khu vực tài liệu **ngoài thư mục `01-product/`**.

Ký hiệu ưu tiên:
- **P0** – Bắt buộc nên có để đồ án “tròn chỉnh”.
- **P1** – Rất nên có (quy trình, chất lượng, bảo mật, UX).
- **P2** – Có thì đẹp, thiếu cũng không sao nếu hết thời gian.

---

## 1. 02-api (P0) — `OPENAPI.md`, `openapi.yaml`

### `OPENAPI.md` — Tổng quan & Quy ước API

Viết cho dev (người đọc là FE/BE):

- **1. Giới thiệu**
  - Giải thích backend được mô tả bằng **OpenAPI 3**.
  - Chỉ rõ file nguồn: `docs/api/openapi.yaml` là “single source of truth”.
- **2. Domain & Resource chính**
  - Mô tả ngắn các domain: `auth`, `tenants`, `menus`, `tables`, `orders`, `payments`.
  - Liệt kê 5–7 endpoint quan trọng (path + 1 câu mô tả).
- **3. Quy ước API**
  - Base URL, chiến lược version (ví dụ `/api/v1`).
  - Cách auth: Bearer JWT, public QR token.
  - Quy ước status code & format lỗi chung.
- **4. Cách dùng / sinh client**
  - Hướng dẫn FE/BE generate client hoặc validate spec.
  - Ví dụ lệnh CLI (nếu có).

### `openapi.yaml` — API Contract cho máy (machine-readable)

Dùng cho tool/generator:

- Định nghĩa **schema** cho các entity chính:
  - `Tenant`, `User`, `MenuCategory`, `MenuItem`, `Table`, `Order`, `OrderItem`, `PaymentIntent`, …
- Định nghĩa **paths** cho các luồng chính:
  - Auth: `/auth/signup`, `/auth/login`
  - Menu: `/menus/categories`, `/menus/items`
  - Bàn & QR: `/tables`, `/tables/{id}/qrcode`
  - Order: `/orders`, `/orders/{id}/status`
  - Payment: `/payments/intent`
- Cố gắng có ít nhất 1 ví dụ request/response cho mỗi endpoint quan trọng.

---

## 2. 03-architecture (P0) — `ARCHITECTURE.md`, `ER_DIAGRAM.md`

### `ARCHITECTURE.md` — Kiến trúc hệ thống

Đối tượng: giảng viên, senior dev.

- **1. Tổng quan**
  - Mô tả ngắn các layer: Client, API Gateway, Services, Data, External, Monitoring.
  - Nhúng 1 sơ đồ (Mermaid hoặc hình) tái sử dụng từ `system-architecture.md`.
- **2. Component View**
  - Với mỗi service (Auth, Tenant, Menu, Order, Payment, QR, Notification):
    - Trách nhiệm chính.
    - Input/Output: gọi API nào, publish event gì.
- **3. Deployment View**
  - Liệt kê môi trường: local, staging, production.
  - Mô tả cách deploy (Docker, AWS ECS/Lambda, v.v.) ở mức high-level.
- **4. Cross-cutting Concerns**
  - Auth & multi-tenancy (link ADR 0001).
  - Logging & monitoring.
  - Error handling, idempotency cho payment/webhook.
- **5. Tài liệu liên quan**
  - Link sang `ER_DIAGRAM.md`, order state machine, QR flow, ADRs.

### `ER_DIAGRAM.md` — Mô hình dữ liệu (ERD)

- **1. Tổng quan**
  - Giải thích thiết kế multi-tenant: mọi bảng quan trọng đều có `tenant_id`.
- **2. Bảng chính**
  - `tenants`, `users`, `tables`, `menu_categories`, `menu_items`, `orders`, `order_items`, `payments`, …
- **3. Quan hệ**
  - 1 tenant → nhiều tables / menu_items / orders.
  - 1 order → nhiều order_items.
- **4. Sơ đồ**
  - Nhúng ER bằng Mermaid hoặc hình từ tool (draw.io, dbdiagram, …).
- **5. Ràng buộc & Index**
  - PK/FK, các index quan trọng (ví dụ `(tenant_id, created_at)` trên `orders`).

---

## 3. 04-dev (P0) — `SETUP.md`, `CONTRIBUTING.md`

### `SETUP.md` — Hướng dẫn chạy dev local

- **1. Prerequisites**
  - Phiên bản Node.js, package manager (npm/pnpm/yarn), Docker, Postgres, Redis, v.v.
- **2. Clone & cài đặt**
  - `git clone`, `npm install` / `pnpm install`.
- **3. Environment variables**
  - Copy `.env.example` → `.env`.
  - Liệt kê các biến bắt buộc: DB, Redis, Stripe, S3, email, …
- **4. Chạy môi trường dev**
  - Lệnh chạy backend, frontend.
  - Lệnh chạy migration & seed data.
- **5. Troubleshooting**
  - Tổng hợp một số lỗi thường gặp (port bận, DB không lên, thiếu Docker, …).

### `CONTRIBUTING.md` — Quy ước đóng góp code

- **1. Chiến lược branch**
  - Ví dụ: `main`, `develop`, `feature/*`.
- **2. Quy ước commit**
  - Ví dụ: Conventional Commits (`feat:`, `fix:`, `docs:`, …).
- **3. Code style**
  - Dùng ESLint/Prettier thế nào, quy ước cấu trúc thư mục.
- **4. Quy trình Pull Request**
  - Cách mở PR, yêu cầu review, yêu cầu test & check CI.
- **5. Quy trình Issue**
  - Tạo issue, gán label, link issue ↔ PR.
- **6. Definition of Done**
  - Điều kiện “xong” của 1 task/story (code, test, doc, review, …).

---

## 4. 05-infra (P1) — `CI.md`, `DEPLOYMENT_RUNBOOK.md`

### `CI.md` — Continuous Integration

- **1. Tổng quan**
  - Hệ thống CI đang dùng (GitHub Actions/GitLab/etc.).
- **2. Các bước pipeline**
  - Lint, test, build, openapi validation, security scan, …
- **3. Required checks**
  - Những job nào phải pass trước khi merge vào `develop/main`.
- **4. Debug khi CI fail**
  - Xem log ở đâu, các lỗi thường gặp.

### `DEPLOYMENT_RUNBOOK.md` — Hướng dẫn deploy

- **1. Environments**
  - Local, staging, production + mục đích từng môi trường.
- **2. Flow deploy**
  - Từ PR → staging → production đi qua những bước nào.
- **3. Các bước chi tiết**
  - Build image, push, chạy migration, health check.
- **4. Rollback**
  - Cách rollback khi deploy lỗi.
- **5. Pre/Post-deploy checklist**
  - Cần check gì trước & sau khi deploy.

---

## 5. 06-qa (P1) — `TEST_STRATEGY.md`, `ACCEPTANCE_TESTS.md`

### `TEST_STRATEGY.md` — Chiến lược kiểm thử

- **1. Mục tiêu chất lượng**
  - Mức tin cậy mong muốn, rủi ro cần giảm thiểu.
- **2. Loại test**
  - Unit, integration, E2E, manual UAT, non-functional (performance, security, accessibility).
- **3. Công cụ**
  - Jest/Vitest, Playwright/Cypress, Postman, …
- **4. Coverage**
  - Target coverage cho backend/frontend (ví dụ: BE ≥ 80%, FE ≥ 70%).
- **5. Môi trường test**
  - Test nào chạy local, test nào chạy trong CI, test nào chạy ở staging.
- **6. Non-functional tests**
  - Định hướng test performance, security, accessibility (dù có thể chưa làm đủ trong đồ án).

### `ACCEPTANCE_TESTS.md` — Mapping kiểm thử chấp nhận

- **1. Bảng mapping**
  - FR/Scenario ID ↔ Test case ID ↔ Tool ↔ Status.
- **2. Link**
  - Đường dẫn tới script automated test (nếu có).

---

## 6. 08-security (P1) — `THREAT_MODEL.md`

### `THREAT_MODEL.md` — Mô hình mối đe dọa (Threat Model)

- **1. Tài sản (Assets)**
  - Dữ liệu tenant, orders, payment, QR tokens, JWTs, …
- **2. Mối đe dọa (Threats)**
  - Ví dụ: giả mạo token, lộ data giữa các tenant, XSS, CSRF, brute-force login, …
- **3. Biện pháp (Mitigations)**
  - HMAC-signed QR, RLS, HTTPS, rate limiting, JWT expiry ngắn, Stripe Elements, …
- **4. Rủi ro còn lại (Residual risks)**
  - Những rủi ro chưa xử lý hết trong MVP.

---

## 7. 09-ux (P1/P2) — `PERSONAS.md`, `USER_JOURNEYS.md`, `WIREFRAMES.md`, `ACCESSIBILITY.md`

### `PERSONAS.md`

- Định nghĩa 3–4 persona:
  - Tenant Admin, Kitchen Staff, Server/Waiter, Customer.
- Với mỗi persona:
  - Mục tiêu, nỗi đau (pain points), bối cảnh sử dụng, kỹ năng công nghệ.

### `USER_JOURNEYS.md`

- 1–2 journey quan trọng cho mỗi persona:
  - Tenant: signup → setup menu → generate QR.
  - Customer: scan QR → chọn món → thanh toán → theo dõi trạng thái.
  - Staff: nhận order → chuẩn bị → serve → complete.

### `WIREFRAMES.md`

- Nhúng hoặc link Figma/Axure.
- Mô tả ngắn các màn hình chính:
  - Login, Admin Dashboard, Menu Management, KDS, Customer Menu, …  

### `ACCESSIBILITY.md`

- Nguyên tắc a11y:
  - Độ tương phản, hỗ trợ keyboard nav, ARIA label, form label, focus state, …
- Cách áp dụng trong project:
  - Ví dụ: dùng semantic HTML, tránh chỉ dùng màu để phân biệt trạng thái, v.v.

---

## 8. 10-user (P1) — `ADMIN_GUIDE.md`, `CUSTOMER_FAQ.md`

### `ADMIN_GUIDE.md` — Hướng dẫn cho Admin

- **1. Bắt đầu**
  - Signup, verify email, login.
- **2. Thiết lập nhà hàng**
  - Onboarding wizard, thông tin nhà hàng, giờ mở cửa.
- **3. Quản lý menu**
  - Tạo/sửa/xoá categories, items, modifiers, publish/unpublish.
- **4. Bàn & QR**
  - Tạo bàn, generate QR, download/print, regenerate khi cần.
- **5. Orders & KDS**
  - Xem order, lọc theo trạng thái, chuyển trạng thái.
- **6. Analytics**
  - Đọc báo cáo cơ bản (orders/day, AOV, conversion).

### `CUSTOMER_FAQ.md` — Câu hỏi thường gặp cho khách

- Một số câu có thể có:
  - Tôi có cần cài app không?
  - Nếu QR bị mờ/hỏng thì sao?
  - Thanh toán online có an toàn không?
  - Tôi muốn sửa/hủy order thì làm thế nào?
  - Tôi có thể lấy hóa đơn/chi tiết order ở đâu?

---

## 9. 11-analytics (P1) — `EVENT_SCHEMA.md`

### `EVENT_SCHEMA.md` — Schema sự kiện analytics

- **1. Giới thiệu**
  - Tại sao cần tracking events (để tính KPI: conversion, AOV, time-to-serve, …).
- **2. Danh sách event**
  - `qr_scanned`, `menu_viewed`, `item_added_to_cart`,  
    `order_submitted`, `payment_success`, `payment_failed`, `order_status_changed`, …
- **3. Định nghĩa từng event**
  - Các thuộc tính bắt buộc: `tenant_id`, `user_id` (nếu có), `order_id`, `timestamp`, `device_type`, …
- **4. Mapping sang KPI**
  - QR→Order conversion dùng event nào.
  - AOV dùng event nào.
  - Time-to-Serve dùng event nào (order_created, order_ready, order_completed).

---

## 10. process (P1) — `SPRINTS.md`, `WORKFLOW.md`

### `SPRINTS.md` — Cách team chạy sprint

- **1. Nhịp sprint**
  - Độ dài (vd: 2 tuần), hôm nào planning/review/retro.
- **2. Vai trò**
  - Product Owner, Tech Lead, Dev, QA, …
- **3. Ceremonies**
  - Mô tả cách tổ chức: Planning, Daily, Review, Retro.
- **4. Definition of Ready / Definition of Done**
  - Điều kiện để story được đưa vào sprint (DoR).
  - Điều kiện để story được coi là xong (DoD).

### `WORKFLOW.md` — Quy trình làm việc

- **1. Từ idea → issue**
  - Cách thêm việc mới vào backlog (gặp PO, tạo issue, ưu tiên…).
- **2. Từ issue → PR**
  - Quy ước branch, implement, tự test local.
- **3. Từ PR → production**
  - Review, check CI, merge strategy, đánh tag, release.
- **4. Liên kết**
  - Link tới `CONTRIBUTING.md`, `CI.md`, `DEPLOYMENT_RUNBOOK.md`.

---

Bạn có thể dùng file này như một **checklist**: mỗi khi hoàn thành 1 file tài liệu, tick vào cho cả nhóm dễ theo dõi.
