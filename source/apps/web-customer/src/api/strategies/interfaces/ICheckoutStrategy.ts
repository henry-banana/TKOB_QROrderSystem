// Checkout Strategy Interface

import { ApiResponse } from '@/types';
import { CheckoutDto, OrderDto } from '@/api/services/checkout.service';

export interface ICheckoutStrategy {
  checkout(dto: CheckoutDto): Promise<ApiResponse<{ order: OrderDto }>>;
}
