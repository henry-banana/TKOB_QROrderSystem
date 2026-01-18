# EPICS — Unified Restaurant Ordering Platform (Merged Edition)

## EPIC-01 — Tenant Onboarding
**Mô tả:**  
Cho phép chủ nhà hàng đăng ký tài khoản, xác thực email, tạo hồ sơ nhà hàng và hoàn tất onboarding.

### Phạm vi:
- Signup email/password  
- Email verification  
- Onboarding wizard 4 bước  
- Save draft  
- Tenant Profile Management  

### User Stories:
- FR-1-001 Tenant Signup  
- FR-1-002 Email Verification  
- FR-1-003 Onboarding Wizard  
- FR-1-004 Tenant Profile  
- FR-10-001 Admin Login  


## EPIC-02 — Menu & Catalog Management
**Mô tả:**  
Quản lý categories, items, modifiers, trạng thái hiển thị.

### Phạm vi:
- Category CRUD  
- Menu Item CRUD  
- Image Upload  
- Modifiers (groups, options, price adjustment)  
- Toggle availability  
- Menu publishing  
- Cache invalidation  

### User Stories:
- FR-2-001 Create Categories & Items  
- FR-2-002 Publish/Unpublish  
- FR-2-003 Update/Delete  
- FR-2-004 Modifiers  
- FR-2-005 Availability Toggle  


## EPIC-03 — Table Management & QR System
**Mô tả:**  
Quản lý bàn và QR code với token bảo mật.

### Phạm vi:
- Table CRUD  
- Generate QR (HMAC token)  
- Download PNG/SVG/PDF  
- Regenerate QR + invalidate old  
- Expired QR error  
- Inactive table flow  

### User Stories:
- FR-3-001 Add Tables  
- FR-3-002 Generate QR  
- FR-3-003 Download/Print QR  
- FR-3-004 Regenerate QR  
- FR-9-001 Invalid QR Errors  


## EPIC-04 — Customer Ordering & Payments
**Mô tả:**  
Flow từ scan → menu → cart → checkout → payment.

### Phạm vi:
- Scan QR  
- Load menu theo tenant/table  
- Add to cart  
- Modifiers  
- Cart persistence  
- Checkout (name, notes, tax)  
- Stripe payment  
- Payment success/failure retry  
- Order creation  

### User Stories:
- FR-4-001 Scan QR & Load Menu  
- FR-4-002 Add to Cart  
- FR-4-003 Modifiers  
- FR-4-004 Review Cart & Checkout  
- FR-4-005 Name & Notes  
- FR-4-006 Submit Order  
- FR-5-001 Stripe Backend  
- FR-5-002 Payment UI  
- FR-5-003 Confirmation  
- FR-5-004 Payment Retry  


## EPIC-05 — Order Processing & KDS
**Mô tả:**  
KDS + order states + realtime updates.

### Phạm vi:
- Staff order list  
- Update states: Received → Preparing → Ready → Completed  
- Realtime WebSocket updates  
- Notifications + sound  
- Timer & alerts  
- Customer tracking page  

### User Stories:
- FR-6-001 View Orders  
- FR-6-002 Update States  
- FR-6-003 Realtime Updates  
- FR-6-004 Timer & Alerts  
- FR-9-001 Customer Tracking  
