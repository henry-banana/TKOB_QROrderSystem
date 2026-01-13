// Order React Query Hooks

import { useQuery } from '@tanstack/react-query';
import { OrderService } from '@/api/services/order.service';
import { queryKeys } from '@/lib/query-client';

/**
 * Hook to fetch orders for current table
 */
export function useTableOrders(tableId: string | null) {
  return useQuery({
    queryKey: queryKeys.orders(tableId ?? undefined),
    queryFn: () => OrderService.getTableOrders(tableId!),
    enabled: !!tableId,
    refetchInterval: 10000, // Poll every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
}

/**
 * Hook to fetch single order details with polling
 */
export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: queryKeys.order(orderId ?? ''),
    queryFn: () => OrderService.getOrder(orderId!),
    enabled: !!orderId,
    refetchInterval: (data) => {
      // Stop polling if order is completed or cancelled
      const status = data?.data?.status;
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        return false;
      }
      return 10000; // Poll every 10 seconds for active orders
    },
    staleTime: 5000,
  });
}
