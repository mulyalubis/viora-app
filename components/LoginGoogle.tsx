import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { api } from "../convex/_generated/api";
import { useAuthStore } from "../store/authStore";

GoogleSignin.configure({
    webClientId: "620426616734-uqsqasidnhsl7168jg3ocavs4s5jnpos.apps.googleusercontent.com",
    offlineAccess: true,
    forceCodeForRefreshToken: true,
});

export default function GoogleLogin() {
    const createUser = useMutation(api.users.createUser);
    const setUserEmail = useAuthStore((state) => state.setUserEmail);

    const handleGoogleLogin = async () => {
        console.log("🔥 Mulai login Google");


        try {
            await GoogleSignin.hasPlayServices();

            const response = await GoogleSignin.signIn();
            if (response.type === 'success') {
                const user = response.data.user;

                await createUser({
                    email: user.email,
                    name: user.name || "User",
                    image: user.photo || "",
                    provider: "google",
                });

                await AsyncStorage.setItem("userEmail", user.email);

                setUserEmail(user.email);

                router.replace("/(tabs)/account");
            } else {
                console.log("⚠️ Login dibatalkan oleh user");
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log("User membatalkan login");
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log("Proses login sedang berjalan");
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log("Play services tidak tersedia");
            } else {
                console.log("Error lainnya:", error);
            }
        }
    };

    return (
        <TouchableOpacity onPress={handleGoogleLogin}>
            <Text style={{ padding: 10, backgroundColor: "lightblue", marginTop: 20 }}>
                Login with Google
            </Text>
        </TouchableOpacity>
    );
}