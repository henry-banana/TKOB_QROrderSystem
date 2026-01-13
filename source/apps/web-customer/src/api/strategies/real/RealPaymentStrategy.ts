// Real Payment Strategy - calls actual backend API

import apiClient from '@/api/client';
import { ApiResponse } from '@/types';
import { IPaymentStrategy } from '../interfaces/IPaymentStrategy';
import { PaymentIntentDto, PaymentIntentResponse, PaymentStatusResponse } from '@/api/services/payment.service';

export class RealPaymentStrategy implements IPaymentStrategy {
  async createPaymentIntent(dto: PaymentIntentDto): Promise<ApiResponse<PaymentIntentResponse>> {
    const response = await apiClient.post<{ success: boolean; data: PaymentIntentResponse }>(
      '/payment/intent',
      dto
    );
    return {
      success: response.data.success,
      data: response.data.data,
      message: 'Payment intent created',
    };
  }

  async getPaymentStatus(paymentId: string): Promise<ApiResponse<PaymentStatusResponse>> {
    const response = await apiClient.get<{ success: boolean; data: PaymentStatusResponse }>(
      `/payment/${paymentId}`
    );
    return {
      success: response.data.success,
      data: response.data.data,
      message: 'Payment status fetched',
    };
  }
}
