// React Query Client Configuration
// Centralized configuration for React Query

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys factory for consistent cache management
export const queryKeys = {
  // Session
  session: ['session'] as const,
  
  // Menu
  menu: (tenantId?: string) => ['menu', tenantId] as const,
  menuItem: (itemId: string) => ['menu-item', itemId] as const,
  
  // Cart
  cart: (sessionId?: string) => ['cart', sessionId] as const,
  
  // Orders
  orders: (tableId?: string) => ['orders', tableId] as const,
  order: (orderId: string) => ['order', orderId] as const,
  
  // Payment
  payment: (paymentId: string) => ['payment', paymentId] as const,
};
