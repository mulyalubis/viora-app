import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { STORE_LOCATION } from "../../constant/storeLocation";
import { api } from "../../convex/_generated/api";
import { useAuthStore } from "../../store/authStore";

export default function DeliveryScreen() {
    const savedEmail =
        useAuthStore((state) => state.userEmail);

    const userData = useQuery(
        api.users.getUserByEmail,
        savedEmail
            ? { email: savedEmail }
            : "skip"
    );

    const orders = useQuery(
        api.orders.getMyOrdersWithGlobalNumber,
        userData?._id
            ? { userId: userData._id }
            : "skip"
    );

    const deliveryOrders =
        orders?.filter(
            (order) =>
                order.status === "Delivery" ||
                order.isDeliveryStarted
        ) || [];

    useEffect(() => {
        console.log(
            "USER ORDERS:",
            deliveryOrders.map((o) => ({
                id: o._id,
                lat: o.driverLatitude,
                lng: o.driverLongitude,
            }))
        );
    }, [deliveryOrders]);

    useEffect(() => {
        console.log("DRIVER HEADING:", deliveryOrders.map(o => ({
            id: o._id,
            heading: o.driverHeading
        })));
    }, [deliveryOrders])


    const [distances, setDistances] =
        useState<Record<string, number>>({});

    const [etas, setEtas] =
        useState<Record<string, number>>({});

    const GOOGLE_MAPS_API_KEY =
        Constants.expoConfig?.extra?.googleMapsApiKey;

    useEffect(() => {
        console.log(
            "USER RENDER",
            deliveryOrders.map(o => ({
                id: o._id,
                lat: o.driverLatitude,
                lng: o.driverLongitude,
            }))
        );
    }, [deliveryOrders]);
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Delivery</Text>
            </View>

            <FlatList
                data={deliveryOrders}
                extraData={deliveryOrders}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (

                    <View style={styles.deliveryCard}>

                        <View style={styles.deliveryHeader}>

                            <Text style={styles.deliveryTitle}>
                                Delivery - Order #{item.globalOrderNumber}
                            </Text>

                            <Text style={styles.deliveryEta}>
                                Perkiraan Sampai :
                                {" "}
                                {Math.max(
                                    1,
                                    Math.round(etas[item._id] ?? 0)
                                )}
                                {" "}
                                Menit
                            </Text>

                        </View>
                        {/* <Text>
                            {item.driverLatitude} - {item.driverLongitude}
                        </Text> */}

                        <MapView
                            provider={PROVIDER_GOOGLE}
                            style={{
                                width: "100%",
                                height: 220,
                            }}
                            initialRegion={{
                                latitude:
                                    (STORE_LOCATION.latitude +
                                        item.customerLatitude) / 2,

                                longitude:
                                    (STORE_LOCATION.longitude +
                                        item.customerLongitude) / 2,

                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            }}
                        >

                            {/* TOKO */}

                            <Marker
                                coordinate={{
                                    latitude: STORE_LOCATION.latitude,
                                    longitude: STORE_LOCATION.longitude,
                                }}
                                title="Viora Store"
                                pinColor="green"
                            />

                            {/* CUSTOMER */}

                            <Marker
                                coordinate={{
                                    latitude: item.customerLatitude,
                                    longitude: item.customerLongitude,
                                }}
                                title={item.receiverName}
                                description={item.address}
                                pinColor="red"
                            />

                            {/* DRIVER */}

                            <Marker
                                coordinate={{
                                    latitude: item.driverLatitude ?? STORE_LOCATION.latitude,
                                    longitude: item.driverLongitude ?? STORE_LOCATION.longitude,
                                }}
                                rotation={item.driverHeading ?? 0}
                                flat
                            >
                                <Image
                                    source={require("../../assets/images/driver.png")}
                                    style={{
                                        width: 40,
                                        height: 40,
                                        resizeMode: "contain",
                                    }}
                                />
                            </Marker>

                            {/* ROUTE */}



                            <MapViewDirections
                                origin={{
                                    latitude:
                                        item.driverLatitude ??
                                        STORE_LOCATION.latitude,

                                    longitude:
                                        item.driverLongitude ??
                                        STORE_LOCATION.longitude,
                                }}
                                destination={{
                                    latitude: item.customerLatitude,
                                    longitude: item.customerLongitude,
                                }}
                                apikey={GOOGLE_MAPS_API_KEY!}
                                strokeWidth={5}
                                strokeColor="#1B2CC1"
                                resetOnChange={false}
                                onReady={(result) => {

                                    const eta = Math.round(result.duration);
                                    const distance = result.distance;

                                    setEtas(prev => {
                                        if (prev[item._id] === eta) return prev;

                                        return {
                                            ...prev,
                                            [item._id]: eta,
                                        };
                                    });

                                    setDistances(prev => {
                                        if (prev[item._id] === distance) return prev;

                                        return {
                                            ...prev,
                                            [item._id]: distance,
                                        };
                                    });

                                }}
                            />

                        </MapView>

                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E5E1D1", // Background krem
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    header: {
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexDirection: "row",
        width: "90%",
        marginBottom: 20
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        paddingRight: 100,
        color: "#92A390",
    },
    deliveryCard: {
        backgroundColor: "#98A78F",
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 25,
    },

    deliveryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },

    deliveryTitle: {
        color: "black",
        fontSize: 13,
        fontWeight: "500",
    },

    deliveryEta: {
        color: "black",
        fontSize: 13,
        fontWeight: "500",
    },

    map: {
        width: "100%",
        height: 320,
    },
});