import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
    foodId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    restaurantId: string;
    restaurantName: string;
}

interface CartStore {
    items: CartItem[];
    restaurantId: string | null;
    restaurantName: string | null;

    addItem: (item: CartItem) => void;
    removeItem: (foodId: string) => void;
    updateQuantity: (foodId: string, quantity: number) => void;
    clearCart: () => void;
    replaceCart: (item: CartItem) => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            restaurantId: null,
            restaurantName: null,

            addItem: (newItem) => {
                const { items, restaurantId } = get();
                if (restaurantId && restaurantId !== newItem.restaurantId) return;

                const existing = items.find((i) => i.foodId === newItem.foodId);
                if (existing) {
                    set({
                        items: items.map((i) =>
                            i.foodId === newItem.foodId
                                ? { ...i, quantity: i.quantity + newItem.quantity }
                                : i
                        ),
                    });
                } else {
                    set({
                        items: [...items, newItem],
                        restaurantId: newItem.restaurantId,
                        restaurantName: newItem.restaurantName,
                    });
                }
            },

            removeItem: (foodId) => {
                const items = get().items.filter((i) => i.foodId !== foodId);
                set({
                    items,
                    restaurantId: items.length > 0 ? get().restaurantId : null,
                    restaurantName: items.length > 0 ? get().restaurantName : null,
                });
            },

            updateQuantity: (foodId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(foodId);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.foodId === foodId ? { ...i, quantity } : i
                    ),
                });
            },

            clearCart: () => set({ items: [], restaurantId: null, restaurantName: null }),

            replaceCart: (item) => {
                set({
                    items: [item],
                    restaurantId: item.restaurantId,
                    restaurantName: item.restaurantName,
                });
            },
        }),
        { name: "foodify-cart" }
    )
);

// Selectors (computed values)
export const cartItemCount = (items: CartItem[]) =>
    items.reduce((sum, i) => sum + i.quantity, 0);

export const cartSubtotal = (items: CartItem[]) =>
    items.reduce((sum, i) => sum + i.price * i.quantity, 0);