// Cart Strategy Interface

import { ApiResponse } from '@/types';
import { CartDto, CartItemDto, AddToCartDto, UpdateCartItemDto } from '@/api/services/cart.service';

export interface ICartStrategy {
  getCart(): Promise<ApiResponse<CartDto>>;
  addToCart(dto: AddToCartDto): Promise<ApiResponse<CartItemDto>>;
  updateCartItem(itemId: string, dto: UpdateCartItemDto): Promise<ApiResponse<CartItemDto>>;
  removeCartItem(itemId: string): Promise<ApiResponse<void>>;
  clearCart(): Promise<ApiResponse<void>>;
}
