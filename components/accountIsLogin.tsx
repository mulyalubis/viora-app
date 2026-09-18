import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../store/authStore";


interface ProfileViewProps {
    userData: {
        _id: string;
        _creationTime: number;
        email: string;
        name: string;
        image: string;
        provider: string;
        role: "user" | "driver" | "admin";
    };
}

export default function AccountIsLogin({ userData }: ProfileViewProps) {
    const router = useRouter();
    const setUserEmail = useAuthStore((state) => state.setUserEmail);

    const clearSession = useAuthStore((state) => state.clearSession);

    if (userData === undefined) return <View style={styles.container}><Text>Loading...</Text></View>;

    type MenuItem = {
        id: number;
        name: string;
        icon: string;
        route: string;
    };

    const userMenuItems: MenuItem[] = [
        { id: 1, name: "Orders", icon: "shopping-outline", route: "/afterLoginUser/orders" },
        { id: 2, name: "Delivery", icon: "truck-delivery-outline", route: "/afterLoginUser/delivery" },
        { id: 3, name: "Language", icon: "earth", route: "/afterLoginUser/language" },
        { id: 4, name: "Address", icon: "map-marker-outline", route: "/afterLoginUser/address" },
        { id: 5, name: "Privacy Policy", icon: "shield-lock-outline", route: "/afterLoginUser/privacy" },
    ];

    const driverMenuItems: MenuItem[] = [
        { id: 1, name: "Delivery Order User", icon: "truck-outline", route: "/afterLoginDriver/deliveryUser" },
        { id: 2, name: "Language", icon: "earth", route: "/afterLoginDriver/language" },
    ];

    const menuItems =
        userData?.role === "user"
            ? userMenuItems
            : driverMenuItems;

    const handleLogout = async () => {
        try {
            await GoogleSignin.signOut();

            await AsyncStorage.clear();
            setUserEmail(null);
            clearSession();
            router.replace("/(tabs)/account");

            console.log("✅ Logout berhasil & Storage dibersihkan");
        } catch (error) {
            console.error("Gagal logout:", error);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header Profile */}
                <View style={styles.headerCard}>
                    <View style={styles.avatarContainer}>
                        {userData?.image ? (
                            <Image source={{ uri: userData.image }} style={styles.avatar} />
                        ) : (
                            <Ionicons name="person-circle" size={60} color="white" />
                        )}
                    </View>
                    <View style={styles.infoText}>
                        <Text style={styles.userName}>{userData?.name || "User Name"}</Text>
                        <Text style={styles.userEmail}>{userData?.email || "email@gmail.com"}</Text>
                    </View>
                </View>

                {/* Menu List */}
                <View style={styles.menuCard}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.menuItem,
                                index === menuItems.length - 1 && {
                                    borderBottomWidth: 0
                                }
                            ]}
                            onPress={() => router.push(item.route as any)}
                        >
                            <View style={styles.menuLeft}>
                                <MaterialCommunityIcons name={item.icon as any} size={24} color="white" />
                                <Text style={styles.menuText}>{item.name}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="white" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E5E1D1", // Warna krem latar belakang
    },
    scrollContent: {
        padding: 20,
        alignItems: "center",
    },
    headerCard: {
        backgroundColor: "#98A78F", // Hijau sage
        width: "95%",
        padding: 20,
        borderRadius: 25,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 40,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
    },
    avatar: {
        width: "100%",
        height: "100%",
    },
    infoText: {
        marginLeft: 15,
    },
    userName: {
        color: "white",
        fontSize: 20,
        fontWeight: "bold",
    },
    userEmail: {
        color: "white",
        opacity: 0.8,
        fontSize: 14,
    },
    menuCard: {
        backgroundColor: "#98A78F",
        width: "90%",
        borderRadius: 20,
        marginTop: 50,
        paddingHorizontal: 15,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.3)",
    },
    menuLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuText: {
        color: "white",
        fontSize: 16,
        marginLeft: 15,
    },
    logoutButton: {
        backgroundColor: "#98A78F",
        width: "100%",
        padding: 18,
        borderRadius: 25,
        marginTop: 120,
        alignItems: "center",
    },
    logoutText: {
        color: "black",
        fontSize: 18,
        fontWeight: "500",
    },
});


























