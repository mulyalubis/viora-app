import { create } from "zustand";

type CartItem = {
    _id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
};

type CartStore = {
    cart: CartItem[];
    addToCart: (product: Omit<CartItem, "quantity">) => void;
    decreaseQty: (id: string) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
};

export const useCartStore = create<CartStore>((set) => ({
    cart: [],

    addToCart: (product) =>
        set((state) => {
            const existing = state.cart.find((item) => item._id === product._id);

            if (existing) {
                return {
                    cart: state.cart.map((item) =>
                        item._id === product._id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                };
            }

            return {
                cart: [...state.cart, { ...product, quantity: 1 }],
            };
        }),

    // ➖ kurangi quantity
    decreaseQty: (id) =>
        set((state) => ({
            cart: state.cart
                .map((item) =>
                    item._id === id
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter((item) => item.quantity > 0),
        })),

    // 🗑 hapus item langsung
    removeItem: (id) =>
        set((state) => ({
            cart: state.cart.filter((item) => item._id !== id),
        })),

    clearCart: () => set({ cart: [] }),
}));