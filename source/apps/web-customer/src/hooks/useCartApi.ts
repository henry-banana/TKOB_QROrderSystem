// Cart React Query Hooks
// Provides React Query integration for cart operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CartService, AddToCartDto, UpdateCartItemDto, CartDto } from '@/api/services/cart.service';
import { queryKeys } from '@/lib/query-client';
import { ApiResponse } from '@/types';

/**
 * Hook to fetch cart data
 */
export function useCart() {
  return useQuery<ApiResponse<CartDto>, Error>({
    queryKey: queryKeys.cart(),
    queryFn: CartService.getCart,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

/**
 * Hook to add item to cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AddToCartDto) => CartService.addToCart(dto),
    onSuccess: () => {
      // Invalidate cart query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
    },
  });
}

/**
 * Hook to update cart item quantity
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      CartService.updateCartItem(itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
    },
  });
}

/**
 * Hook to remove item from cart
 */
export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => CartService.removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
    },
  });
}

/**
 * Hook to clear entire cart
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => CartService.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
    },
  });
}

/**
 * Utility hook for cart operations
 * Combines all cart mutations for convenience
 */
export function useCartMutations() {
  const addToCart = useAddToCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  return {
    addToCart,
    updateItem,
    removeItem,
    clearCart,
  };
}
