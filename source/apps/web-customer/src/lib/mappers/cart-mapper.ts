import { CartItem } from '@/types';
import { CartItemDto, ModifierSelection } from '@/api/services/cart.service';

/**
 * Maps backend CartItemDto to frontend CartItem
 * Note: Backend provides modifiers as {modifierGroupId, optionId}
 * Frontend expects selectedSize (string) and selectedToppings (string[])
 */
export function mapCartItemDtoToCartItem(dto: CartItemDto): CartItem {
  // Extract modifier IDs - we'll store them as topping IDs for now
  // TODO: Properly distinguish between size and topping modifiers
  const selectedToppings: string[] = dto.modifiers.map(m => m.optionId);

  return {
    id: dto.id,
    menuItem: {
      id: dto.menuItem.id,
      name: dto.menuItem.name,
      description: dto.menuItem.description,
      basePrice: dto.menuItem.basePrice,
      imageUrl: dto.menuItem.imageUrl || '/placeholder-food.jpg',
      category: 'Food', // Default - backend doesn't provide this yet
      imageAlt: dto.menuItem.name,
      available: true,
      // Add empty arrays for modifiers - actual data comes from modifiers field
      sizes: [],
      toppings: [],
    },
    selectedSize: undefined, // TODO: Extract from modifiers if needed
    selectedToppings,
    specialInstructions: dto.notes,
    quantity: dto.quantity,
  };
}
