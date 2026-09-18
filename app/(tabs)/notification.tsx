import HeaderAccountAndShopp from "@/components/headerAccountAndShopp";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQuery } from "convex/react";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function Message() {

    const savedEmail =
        useAuthStore(
            (state) => state.userEmail
        );

    const userData = useQuery(
        api.users.getUserByEmail,
        savedEmail
            ? { email: savedEmail }
            : "skip"
    );

    const notifications = useQuery(
        api.notification.getMyNotifications,
        userData
            ? { userId: userData._id }
            : "skip"
    );

    const hideNotification =
        useMutation(
            api.notification.hideNotificationForUser
        );

    const cart = useQuery(
        api.cart.getMyCart,
        userData ? { userId: userData._id } : "skip"
    );

    const totalCart = cart?.reduce((total, item) => {
        return total + item.quantity;
    }, 0) ?? 0;


    if (!savedEmail) {
        return (
            <View style={styles.container}>

                <HeaderAccountAndShopp cartCount={totalCart} user={userData} />

                <Text style={{ textAlign: "center", marginTop: "50%" }}>
                    Harus login terlebih dahulu
                </Text>

            </View>
        );
    }

    if (userData === undefined) {
        return (
            <View style={styles.container}>
                <HeaderAccountAndShopp cartCount={totalCart} user={userData} />
                <ActivityIndicator size="large" style={{ marginTop: "50%" }} />
            </View>
        );
    }

    if (notifications === undefined) {
        return (
            <View style={styles.container}>

                <HeaderAccountAndShopp cartCount={totalCart} user={userData} />

                <ActivityIndicator
                    size="large"
                    color="#92A390"
                    style={{ marginTop: "50%" }}
                />

            </View>
        );
    }



    return (
        <View style={styles.container}>

            {/* HEADER */}
            <HeaderAccountAndShopp cartCount={totalCart} user={userData} />

            {/* LIST */}
            <FlatList
                data={notifications ?? []}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{
                    marginVertical: "5%",
                    paddingBottom: 120,
                    marginHorizontal: "5%",
                }}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>
                        Belum ada notifikasi
                    </Text>
                )}
                renderItem={({ item }) => (

                    <View style={styles.card}>

                        {/* HAPUS UNTUK USER INI SAJA */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {

                                if (!userData?._id) return;

                                hideNotification({
                                    userId: userData._id,
                                    notificationId: item._id,
                                });

                            }}
                        >
                            <Text style={styles.closeText}>
                                X
                            </Text>
                        </TouchableOpacity>

                        {/* TITLE */}
                        <Text style={styles.cardTitle}>
                            {item.title}
                        </Text>

                        {/* MESSAGE */}
                        <Text style={styles.message}>
                            {item.message}
                        </Text>

                    </View>

                )}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        width: "100%",
        backgroundColor: "#E3DFD3",
    },

    header: {
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        marginBottom: 15,
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#92A390",
    },

    card: {
        backgroundColor: "#9AA794",
        borderRadius: 14,
        padding: 14,
        marginBottom: 18,
    },

    cardTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 8,
    },

    message: {
        color: "#fff",
        fontSize: 15,
        lineHeight: 24,
        width: "82%",
    },

    closeButton: {
        position: "absolute",
        right: 10,
        top: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#2F2F2F",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999
    },

    closeText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },

    emptyText: {
        textAlign: "center",
        marginTop: 50,
        color: "#888",
        fontSize: 15,
    },
});