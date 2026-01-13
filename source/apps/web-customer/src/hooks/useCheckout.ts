// Checkout React Query Hook

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckoutService, CheckoutDto } from '@/api/services/checkout.service';
import { queryKeys } from '@/lib/query-client';

/**
 * Hook to create order from cart (checkout)
 */
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CheckoutDto) => CheckoutService.checkout(dto),
    onSuccess: () => {
      // Clear cart cache after successful checkout
      queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
      // Invalidate orders to show new order
      queryClient.invalidateQueries({ queryKey: queryKeys.orders() });
    },
  });
}
