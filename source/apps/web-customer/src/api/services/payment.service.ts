// Payment service - handles payment processing
// Uses Strategy Pattern for mock/real API switching

import { StrategyFactory } from '@/api/strategies';
import { ApiResponse } from '@/types';

// DTO Types matching backend
export interface PaymentIntentDto {
  orderId: string;
  amount: number;
  paymentMethod?: 'SEPAY' | 'STRIPE';
}

export interface PaymentIntentResponse {
  id: string;
  qrCode?: string; // Base64 QR code image for SePay
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  transferContent?: string; // Transfer message for manual payment
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  expiresAt?: string;
}

export interface PaymentStatusResponse {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  amount: number;
  paidAt?: string;
}

// Create strategy instance
const paymentStrategy = StrategyFactory.createPaymentStrategy();

export const PaymentService = {
  /**
   * Create payment intent for an order
   */
  async createPaymentIntent(dto: PaymentIntentDto): Promise<ApiResponse<PaymentIntentResponse>> {
    return paymentStrategy.createPaymentIntent(dto);
  },

  /**
   * Get payment status (with polling support)
   */
  async getPaymentStatus(paymentId: string): Promise<ApiResponse<PaymentStatusResponse>> {
    return paymentStrategy.getPaymentStatus(paymentId);
  },
};
