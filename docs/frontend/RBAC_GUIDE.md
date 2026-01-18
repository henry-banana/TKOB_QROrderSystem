# Role-Based Access Control (RBAC) System

## Overview
Web-tenant app sử dụng 3 roles chính cho nhân viên nhà hàng:

## Roles

### 1. **Admin** (`admin`)
- **Mô tả**: Quản trị viên nhà hàng, có quyền truy cập đầy đủ
- **Quyền truy cập**:
  - ✅ Dashboard (`/admin/dashboard`)
  - ✅ Menu Management (`/admin/menu`)
  - ✅ Table Management (`/admin/tables`)
  - ✅ Order Management (`/admin/orders`) - Full access
  - ✅ Analytics
  - ✅ Staff Management
  - ✅ Tenant Settings

### 2. **KDS** (`kds`)
- **Mô tả**: Kitchen Display System - Nhân viên bếp
- **Quyền truy cập**:
  - ✅ Kitchen Display System (`/admin/kds`)
  - ❌ Dashboard, Menu, Tables, Analytics (không có quyền truy cập)

### 3. **Waiter** (`waiter`)
- **Mô tả**: Nhân viên phục vụ
- **Quyền truy cập**:
  - ✅ Service Board (`/admin/service-board`)
  - ✅ Order Management (`/admin/orders`) - View & update status
  - ❌ Menu Management, Table Management (không có quyền truy cập)

## Dev Mode Login

Trong môi trường development, bạn có thể login nhanh với các role khác nhau:

1. Mở trang Login (`/login`)
2. Tại phần "Dev mode shortcuts", click vào button tương ứng:
   - 🔐 **Login as Admin** → Đăng nhập với quyền Admin
   - 👨‍🍳 **Login as KDS** → Đăng nhập với quyền KDS
   - 🧑‍💼 **Login as Waiter** → Đăng nhập với quyền Waiter

### Dev Login Code
```typescript
// In Login.tsx
const handleDevLogin = (role: 'admin' | 'kds' | 'waiter') => {
  devLogin(role);
  // Auto navigate to appropriate dashboard
  if (role === 'admin') {
    onNavigate?.('/admin/dashboard');
  } else if (role === 'kds') {
    onNavigate?.('/admin/kds');
  } else if (role === 'waiter') {
    onNavigate?.('/admin/service-board');
  }
};
```

## Implementation Details

### AuthContext
File: `src/shared/context/AuthContext.tsx`

```typescript
export type UserRole = 'admin' | 'kds' | 'waiter';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
}
```

### RoleGuard Component
File: `src/shared/components/auth/RoleGuard.tsx`

Wrap pages với `RoleGuard` để bảo vệ routes:

```tsx
<RoleGuard allowedRoles={['admin']}>
  <YourPage />
</RoleGuard>
```

### Page Protection Examples

**Admin Dashboard** (chỉ Admin):
```tsx
<RoleGuard allowedRoles={['admin']}>
  <DashboardPage />
</RoleGuard>
```

**Orders** (Admin + Waiter):
```tsx
<RoleGuard allowedRoles={['admin', 'waiter']}>
  <OrderManagementPage />
</RoleGuard>
```

**KDS** (chỉ KDS):
```tsx
<RoleGuard allowedRoles={['kds']}>
  <KDSBoard />
</RoleGuard>
```

## Route Structure

```
/admin
├── /dashboard          → Admin only
├── /menu               → Admin only
├── /tables             → Admin only
├── /orders             → Admin + Waiter
├── /kds                → KDS only
└── /service-board      → Waiter only
```

## Testing

### Test Different Roles
1. Login với role khác nhau sử dụng dev mode buttons
2. Thử truy cập các routes không được phép
3. Verify rằng RoleGuard hiển thị "Access Denied" page

### Expected Behavior
- ✅ User với role đúng: Xem được nội dung page
- ❌ User với role sai: Hiển thị "Access Denied" message
- ⏳ Chưa login: Redirect về `/login`

## Future Enhancements

### TODO for Production
- [ ] Remove dev mode login buttons
- [ ] Implement real JWT authentication
- [ ] Add API integration for user roles
- [ ] Add role permissions for specific actions (not just pages)
- [ ] Implement fine-grained permissions (CRUD operations)
- [ ] Add audit logging for role changes

### Potential Additional Roles
- `cashier` - Thu ngân
- `manager` - Quản lý (giữa Admin và Waiter)
- `owner` - Chủ nhà hàng (trên Admin)
