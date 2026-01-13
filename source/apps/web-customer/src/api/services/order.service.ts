// Order service - handles order operations

import apiClient from '@/api/client';
import { ApiResponse } from '@/types';

export interface OrderItemDto {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  tableId: string;
  tableName?: string;
  customerName?: string;
  specialInstructions?: string;
  items: OrderItemDto[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export const OrderService = {
  /**
   * Get orders for current table (session-based)
   */
  async getTableOrders(tableId: string): Promise<ApiResponse<OrderDto[]>> {
    const response = await apiClient.get<{ success: boolean; data: OrderDto[] }>(
      `/orders/table/${tableId}`
    );
    return {
      success: response.data.success,
      data: response.data.data,
      message: 'Orders fetched successfully',
    };
  },

  /**
   * Get single order details
   */
  async getOrder(orderId: string): Promise<ApiResponse<OrderDto>> {
    const response = await apiClient.get<{ success: boolean; data: OrderDto }>(
      `/orders/${orderId}`
    );
    return {
      success: response.data.success,
      data: response.data.data,
      message: 'Order fetched successfully',
    };
  },
};
