// Checkout service - handles checkout and order creation
// Uses Strategy Pattern for mock/real API switching

import { StrategyFactory } from '@/api/strategies';
import { ApiResponse } from '@/types';

export interface CheckoutDto {
  customerName?: string;
  specialInstructions?: string;
  paymentMethod: 'SEPAY' | 'STRIPE';
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: string;
  tableId: string;
  customerName?: string;
  specialInstructions?: string;
  items: Array<{
    id: string;
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  createdAt: string;
}

// Create strategy instance
const checkoutStrategy = StrategyFactory.createCheckoutStrategy();

export const CheckoutService = {
  /**
   * Create order from cart (checkout)
   */
  async checkout(dto: CheckoutDto): Promise<ApiResponse<{ order: OrderDto }>> {
    return checkoutStrategy.checkout(dto);
  },
};
