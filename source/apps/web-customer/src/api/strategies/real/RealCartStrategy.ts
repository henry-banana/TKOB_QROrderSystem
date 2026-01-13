// Real Cart Strategy - calls actual backend API

import apiClient from '@/api/client';
import { ApiResponse } from '@/types';
import { ICartStrategy } from '../interfaces/ICartStrategy';
import { CartDto, CartItemDto, AddToCartDto, UpdateCartItemDto } from '@/api/services/cart.service';

export class RealCartStrategy implements ICartStrategy {
  async getCart(): Promise<ApiResponse<CartDto>> {
    const response = await apiClient.get<{ success: boolean; data: CartDto }>('/cart');
    return {
      success: response.data.success,
      data: response.data.data,
      message: 'Cart fetched successfully',
    };
  }

  async addToCart(dto: AddToCartDto): Promise<ApiResponse<CartItemDto>> {
    const response = await apiClient.post<{ success: boolean; data: CartItemDto }>('/cart/items', dto);
    return {
      success: response.data.success,
      data: response.data.data,
      message: 'Item added to cart',
    };
  }

  async updateCartItem(itemId: string, dto: UpdateCartItemDto): Promise<ApiResponse<CartItemDto>> {
    const response = await apiClient.patch<{ success: boolean; data: CartItemDto }>(
      `/cart/items/${itemId}`,
      dto
    );
    return {
      success: response.data.success,
      data: response.data.data,
      message: 'Cart item updated',
    };
  }

  async removeCartItem(itemId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<{ success: boolean }>(`/cart/items/${itemId}`);
    return {
      success: response.data.success,
      data: undefined,
      message: 'Item removed from cart',
    };
  }

  async clearCart(): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<{ success: boolean }>('/cart');
    return {
      success: response.data.success,
      data: undefined,
      message: 'Cart cleared',
    };
  }
}
