type SizeOption = { id: string; name: string; price: string };
type Topping = { id: string; name: string; price: string; available: boolean };
export type ModifiersData = {
  sizeOptions: SizeOption[];
  toppings: Topping[];
  allowSpecialInstructions: boolean;
};

const memoryStore: Record<string, ModifiersData> = {};
const LS_KEY = 'tkqr_modifiers_store_v1';

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.assign(memoryStore, parsed);
    }
  } catch {}
}

function persistToLocalStorage() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(memoryStore));
  } catch {}
}

export function getModifiers(itemId: string): ModifiersData | undefined {
  if (typeof window !== 'undefined' && Object.keys(memoryStore).length === 0) {
    loadFromLocalStorage();
  }
  return memoryStore[itemId];
}

export function setModifiers(itemId: string, data: ModifiersData) {
  memoryStore[itemId] = data;
  if (typeof window !== 'undefined') {
    persistToLocalStorage();
  }
}

export function ensureModifiers(itemId: string): ModifiersData {
  const existing = getModifiers(itemId);
  if (existing) return existing;
  const initial: ModifiersData = {
    sizeOptions: [
      { id: 's', name: 'Small', price: '+$0.00' },
      { id: 'm', name: 'Medium', price: '+$3.00' },
      { id: 'l', name: 'Large', price: '+$5.00' },
    ],
    toppings: [
      { id: 't1', name: 'Extra Parmesan', price: '+$2.00', available: true },
      { id: 't2', name: 'Croutons', price: '+$1.50', available: true },
    ],
    allowSpecialInstructions: true,
  };
  setModifiers(itemId, initial);
  return initial;
}
