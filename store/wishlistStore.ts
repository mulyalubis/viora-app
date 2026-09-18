import { create } from "zustand";

type Product = {
    _id: string;
    name: string;
    price: number;
    image: string;
};

type WishlistStore = {
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (id: string) => void;
};

export const useWishlistStore = create<WishlistStore>((set) => ({
    wishlist: [],

    addToWishlist: (product) =>
        set((state) => ({
            wishlist: [...state.wishlist, product],
        })),

    removeFromWishlist: (id) =>
        set((state) => ({
            wishlist: state.wishlist.filter((item) => item._id !== id),
        })),
}));