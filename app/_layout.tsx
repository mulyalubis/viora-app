import AsyncStorage from "@react-native-async-storage/async-storage";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export default function RootLayout() {
    const setUserEmail = useAuthStore((state) => state.setUserEmail);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const email = await AsyncStorage.getItem("userEmail");
            console.log("HYDRATE ROOT:", email);

            setUserEmail(email); // 🔥 isi Zustand di awal
            setIsHydrated(true);
        };

        loadUser();
    }, []);

    // 🔥 tahan render sampai selesai ambil data
    if (!isHydrated) return null;
    return (
        <ConvexProvider client={convex}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="product/[id]" />
            </Stack>
        </ConvexProvider>
    );
}