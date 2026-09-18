import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAction } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../convex/_generated/api";

export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const sendOtp = useAction(api.auth.sendOtp);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // const createUser = useMutation(api.users.createUser);
    // const setUserEmail = useAuthStore((state) => state.setUserEmail);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            alert("Semua field harus diisi");
            return;
        }

        try {
            await sendOtp({
                name,
                email,
                password,
            });

            await AsyncStorage.setItem("pendingEmail", email);

            alert("Kode OTP sudah dikirim");

            router.push("/verify/verifyOtp");
            // await createUser({
            //     name,
            //     email,
            //     image: "",
            //     provider: "manual",
            //     password,
            // });
            // await AsyncStorage.setItem("userEmail", email);
            // setUserEmail(email);

            // redirect ke account
            // setTimeout(() => {
            //     router.replace("/(tabs)/account");
            // }, 0);

        } catch (err) {
            console.log("Register error:", err);
        }
    };

    return (
        <View style={{ width: "90%", justifyContent: "center", alignItems: "center" }}>
            <View style={styles.container}>
                <Text style={{ fontSize: 18, color: "black", textTransform: "capitalize", marginLeft: 5 }}>Full Name</Text>
                <TextInput value={name} onChangeText={setName} style={{ width: "100%", height: "100%", backgroundColor: "white", borderRadius: 10, padding: 10, paddingLeft: 40, justifyContent: "center", alignItems: "center" }} placeholder="Full Name" />
                <Ionicons name="person-outline" size={22} color="black" style={styles.iconInput} />
            </View>

            <View style={styles.container}>
                <Text style={{ fontSize: 18, color: "black", textTransform: "capitalize", marginLeft: 5 }}>Email address</Text>
                <TextInput value={email} onChangeText={setEmail} style={{ width: "100%", height: "100%", backgroundColor: "white", borderRadius: 10, padding: 10, justifyContent: "center", alignItems: "center", paddingLeft: 40 }} placeholder=" Email" />
                <MaterialCommunityIcons name="email-outline" size={24} color="black" style={styles.iconInput} />
            </View>

            <View style={styles.container}>
                <Text style={{ fontSize: 18, color: "black", textTransform: "capitalize", marginLeft: 5 }}>Password</Text>
                <TextInput value={password} onChangeText={setPassword} style={{ width: "100%", height: "100%", backgroundColor: "white", borderRadius: 10, padding: 10, paddingLeft: 40 }} placeholder="Password" secureTextEntry={!showPassword} />
                <Ionicons style={styles.iconShowPassword} size={24} color="black" onPress={() => setShowPassword(!showPassword)} name={showPassword ? "eye" : "eye-off"} />
                <MaterialCommunityIcons name="lock-outline" size={24} color="black" style={styles.iconInput} />
                <TouchableOpacity style={{ position: "absolute", right: 0, top: 70 }}>
                    <Text style={{ fontSize: 12, color: "black", textTransform: "capitalize" }}>Forgot password?</Text>
                </TouchableOpacity>
            </View>

            <View style={{ width: "80%", justifyContent: "center", alignItems: "center", marginTop: 70, }}>
                <TouchableOpacity onPress={handleRegister} style={{ width: "100%", height: 50, backgroundColor: "black", borderRadius: 10, justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 18, color: "white", textTransform: "capitalize" }}>Register</Text>
                </TouchableOpacity>
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