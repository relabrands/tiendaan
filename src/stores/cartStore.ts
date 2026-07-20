import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/lib/store";

export interface CartItem {
  key: string; // productId + variantLabel
  productId: string;
  slug: string;
  title: string;
  image_url: string | null;
  price: number;
  currency: string;
  variantLabel: string; // e.g. "Talla: M" or ""
  selectedOptions: Array<{ name: string; value: string }>;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (input: {
    product: Product;
    quantity?: number;
    selectedOptions?: Array<{ name: string; value: string }>;
  }) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

function makeKey(productId: string, options: Array<{ name: string; value: string }>) {
  const suffix = options.map((o) => `${o.name}:${o.value}`).join("|");
  return suffix ? `${productId}__${suffix}` : productId;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: ({ product, quantity = 1, selectedOptions = [] }) => {
        const key = makeKey(product.id, selectedOptions);
        const existing = get().items.find((i) => i.key === key);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          });
          return;
        }
        set({
          items: [
            ...get().items,
            {
              key,
              productId: product.id,
              slug: product.slug,
              title: product.title,
              image_url: product.image_url,
              price: product.price,
              currency: product.currency,
              variantLabel: selectedOptions.map((o) => `${o.name}: ${o.value}`).join(" · "),
              selectedOptions,
              quantity,
            },
          ],
        });
      },
      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.key !== key) });
          return;
        }
        set({ items: get().items.map((i) => (i.key === key ? { ...i, quantity } : i)) });
      },
      removeItem: (key) => set({ items: get().items.filter((i) => i.key !== key) }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "adn-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
