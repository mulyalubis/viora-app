import { create } from "zustand";

type AuthState = {
    userEmail: string | null;
    setUserEmail: (email: string | null) => void;
    selectedAddress: any;
    setSelectedAddress: (address: any) => void;
    clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    userEmail: null,
    setUserEmail: (email) => set({ userEmail: email }),
    selectedAddress: null,
    setSelectedAddress: (address) => set({ selectedAddress: address }),
    clearSession: () => set({
        userEmail: null,
        selectedAddress: null,
    }),
}));