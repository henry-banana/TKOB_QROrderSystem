// Cart service - handles cart-related API calls
// Uses Strategy Pattern for mock/real API switching

import { StrategyFactory } from '@/api/strategies';
import { ApiResponse } from '@/types';

// DTO Types matching backend
export interface ModifierSelection {
  modifierGroupId: string;
  optionId: string;
}

export interface AddToCartDto {
  menuItemId: string;
  quantity: number;
  modifiers?: ModifierSelection[];
  notes?: string;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CartItemDto {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  modifiers: ModifierSelection[];
  menuItem: {
    id: string;
    name: string;
    description?: string;
    basePrice: number;
    imageUrl?: string;
  };
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  total: number;
  itemCount: number;
}

// Create strategy instance
const cartStrategy = StrategyFactory.createCartStrategy();

export const CartService = {
  /**
   * Get cart for current session (session cookie required)
   */
  async getCart(): Promise<ApiResponse<CartDto>> {
    return cartStrategy.getCart();
  },

  /**
   * Add item to cart
   */
  async addToCart(dto: AddToCartDto): Promise<ApiResponse<CartItemDto>> {
    return cartStrategy.addToCart(dto);
  },

  /**
   * Update cart item quantity
   */
  async updateCartItem(itemId: string, dto: UpdateCartItemDto): Promise<ApiResponse<CartItemDto>> {
    return cartStrategy.updateCartItem(itemId, dto);
  },

  /**
   * Remove item from cart
   */
  async removeCartItem(itemId: string): Promise<ApiResponse<void>> {
    return cartStrategy.removeCartItem(itemId);
  },

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<ApiResponse<void>> {
    return cartStrategy.clearCart();
  },
};
