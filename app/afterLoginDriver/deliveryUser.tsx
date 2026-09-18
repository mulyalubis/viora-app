import { Feather, Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { api } from "../../convex/_generated/api";

export default function DeliveryOrderUserScreen() {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<
        "assigned" | "finish"
    >("assigned");

    const orders = useQuery(
        api.orders.getDeliveryOrders
    );

    if (orders === undefined) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text>Loading...</Text>
            </View>
        );
    }

    const filteredOrders = useMemo(() => {

        if (!orders) return [];

        return orders.filter((order) => {

            const matchSearch =
                order.globalOrderNumber
                    .toString()
                    .includes(search);

            if (activeTab === "assigned") {
                return (
                    order.status === "Delivery" &&
                    matchSearch
                );
            }

            return (
                order.isFinished === true &&
                matchSearch
            );
        });

    }, [orders, search, activeTab]);

    return (
        <View style={styles.container}>

            {/* HEADER */}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Delivery Order User</Text>
            </View>

            {/* SEARCH */}

            <View style={styles.searchContainer}>
                <Feather
                    name="search"
                    size={20}
                    color="#fff"
                />

                <TextInput
                    placeholder="Order Number"
                    placeholderTextColor="#D8DDD4"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchInput}
                />
            </View>

            {/* TAB */}

            <View style={styles.tabContainer}>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === "assigned" &&
                        styles.activeTab,
                    ]}
                    onPress={() =>
                        setActiveTab("assigned")
                    }
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "assigned" &&
                            styles.activeTabText,
                        ]}
                    >
                        assigned
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === "finish" &&
                        styles.activeTab,
                    ]}
                    onPress={() =>
                        setActiveTab("finish")
                    }
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "finish" &&
                            styles.activeTabText,
                        ]}
                    >
                        finish
                    </Text>
                </TouchableOpacity>

            </View>

            {/* LIST */}

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() =>
                            router.push({
                                pathname: "/afterLoginDriver/deliveryUserDetail",
                                params: {
                                    orderId: item._id,
                                },
                            })
                        }
                    >
                        <View style={styles.cardHeader}>
                            <View style={styles.orderRow}>
                                <Feather
                                    name="package"
                                    size={22}
                                    color="#fff"
                                />

                                <Text style={styles.orderNumber}>
                                    Order #{item.globalOrderNumber}
                                </Text>
                            </View>

                            <View style={styles.distanceBadge}>
                                <Text style={styles.distanceText}>
                                    {item.estimatedDistance !== undefined
                                        ? `${item.estimatedDistance.toFixed(1)} km`
                                        : "-"
                                    }
                                </Text>
                            </View>
                        </View>

                        <Text style={styles.productCount}>
                            {item.totalItems} Product
                        </Text>

                        <View style={styles.divider} />

                        <View style={styles.bottomInfo}>
                            <View>
                                <Text style={styles.label}>
                                    Pengirim :
                                </Text>

                                <Text style={styles.value}>
                                    {item.driverName ?? "-"}
                                </Text>
                            </View>

                            <View>
                                <Text style={styles.label}>
                                    Perkiraan Sampai :
                                </Text>

                                <Text style={styles.value}>
                                    {item.estimatedDuration
                                        ? `${Math.round(item.estimatedDuration)} Menit`
                                        : "-"
                                    }
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
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
        marginBottom: 25,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        paddingRight: 45,
        color: "#92A390",
    },

    searchContainer: {
        backgroundColor: "#97A58F",
        borderRadius: 20,
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        marginBottom: 20,
    },

    searchInput: {
        flex: 1,
        color: "#fff",
        marginLeft: 10,
        fontSize: 16,
    },

    tabContainer: {
        flexDirection: "row",
        alignSelf: "center",
        backgroundColor: "#97A58F",
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 30,
    },

    tabButton: {
        width: 130,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
    },

    activeTab: {
        backgroundColor: "#000",
        borderRadius: 20,
    },

    tabText: {
        color: "#fff",
        fontSize: 16,
    },

    activeTabText: {
        fontWeight: "600",
    },

    card: {
        backgroundColor: "#97A58F",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        position: "relative",
    },

    distanceBadge: {
        position: "absolute",
        right: 10,
        top: 10,
        backgroundColor: "#000",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },

    distanceText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },

    orderRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    orderNumber: {
        color: "#fff",
        fontSize: 22,
        marginLeft: 10,
        fontWeight: "500",
    },

    productCount: {
        color: "#fff",
        marginTop: 10,
        fontSize: 16,
    },

    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    footerLabel: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },

    footerValue: {
        color: "#fff",
        fontSize: 15,
        marginTop: 3,
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    divider: {
        height: 1,
        backgroundColor: "#fff",
        marginVertical: 12,
    },

    bottomInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    label: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },

    value: {
        color: "#fff",
        fontSize: 15,
        marginTop: 3,
    },

});