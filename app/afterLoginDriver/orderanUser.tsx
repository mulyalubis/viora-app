import { Ionicons } from "@expo/vector-icons";
import { useAction, useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, } from "react-native";
import { api } from "../../convex/_generated/api";

export default function UpdateOrderanUser() {
    const orders = useQuery(api.orders.getAllOrdersForAdmin) || [];
    const updateAdminOrder =
        useAction(api.orders.updateAdminOrder)

    const createNotification =
        useMutation(api.notification.createNotification);

    const options = ["Packaging", "Delivery", "Take In", "Finished"];
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const [editedStatuses, setEditedStatuses] = useState<{ [key: string]: string }>({});
    const [driverNames, setDriverNames] = useState<{ [key: string]: string }>({});

    const handleStatus = (id: string, value: string) => {
        setEditedStatuses((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    return (
        // Berikan backgroundColor pada container paling luar agar tidak ada background putih bocor
        <View style={{ flex: 1, backgroundColor: "#E5E1D1" }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                // Menggunakan 'padding' untuk iOS dan 'undefined' (biarkan sistem menangani) untuk Android
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Update Orderan User</Text>
                    </View>

                    <FlatList
                        data={orders}
                        keyExtractor={(item) => item._id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: 120,
                            // Hapus flexGrow: 1 jika menyebabkan distorsi layout saat keyboard muncul
                        }}
                        renderItem={({ item, index }) => {
                            return (
                                <View style={styles.card}>
                                    <View style={styles.headerCard}>
                                        <Text style={styles.orderText}>
                                            Pesanan Order #{item.globalOrderNumber}
                                        </Text>

                                        <View style={styles.pickerWrapper}>
                                            <TouchableOpacity
                                                style={styles.statusButton}
                                                onPress={() =>
                                                    setSelectedIndex(selectedIndex === index ? null : index)
                                                }
                                                activeOpacity={0.7}
                                            >
                                                <Text style={styles.statusText}>
                                                    {editedStatuses[item._id] || item.status || "Pilih Status"}
                                                </Text>
                                                <Ionicons
                                                    name={selectedIndex === index ? "chevron-down" : "chevron-forward"}
                                                    size={16}
                                                    color="#fff"
                                                />
                                            </TouchableOpacity>

                                            {selectedIndex === index && (
                                                <View style={styles.dropdown}>
                                                    {options.map((option, optionIndex) => (
                                                        <TouchableOpacity
                                                            key={optionIndex}
                                                            style={styles.option}
                                                            onPress={() => {
                                                                handleStatus(item._id, option);
                                                                setSelectedIndex(null);
                                                            }}
                                                        >
                                                            <Text style={styles.optionText}>{option}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 }}>
                                        <Text style={styles.text}>{item.totalItems} Product</Text>
                                        <TextInput
                                            value={driverNames[item._id] ?? item.driverName ?? ""}
                                            onChangeText={(text) =>
                                                setDriverNames((prev) => ({
                                                    ...prev,
                                                    [item._id]: text,
                                                }))
                                            }
                                            style={styles.textInputDriver}
                                            placeholder="Driver Name"
                                        />
                                    </View>

                                    <View style={styles.line} />

                                    <Text style={styles.text}>{item.receiverName}</Text>
                                    <Text
                                        style={{
                                            color: item.paymentStatus === "Belum Bayar" ? "#ff4d4d" : "#1A4D7E",
                                            fontWeight: "bold",
                                            marginTop: 4,
                                        }}
                                    >
                                        {item.paymentStatus}
                                    </Text>

                                    <View style={{ height: 1, width: 90, marginVertical: 5, backgroundColor: "#e0e0e0" }} />

                                    <View style={styles.footer}>
                                        <Text style={styles.text}>{item.deliveryMethod}</Text>
                                        <View style={styles.rightFooter}>
                                            <TouchableOpacity
                                                style={styles.button}
                                                onPress={async () => {

                                                    try {

                                                        const finalStatus =
                                                            editedStatuses[item._id] ||
                                                            item.status;

                                                        // UPDATE STATUS ORDER
                                                        await updateAdminOrder({
                                                            id: item._id,
                                                            status: finalStatus,
                                                            driverName:
                                                                driverNames[item._id] || "",
                                                        });

                                                        // JIKA STATUS TAKE IN
                                                        if (finalStatus === "Take In") {

                                                            console.log(
                                                                "ORDER:",
                                                                item.globalOrderNumber,
                                                                "USER:",
                                                                item.userId
                                                            );

                                                            await createNotification({
                                                                userId: item.userId,
                                                                title: "Pesanan Siap Diambil",
                                                                message:
                                                                    `Pesanan #${item.globalOrderNumber} sudah siap diambil di toko.`,
                                                            });

                                                        }

                                                        console.log("Berhasil disimpan");

                                                    } catch (error) {
                                                        console.log(error);
                                                    }

                                                }}
                                            >
                                                <Text style={styles.buttonText}>
                                                    Simpan
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        }}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E5E1D1",
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexDirection: "row",
        width: "90%",
        marginBottom: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        paddingRight: 40,
        color: "#92A390",
    },
    card: {
        backgroundColor: "#9AA794",
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
        // Ditambahkan zIndex agar dropdown di dalam kartu tidak terpotong kartu lain
        zIndex: 1,
    },
    headerCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    orderText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    pickerWrapper: {
        width: 100,
        height: 35,
        justifyContent: "center",
        zIndex: 10,
    },
    line: {
        height: 1,
        backgroundColor: "#D9D9D9",
        marginVertical: 10,
    },
    text: {
        color: "#fff",
        fontSize: 15,
        marginBottom: 6,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rightFooter: {
        alignItems: "flex-end",
        gap: 8,
    },
    button: {
        backgroundColor: "#D9D9D9",
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 5,
    },
    buttonText: {
        color: "#000",
        fontWeight: "500",
    },
    statusButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    dropdown: {
        backgroundColor: "#fff",
        borderRadius: 8,
        marginTop: 6,
        overflow: "hidden",
        position: "absolute",
        top: 35,
        width: "100%",
        zIndex: 999,
        // Menambahkan sedikit bayangan agar dropdown terlihat jelas
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    option: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    optionText: {
        color: "#000",
        fontSize: 14,
    },
    textInputDriver: {
        width: 100,
        height: 40,
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        color: "#000"
    }
});