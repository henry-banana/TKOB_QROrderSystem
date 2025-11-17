# Project Kickoff Summary — Unified Restaurant Ordering Platform

## 1. 🚀 Tầm nhìn & Mục tiêu (Vision & OKRs)

### 1.1 Dự án này là gì?

Đây là một nền tảng **multi-tenant SaaS** cho nhà hàng, cho phép:

- Mỗi nhà hàng (tenant) tạo **QR cho từng bàn**
- Khách quét QR để mở **menu trên web**, chọn món, tuỳ biến, đặt món và (tuỳ chọn) thanh toán online
- Nhân viên/kitchen dùng **dashboard/KDS** để xem đơn, cập nhật trạng thái
- Chủ nhà hàng xem **analytics** cơ bản (orders, conversion, AOV)

> Cách hiểu nhanh: **Scan QR trên bàn → mở menu trên điện thoại → order → bếp nhận đơn → món được chuẩn bị & phục vụ → hệ thống log lại để báo cáo & KPI.**

---

### 1.2 Vấn đề cốt lõi

- Nhà hàng nhỏ/lẻ **thiếu giải pháp đơn giản và rẻ** để:
  - Cho phép khách **order tại bàn** qua điện thoại
  - Giảm thời gian chờ gọi nhân viên
  - Hạn chế nhầm lẫn đơn & tăng tốc quay vòng bàn
- Công cụ hiện tại (giấy bút, POS cũ, tool rời rạc) không cung cấp trải nghiệm **QR ordering liền mạch**.

---

### 1.3 Mục tiêu kinh doanh chính (KPIs / Metrics)

Các chỉ số chính:

- **Activation / Onboarding Completion**
  - ≥ **70% tenants** hoàn tất onboarding trong vòng 7 ngày sau signup
- **Customer Conversion (QR → Order)**
  - ≥ **10%** số lượt scan QR dẫn đến order hoàn tất
- **Average Order Value (AOV)**
  - Theo dõi AOV của từng tenant (target do business quyết định)
- **Time to Serve**
  - **Median** thời gian từ `order.created` → `order.ready` < **20 phút**
- **System Health / Errors**
  - 5xx < **1/1000 requests**, tỉ lệ failed payments được monitor
- **OKRs cấp cao:**
  - KR1: 100 tenants tham gia pilot
  - KR2: 10% QR→order conversion
  - KR3: Median time-to-serve < 20 phút

---

## 2. 🎯 Phạm vi Sản phẩm (MVP Scope)

### 2.1 MVP bao gồm những gì?

**In-scope cho MVP:**

1. **Tenant Signup & Onboarding**
   - Đăng ký, xác thực email, wizard thiết lập thông tin nhà hàng, giờ mở cửa…

2. **Menu Management**
   - Tạo/sửa/xoá **categories**, **menu items**, modifiers, giá, trạng thái available/unavailable.

3. **Table & QR Management**
   - Tạo bàn (name, capacity, location).
   - Generate QR (PNG/SVG) với **HMAC-signed token**, lưu S3.

4. **Customer Ordering (Core Flow)**
   - Customer scan QR → load menu → add to cart → checkout.
   - Cart persistence trong ~30 phút.

5. **Thanh toán cơ bản**
   - Payment qua **Stripe** (card) hoặc **Bill-to-Table** (trả sau).

6. **Order Processing & KDS**
   - Staff/Kitchen xem danh sách đơn mới.
   - Update trạng thái order: `Received → Preparing → Ready → Completed`.

7. **Analytics cơ bản**
   - Orders/day, conversion từ QR scan → order, AOV.

8. **Mobile-first**
   - Trải nghiệm khách hàng tối ưu trên **mobile browser** (Chrome, Safari…).

---

### 2.2 Out-of-scope (không nằm trong MVP)

- Advanced **promotions/loyalty** (điểm thưởng, voucher phức tạp).
- **Multi-location analytics** (multi-branch, multi-region).
- **Offline mode** (kiosk, chạy khi mất mạng).
- Các báo cáo nâng cao, pricing/billing phức tạp, tích hợp POS sâu (cho phase sau).

**Acceptance boundary cho MVP:**

- Ordering trên mobile phải chạy tốt trên browser hiện đại.
- Admin dashboard dùng **desktop web** ổn định.

---

## 3. 🧑‍💻 Các Tính năng Chính (Epics & User Stories)

Dưới đây là **5 epics quan trọng nhất** để nắm hệ thống:

### 3.1 EPIC-01 — Tenant Onboarding

**Mô tả:** signup, tenant profile, onboarding wizard.

**User Stories tiêu biểu:**

- **FR-1-001: Tenant signup & onboarding cơ bản**  
  As a restaurant owner, tôi signup bằng email/password, tạo restaurant profile, set timezone & opening hours.

- **FR-1-003: Onboarding Wizard**  
  4 bước: Business Info → Operating Hours → Payment Setup (có thể skip) → Review; lưu draft và tiếp tục sau.

---

### 3.2 EPIC-02 — Menu & Catalog Management

**Mô tả:** quản lý menu (categories, items, modifiers, publishing).

**User Stories tiêu biểu:**

- **FR-2-001: Admin tạo categories & menu items**  
  Tạo item với name, price, category, image → xuất hiện trong menu tenant.

- **FR-2-004: Modifiers**  
  Thêm modifiers group (Size, Extras) để khách chọn khi order; tính lại giá theo option.

---

### 3.3 EPIC-03 — Table Management & QR Generation

**Mô tả:** quản lý bàn, generate/regenerate QR, token security.

**User Stories tiêu biểu:**

- **FR-3-001: Tạo bàn & generate QR**  
  Admin tạo bàn “Table 5” (capacity, location) → hệ thống sinh token, generate QR PNG/SVG + public URL.

- **FR-3-003: Download/Print QR**  
  Admin download PDF với QR từng bàn để in; có label table number, hướng dẫn cho khách.

---

### 3.4 EPIC-04 — Customer Ordering & Payments

**Mô tả:** QR scan → menu → cart → checkout → payment.

**User Stories tiêu biểu:**

- **FR-4-001: Scan QR & place order**  
  Customer scan QR → thấy menu của đúng tenant & bàn;  
  Add items, chọn modifiers, checkout;  
  Order được tạo với status `Received`, staff được notify.

- **FR-5-001 / FR-5-002: Card payment (Stripe)**  
  Payment Intent via Stripe, UI nhập card details, xử lý thành công/thất bại, update order status `Paid` hoặc cho phép retry.

---

### 3.5 EPIC-05 — Order Processing & KDS

**Mô tả:** Staff/Kitchen xử lý đơn, KDS, notifications.

**User Stories tiêu biểu:**

- **FR-6-001: Staff view & update order states**  
  Staff thấy orders mới (sorted by created time), chuyển trạng thái: `Received → Preparing → Ready → Completed`.

- **FR-6-002 / FR-6-003: Notifications & real-time**  
  New order → badge/sound trên dashboard;  
  Khách nhìn thấy status cập nhật real-time (WebSocket).

---

## 4. 🏗️ Kiến trúc Hệ thống (System Architecture)

### 4.1 High-level view

**Các lớp chính:**

1. **Client Layer (Next.js / React)**  
   - Customer Web App (QR ordering, mobile-first)  
   - Admin Dashboard (menu, tables, analytics)  
   - Staff/KDS App (kitchen/servers, tablets)

2. **Edge / CDN**  
   - CloudFront/CDN cache static assets, QR images.

3. **API Gateway**  
   - Auth, rate limiting, routing đến các services (NestJS).

4. **Application Layer (Services)**  
   - **AuthSvc** — JWT, sessions  
   - **TenantSvc** — tenant management  
   - **MenuSvc** — CRUD menu, modifiers, publishing  
   - **OrderSvc** — order lifecycle, state machine  
   - **PaymentSvc** — Stripe integration  
   - **QRSvc** — generate, validate HMAC token + QR  
   - **NotifSvc** — WebSocket, email, SMS notification

5. **Data Layer**  
   - **PostgreSQL** — tenants, users, tables, menus, orders  
   - **Redis** — sessions, cache, rate limit, pub/sub orders  
   - **S3** — images, QR PNGs/PDFs

6. **External Services**  
   - Stripe, SendGrid/SES, Twilio (SMS)

7. **Monitoring & Ops**  
   - Logs, metrics, tracing, alerts.

---

### 4.2 Công nghệ (stack) chính

- **Frontend:** Next.js 14, React, TailwindCSS  
- **Backend:** NestJS (Node.js, TypeScript)  
- **DB:** PostgreSQL 15+ (Row-Level Security cho tenant isolation)  
- **Cache:** Redis 7+  
- **Storage:** S3-compatible  
- **Payments:** Stripe (hosted checkout / Elements)  
- **Real-time:** Socket.IO/WebSocket  
- **CI/CD:** GitHub Actions (theo định hướng)

---

### 4.3 Nguyên tắc kiến trúc chính

- **Multi-tenancy:** mọi dữ liệu đều scoped theo `tenant_id`; RLS enforce isolation.
- **API-first:** client chỉ nói chuyện qua REST + WebSocket.
- **Stateless services:** auth qua JWT, session/ratelimit trong Redis.
- **Event-driven notifications:** order events → NotifSvc → push/email/SMS.
- **Modular monolith → microservices:** tách module logic ngay từ đầu, dễ split sau.

---

## 5. 🌊 Luồng quy trình (Key Flows)

### 5.1 QR Code Generation & Validation Flow

**Generate:**

1. Admin tạo bàn trong Dashboard.
2. Dashboard gọi API `POST /tenants/:id/tables`.
3. Backend tạo record bàn trong DB.
4. Backend lấy signing key (per-tenant hoặc global) từ KMS.
5. Sinh token: `{tenantId, tableId, iat, exp, version}`.
6. Ký HMAC-SHA256 → embed vào URL.
7. Generate QR PNG/SVG chứa URL + token.
8. Lưu metadata token vào DB (version, issued_at).
9. Trả QR image + public URL về Dashboard để admin in/dán lên bàn.

**Regenerate:**

1. Admin bấm “Regenerate QR”.
2. API tăng `token version` trong DB → invalidate token cũ.
3. Sinh token mới, generate QR mới, trả về Dashboard.

**Validation khi khách quét:**

1. Customer scan QR → gọi `GET /public/scan/:token`.
2. Backend lấy key từ KMS, verify HMAC.
3. Check `version`, `exp`, `table active` trong DB.
4. Nếu hợp lệ → redirect đến Customer App với context tenant/table.
5. Nếu invalid/expired → show error page thân thiện + hướng dẫn hỏi staff.

---

### 5.2 Order State Machine (Order Lifecycle)

**Các trạng thái:**

- `Draft` – cart của khách, chỉ ở frontend/session.
- `Submitted` – khách bấm checkout.
- `PaymentPending` – đang chờ payment result (online payment).
- `PaymentFailed` – payment fail, khách có thể retry hoặc cancel.
- `Received` – order đã được xác nhận (paid hoặc bill-to-table).
- `Preparing` – bếp đang chuẩn bị.
- `Ready` – món đã sẵn sàng để phục vụ/pickup.
- `Completed` – đã giao xong.
- `Cancelled` – bị huỷ (khách hoặc staff).

**Nhánh quan trọng:**

- `Draft → Submitted → PaymentPending → Received` (card payment OK).  
- `Draft → Submitted → Received` (Bill-to-Table, không prepayment).  
- `PaymentPending → PaymentFailed` nếu gateway báo lỗi.  
- `PaymentFailed → PaymentPending` nếu khách retry; hoặc `→ Cancelled`.  
- Sau `Received`, chỉ staff mới được chuyển:  
  - `Received → Preparing → Ready → Completed`  
  - `Received/Preparing → Cancelled` nếu out-of-stock hoặc issue.

**Side-effects chính:**

- `Received`: notify staff qua WebSocket, tăng pending order count.
- `Preparing`: start timer để track Time-to-Serve KPI.
- `Ready`: notify customer (push/SMS/in-app).
- `Completed`: update sales metrics, đóng order.

---

### 5.3 End-to-End Customer Ordering Flow (từ góc nhìn dev)

1. Customer ngồi vào bàn, scan QR.
2. Backend validate token, redirect đến Customer Web App (đã có context tenant + table).
3. App load menu (categories + items + modifiers) từ MenuSvc qua API.
4. Customer:
   - Duyệt menu, chọn item, chọn modifiers.
   - Add to cart; cart lưu trên client (localStorage + expiry).
5. Khi checkout:
   - Hiển thị summary: items, modifiers, subtotal, tax, total.
   - Customer nhập tên + ghi chú (optional), chọn **Card** hoặc **Bill-to-Table**.
6. Nếu **Card**:
   - Call PaymentSvc để tạo Stripe Payment Intent.
   - Hiển thị Stripe Elements UI, khách nhập card, confirm.
   - Stripe trả kết quả:
     - Success → OrderSvc tạo order, trạng thái `Received` (hoặc `Paid + Received` tuỳ modelling).
     - Fail → hiển thị error, cho phép retry, không tạo order.
7. Nếu **Bill-to-Table**:
   - Bỏ qua prepayment; order được tạo với `PendingPayment` / `Received`.
8. Order được push sang KDS (StaffApp) via WebSocket.
9. Staff update trạng thái; customer thấy được status real-time.

---

## 6. 📋 Yêu cầu Phi chức năng & Tiêu chí Chấp nhận

### 6.1 Acceptance Criteria (mức chung)

- Mỗi flow quan trọng (signup, onboarding, menu, QR, ordering, payment, KDS) đều có:
  - Happy-path scenario (thành công).
  - Error handling scenario (email trùng, password yếu, payment fail, QR expired…).
- QA dùng các scenario này làm **cơ sở cho test cases** (manual + automated E2E).

**Release Criteria (khi deploy production):**

- Tất cả acceptance criteria trong scope phải pass.
- CI: unit + integration tests đều pass.
- E2E: critical journeys pass ở staging.
- Security scan: không có critical vulnerabilities.
- Performance: load test đạt mức chấp nhận được.
- Docs cập nhật & rollback plan được kiểm tra.

---

### 6.2 Non-Functional Requirements (NFRs) nổi bật

- **Performance**
  - ≥ 1000 concurrent users per tenant.
  - API p95 < ~200–500ms, menu load < 1s.
- **Security**
  - HTTPS mọi nơi, JWT cho auth.
  - Tenant data isolation (RLS hoặc schema-per-tenant).
  - QR tokens HMAC-signed + token versioning (revocation).
- **Availability**
  - Uptime ≥ 99.9%, multi-AZ deployment.
- **Scalability**
  - Horizontal scaling: API, DB indexing, Redis cache, CDN.
- **Usability**
  - UX đơn giản: ordering ≤ ~3 interactions chính.
  - Mobile-first for customers.
- **Maintainability**
  - Modular architecture (services tách logic).
  - Code-base dễ tách microservices sau này.
- **Localization**
  - Hỗ trợ đa ngôn ngữ; người dùng chọn language (VD: EN/VI) trong login/profile; tất cả UI text có thể dịch.

---

## 7. 🗺️ Kế hoạch & Ưu tiên (Roadmap & Sprint Plan)

### 7.1 Roadmap tổng quan

- **Q1 — MVP (Sprints 1–6)**
  - Tenant signup & onboarding
  - Menu management
  - QR per table + customer ordering
  - Payments + KDS + real-time updates
  - MVP hoàn thành vào cuối Sprint 6.

- **Q2 — Improvements (Sprints 7–9)**
  - Staff & role management (invite, RBAC).
  - Analytics dashboard (revenue, AOV, popular items, peak hours).
  - Polish, bug fixes, chuẩn bị public launch.

---

### 7.2 Ưu tiên hiện tại (Critical Path & P0)

**Critical path (tóm):**

Auth & Tenant → Menu → Tables & QR → Scan & Menu → Cart & Checkout → Submit Order & Payment → KDS & Real-time

**P0 (MVP) gồm:**

- FR-10-001: Admin login
- FR-1-001, FR-1-002, FR-1-003: Tenant signup + email verify + onboarding wizard
- FR-2-001, 002, 003: Menu categories/items CRUD
- FR-3-001, 002, 003: Tables & QR + download
- FR-4-001, 002, 004, 006: QR scan, add to cart, checkout, submit order
- FR-5-001–003: Stripe payment + confirmation
- FR-6-001–003: KDS, status updates, real-time

MVP được xem là “đủ” khi **tất cả P0 stories hoàn tất cuối Sprint 6**.

---

### 7.3 Là dev mới, nên bắt đầu từ đâu?

1. **Hiểu domain & product**
   - Đọc One-pager & Vision/OKRs để nắm big picture.

2. **Hiểu yêu cầu & phạm vi**
   - Lướt SRS phần Overall Description + Specific Requirements (FR-1 → FR-6).
   - Xem lại MVP Scope để tránh overscope.

3. **Hiểu luồng chính**
   - Đọc các diagram: QR Generation Flow, Order State Machine, Ordering Flow.

4. **Nếu bạn là dev Backend**
   - Tập trung: AuthSvc, TenantSvc, MenuSvc, QRSvc, OrderSvc, PaymentSvc.
   - Đọc ADR 0001 (auth & multi-tenant strategy) để hiểu rõ JWT + HMAC.

5. **Nếu bạn là dev Frontend**
   - Bắt đầu với: Signup/Login + Onboarding → Menu management UI → Customer QR → menu → cart → checkout → KDS.

6. **Testing & Acceptance**
   - Khi implement 1 story, luôn mở Acceptance Criteria + User Story tương ứng, và tự check lại theo Given–When–Then.

---

*(Hết file)*