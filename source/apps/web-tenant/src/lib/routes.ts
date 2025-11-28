// Centralized route paths for web-tenant (Admin/Staff portal)
// Use these constants across features and app router wrappers.

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  menu: '/menu',
  menuModifiers: '/menu-modifiers',
  tables: '/tables',
  tableQRDetail: '/table-qr-detail',
  orders: '/orders',
  analytics: '/analytics',
  staff: '/staff',
  tenantProfile: '/tenant-profile',
  kds: '/kds',
  serviceBoard: '/service-board',
} as const;

export type RouteKey = keyof typeof ROUTES;
