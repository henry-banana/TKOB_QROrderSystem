// Centralized route paths for web-customer (Customer app)
// Use these constants across features and app router wrappers.

export const ROUTES = {
  home: '/',
  menu: '/menu',
  cart: '/cart',
  checkout: '/checkout',
  tracking: '/tracking',
  scan: '/s', // base prefix, dynamic segments handled in app router
} as const;

export type RouteKey = keyof typeof ROUTES;
