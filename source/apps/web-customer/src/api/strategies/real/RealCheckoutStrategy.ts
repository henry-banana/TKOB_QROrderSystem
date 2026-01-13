// Real Checkout Strategy - calls actual backend API

import apiClient from '@/api/client';
import { ApiResponse } from '@/types';
import { ICheckoutStrategy } from '../interfaces/ICheckoutStrategy';
import { CheckoutDto, OrderDto } from '@/api/services/checkout.service';

export class RealCheckoutStrategy implements ICheckoutStrategy {
  async checkout(dto: CheckoutDto): Promise<ApiResponse<{ order: OrderDto }>> {
    const response = await apiClient.post<{ success: boolean; data: { order: OrderDto } }>(
      '/checkout',
      dto
    );
    return {
      success: response.data.success,
      data: response.data.data,
      message: 'Order created successfully',
    };
  }
}
