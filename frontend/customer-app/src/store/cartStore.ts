import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  itemId: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,

      addItem: (item) => {
        const { items, restaurantId } = get();
        if (restaurantId && restaurantId !== item.restaurantId) {
          if (!confirm('Your cart has items from another restaurant. Start a new cart?')) return;
          set({ items: [], restaurantId: null });
        }
        const existing = items.find((i) => i.itemId === item.itemId);
        if (existing) {
          set({ items: items.map((i) => i.itemId === item.itemId ? { ...i, quantity: i.quantity + item.quantity } : i) });
        } else {
          set({ items: [...items, item], restaurantId: item.restaurantId });
        }
      },

      removeItem: (itemId) => {
        const items = get().items.filter((i) => i.itemId !== itemId);
        set({ items, restaurantId: items.length ? get().restaurantId : null });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({ items: get().items.map((i) => i.itemId === itemId ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [], restaurantId: null }),

      subtotal: () => parseFloat(
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
      ),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'foodrush-cart' }
  )
);
