// Payment Strategy Interface

import { ApiResponse } from '@/types';
import { PaymentIntentDto, PaymentIntentResponse, PaymentStatusResponse } from '@/api/services/payment.service';

export interface IPaymentStrategy {
  createPaymentIntent(dto: PaymentIntentDto): Promise<ApiResponse<PaymentIntentResponse>>;
  getPaymentStatus(paymentId: string): Promise<ApiResponse<PaymentStatusResponse>>;
}
