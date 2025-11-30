export type MenuItem = {
  id: string;
  name: string;
  price: string; // formatted like "$12.50"
  status: 'available' | 'unavailable';
  description: string;
  category: string;
};

// Temporary shared source of items until API wiring
const items: MenuItem[] = [
  { id: '1', name: 'Caesar Salad', price: '$12.50', status: 'available', description: 'Fresh romaine with parmesan', category: 'starters' },
  { id: '2', name: 'Bruschetta', price: '$9.00', status: 'available', description: 'Toasted bread with tomatoes', category: 'starters' },
  { id: '3', name: 'Spring Rolls', price: '$8.50', status: 'unavailable', description: 'Crispy vegetable rolls', category: 'starters' },
  { id: '4', name: 'Garlic Bread', price: '$6.00', status: 'available', description: 'Toasted with garlic butter', category: 'starters' },
  { id: '5', name: 'Grilled Chicken', price: '$24.00', status: 'available', description: 'Herb-marinated chicken breast', category: 'mains' },
  { id: '6', name: 'Spaghetti Carbonara', price: '$18.50', status: 'available', description: 'Classic Italian pasta with bacon', category: 'mains' },
  { id: '7', name: 'Steak & Fries', price: '$32.00', status: 'available', description: 'Premium ribeye with crispy fries', category: 'mains' },
  { id: '8', name: 'Salmon Fillet', price: '$28.00', status: 'unavailable', description: 'Pan-seared Atlantic salmon', category: 'mains' },
  { id: '9', name: 'Chocolate Cake', price: '$8.50', status: 'available', description: 'Rich chocolate layer cake', category: 'desserts' },
  { id: '10', name: 'Ice Cream', price: '$6.00', status: 'available', description: 'Vanilla, chocolate, or strawberry', category: 'desserts' },
  { id: '11', name: 'Tiramisu', price: '$9.50', status: 'available', description: 'Classic Italian coffee dessert', category: 'desserts' },
  { id: '12', name: 'Cheesecake', price: '$8.00', status: 'unavailable', description: 'New York style cheesecake', category: 'desserts' },
  { id: '13', name: 'Cola', price: '$3.50', status: 'available', description: 'Chilled Coca-Cola', category: 'drinks' },
  { id: '14', name: 'Orange Juice', price: '$4.50', status: 'available', description: 'Freshly squeezed orange juice', category: 'drinks' },
  { id: '15', name: 'Hot Coffee', price: '$3.00', status: 'available', description: 'Espresso or Americano', category: 'drinks' },
  { id: '16', name: 'Iced Tea', price: '$3.50', status: 'available', description: 'Refreshing lemon iced tea', category: 'drinks' },
];

export function getAllMenuItems(): MenuItem[] {
  return items;
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return items.find(i => i.id === id);
}
