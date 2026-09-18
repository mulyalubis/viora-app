import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../convex/_generated/api";
import { useAuthStore } from "../store/authStore";
import GoogleLogin from "./LoginGoogle";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);

    const loginUser = useMutation(api.users.loginUser);
    const setUserEmail = useAuthStore((state) => state.setUserEmail);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Isi semua field");
            return;
        }

        try {
            const result = await loginUser({ email, password });

            if (!result.success || !result.user) {
                alert(result.message || "Login gagal");
                return;
            }

            await AsyncStorage.setItem("userEmail", result.user.email);
            setUserEmail(result.user.email);
            router.replace("/(tabs)/account");

        } catch (err: any) {
            alert(err.message || "Login gagal");
        }
    };
    return (
        <View style={{ width: "90%", justifyContent: "center", alignItems: "center" }}>
            <View style={styles.container}>
                <Text style={{ fontSize: 18, color: "black", textTransform: "capitalize", marginLeft: 5 }}>Email address</Text>
                <TextInput value={email}
                    onChangeText={setEmail} style={{ width: "100%", height: "100%", backgroundColor: "white", borderRadius: 10, padding: 10, paddingLeft: 40, justifyContent: "center", alignItems: "center" }} placeholder="Email" />
                <MaterialCommunityIcons name="email-outline" size={24} color="black" style={styles.iconInput} />
            </View>

            <View style={styles.container}>
                <Text style={{ fontSize: 18, color: "black", textTransform: "capitalize", marginLeft: 5 }}>Password</Text>
                <TextInput value={password}
                    onChangeText={setPassword} style={{ width: "100%", height: "100%", backgroundColor: "white", borderRadius: 10, padding: 10, paddingLeft: 40 }} placeholder="Password" secureTextEntry={!showPassword} />
                <Ionicons style={styles.iconShowPassword} size={24} color="black" onPress={() => setShowPassword(!showPassword)} name={showPassword ? "eye" : "eye-off"} />
                <MaterialCommunityIcons name="lock-outline" size={24} color="black" style={styles.iconInput} />
                <TouchableOpacity style={{ position: "absolute", right: 0, top: 70 }}>
                    <Text style={{ fontSize: 12, color: "black", textTransform: "capitalize" }}>Forgot password?</Text>
                </TouchableOpacity>
            </View>

            <View style={{ width: "80%", justifyContent: "center", alignItems: "center", marginTop: 70, }}>
                <TouchableOpacity onPress={handleLogin} style={{ width: "100%", height: 50, backgroundColor: "black", borderRadius: 10, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 18, color: "white", textTransform: "capitalize" }}>Login</Text>
                </TouchableOpacity>
            </View>

            <View style={{ width: "80%", justifyContent: "center", alignItems: "center", marginTop: 20, flexDirection: "row", gap: 20 }}>
                <View style={{ width: "35%", height: 1, backgroundColor: "black" }}></View>
                <Text style={{ fontSize: 16, color: "black", textTransform: "capitalize" }}>or continue with</Text>
                <View style={{ width: "35%", height: 1, backgroundColor: "black" }}></View>
            </View>

            <View style={{ width: "80%", justifyContent: "center", alignItems: "center", marginTop: 20, flexDirection: "row", gap: 20 }}>
                <GoogleLogin />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "90%",
        height: 50,
        justifyContent: "center",
        alignItems: "flex-start",
        flexDirection: "column",
        position: "relative",
        marginTop: 40,
    },
    iconShowPassword: {
        position: "absolute",
        right: 10,
        top: "50%",
    },
    iconInput: {
        position: "absolute",
        left: 10,
        top: "50%",
    },
})