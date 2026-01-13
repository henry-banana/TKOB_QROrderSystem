// Payment React Query Hooks

import { useMutation, useQuery } from '@tanstack/react-query';
import { PaymentService, PaymentIntentDto } from '@/api/services/payment.service';
import { queryKeys } from '@/lib/query-client';

/**
 * Hook to create payment intent
 */
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (dto: PaymentIntentDto) => PaymentService.createPaymentIntent(dto),
  });
}

/**
 * Hook to get payment status with polling
 */
export function usePaymentStatus(paymentId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.payment(paymentId ?? ''),
    queryFn: () => PaymentService.getPaymentStatus(paymentId!),
    enabled: enabled && !!paymentId,
    refetchInterval: (data) => {
      // Stop polling if payment completed or failed
      const status = data?.data?.status;
      if (status === 'COMPLETED' || status === 'FAILED' || status === 'REFUNDED') {
        return false;
      }
      return 5000; // Poll every 5 seconds
    },
    staleTime: 0, // Always fetch fresh data when polling
  });
}
