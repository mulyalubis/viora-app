import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../../convex/_generated/api";
import { useAuthStore } from "../../store/authStore";

export default function VerifyOtp() {
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const setUserEmail = useAuthStore((state) => state.setUserEmail);
    const verifyOtp = useMutation(api.auth.verifyOtp);

    const handleVerify = async () => {
        if (!otp || otp.length < 4) {
            Alert.alert("OTP tidak valid");
            return;
        }

        setLoading(true);

        try {
            const email = await AsyncStorage.getItem("pendingEmail");

            if (!email) {
                Alert.alert("Email tidak ditemukan, ulangi login");
                return;
            }

            await verifyOtp({
                email,
                otp,
            });

            await AsyncStorage.setItem("userEmail", email);
            setUserEmail(email);
            await AsyncStorage.removeItem("pendingEmail");

            router.replace("/account"); // lebih aman dari router.back()

        } catch (err: any) {
            Alert.alert("Error", err.message || "Gagal verifikasi OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <View style={{ width: "90%", justifyContent: "flex-start", alignItems: "center", marginBottom: 20, }}>
                <Text style={{ fontSize: 40, color: "#92A390", textTransform: "uppercase" }}>viora</Text>
            </View>

            <TextInput
                placeholder="Kode OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                style={{
                    width: 200,
                    borderWidth: 1,
                    marginTop: 20,
                    padding: 10
                }}
            />

            <TouchableOpacity
                onPress={handleVerify}
                disabled={loading}
                style={{
                    marginTop: 20,
                    backgroundColor: loading ? "gray" : "black",
                    padding: 15
                }}
            >
                <Text style={{ color: "white" }}>
                    {loading ? "Memverifikasi..." : "Verifikasi"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}