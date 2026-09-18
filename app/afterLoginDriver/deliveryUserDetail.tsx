import {
    setTrackingOrderId,
    startBackgroundTracking
} from "@/src/services/backgroundLocation";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { AppState, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { STORE_LOCATION } from "../../constant/storeLocation";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const { height } = Dimensions.get("window");

export default function DeliveryTrackingScreen() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const mapRef = useRef<MapView>(null);


    useEffect(() => {

        const getLocation = async () => {

            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                alert("Izin lokasi diperlukan");
                return;
            }

            const currentLocation =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

            console.log(
                "UPDATE DRIVER:",
                currentLocation.coords.latitude,
                currentLocation.coords.longitude
            );

            setLocation(currentLocation);

        };

        getLocation();

    }, []);

    const openNavigation = () => {
        const latitude = order?.customerLatitude;
        const longitude = order?.customerLongitude;

        Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`
        );
    };

    useEffect(() => {
        const sub = AppState.addEventListener(
            "change",
            (state) => {
                console.log("APP STATE:", state);
            }
        );

        return () => sub.remove();
    }, []);


    const { orderId } = useLocalSearchParams<{
        orderId: string;
    }>();

    const order = useQuery(
        api.orders.getOrderDetail,
        orderId
            ? { id: orderId as Id<"orders"> }
            : "skip"
    );

    useEffect(() => {
        console.log(
            "ADMIN DRIVER:",
            order?.driverLatitude,
            order?.driverLongitude
        );
    }, [
        order?.driverLatitude,
        order?.driverLongitude
    ]);

    const startDeliveryMutation =
        useMutation(api.orders.startDelivery);

    const updateDriverLocation =
        useMutation(api.orders.updateDriverLocation);


    const handleStartDelivery = async () => {
        if (!order) return;

        // 1. FOREGROUND WAJIB DULU
        const { status: fgStatus } =
            await Location.requestForegroundPermissionsAsync();

        if (fgStatus !== "granted") {
            alert("Izin lokasi diperlukan");
            return;
        }

        // 2. ambil lokasi awal
        const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        await updateDriverLocation({
            orderId: order._id,
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            heading: currentLocation.coords.heading ?? 0,
        });

        // 3. START DELIVERY DULU (PENTING)
        await startDeliveryMutation({
            orderId: order._id,
        });

        // 4. BARU START BACKGROUND TRACKING
        setTrackingOrderId(order._id);
        await startBackgroundTracking();
    };

    const [eta, setEta] = useState(0);

    const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    const destination = {
        latitude: order?.customerLatitude ?? 0,
        longitude: order?.customerLongitude ?? 0,
    };

    const driverLocation = {
        latitude:
            order?.driverLatitude ??
            STORE_LOCATION.latitude,

        longitude:
            order?.driverLongitude ??
            STORE_LOCATION.longitude,
    };

    useEffect(() => {
        if (!order?.isDeliveryStarted) return;

        setTrackingOrderId(order._id);

    }, [order?.isDeliveryStarted]);

    if (!order) {
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

    return (
        <View style={styles.container}>
            {/* MAP */}
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude:
                        (driverLocation.latitude +
                            destination.latitude) / 2,
                    longitude:
                        (driverLocation.longitude +
                            destination.longitude) / 2,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                <Marker
                    coordinate={{
                        latitude: order.driverLatitude ?? STORE_LOCATION.latitude,
                        longitude: order.driverLongitude ?? STORE_LOCATION.longitude,
                    }}
                />

                <Marker
                    coordinate={destination}
                    title="Tujuan"
                    pinColor="red"
                />

                <MapViewDirections
                    origin={driverLocation}
                    destination={destination}
                    apikey={GOOGLE_MAPS_API_KEY!}
                    strokeWidth={5}
                    strokeColor="#1B2CC1"
                    optimizeWaypoints={true}
                    onReady={(result) => {

                        setEta(Math.round(result.duration));

                        mapRef.current?.fitToCoordinates(
                            result.coordinates,
                            {
                                edgePadding: {
                                    top: 80,
                                    right: 80,
                                    bottom: 80,
                                    left: 80,
                                },
                                animated: true,
                            }
                        );
                    }}
                />
            </MapView>

            {/* BACK BUTTON */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Ionicons
                    name="chevron-back"
                    size={28}
                    color="#000"
                />
            </TouchableOpacity>

            {/* BOTTOM SHEET */}
            <View style={styles.bottomSheet}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.arrival}>
                        Perkiraan Sampai : {eta} Menit
                    </Text>

                    <View style={styles.orderHeader}>
                        <Text style={styles.orderNumber}>
                            📦 Order #{order?.globalOrderNumber}
                        </Text>

                        <View style={{ flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                            <Text style={styles.status}>
                                {order?.status}
                            </Text>

                            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                                <TouchableOpacity
                                    style={{ backgroundColor: "#97A58F", padding: 8, borderRadius: 8, alignItems: "center", }}
                                    onPress={openNavigation}
                                >
                                    <Text style={{ color: "#fff", fontSize: 12, fontFamily: "PoppinsMedium" }}>
                                        Petunjuk Jalan
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        backgroundColor:
                                            order.isDeliveryStarted
                                                ? "#D62828"
                                                : "#97A58F",

                                        padding: 8,
                                        borderRadius: 8,
                                        alignItems: "center",
                                    }}
                                    onPress={handleStartDelivery}
                                >
                                    <Text
                                        style={{
                                            color: "#fff",
                                            fontSize: 12,
                                            fontFamily: "PoppinsMedium",
                                        }}
                                    >
                                        {order.isDeliveryStarted
                                            ? "Delivery Active"
                                            : "Start Delivery"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.line} />

                    <View style={styles.row}>
                        <View>
                            <Text style={styles.label}>
                                Customer
                            </Text>

                            <Text style={styles.value}>
                                {order?.receiverName}
                            </Text>
                        </View>

                        <View>
                            <Text style={styles.label}>
                                Order Cost
                            </Text>

                            <Text style={styles.value}>
                                Rp. {order?.amount.toLocaleString("id-ID")}
                            </Text>
                        </View>

                        <View>
                            <Text style={styles.label}>
                                Pemesanan
                            </Text>

                            <Text style={styles.value}>
                                {new Date(order?.createdAt).toLocaleDateString("id-ID")}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <View>
                            <Text style={styles.infoTitle}>
                                Quantity
                            </Text>

                            <Text style={styles.infoValue}>
                                {order?.totalItems} item
                            </Text>
                        </View>

                        <View>
                            <Text style={styles.infoTitle}>
                                Weight
                            </Text>

                            <Text style={styles.infoValue}>
                                500 Gram
                            </Text>
                        </View>

                        <View>
                            <Text style={styles.infoTitle}>
                                Payment Method
                            </Text>

                            <Text style={styles.infoValue}>
                                {order?.paymentType ?? "-"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.iconButton}
                        >
                            <Ionicons
                                name="call-outline"
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.iconButton}
                        >
                            <FontAwesome
                                name="whatsapp"
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.finishButton}
                    >
                        <Text style={styles.finishText}>
                            Selesaikan Pengiriman
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E5E1D1",
    },

    map: {
        width: "100%",
        height: height * 0.55,
    },

    backButton: {
        position: "absolute",
        top: 60,
        left: 20,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },

    bottomSheet: {
        flex: 1,
        backgroundColor: "#E5E1D1",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        marginTop: -25,
        padding: 20,
    },

    arrival: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
    },

    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    orderNumber: {
        fontSize: 20,
        fontWeight: "700",
    },

    status: {
        fontSize: 16,
        color: "#556B54",
        fontWeight: "600",
    },

    line: {
        height: 1,
        backgroundColor: "#222",
        marginVertical: 16,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    label: {
        fontSize: 13,
        color: "#555",
    },

    value: {
        marginTop: 4,
        fontSize: 15,
        fontWeight: "500",
    },

    infoCard: {
        marginTop: 20,
        backgroundColor: "#97A58F",
        borderRadius: 16,
        padding: 18,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    infoTitle: {
        color: "#fff",
        fontSize: 13,
    },

    infoValue: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
        marginTop: 6,
    },

    actionRow: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 28,
    },

    iconButton: {
        width: 80,
        height: 80,
        borderRadius: 18,
        backgroundColor: "#97A58F",
        justifyContent: "center",
        alignItems: "center",
    },

    finishButton: {
        marginTop: 30,
        backgroundColor: "#97A58F",
        height: 58,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },

    finishText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "600",
    },
});