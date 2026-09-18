import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "convex/react";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../convex/_generated/api";


export default function AddAddressScreen() {

    const [location, setLocation] = useState<any>(null);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);

    const [fullAddress, setFullAddress] = useState("");
    const [labelAddress, setLabelAddress] = useState("");
    const [receiverName, setReceiverName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [locationName, setLocationName] =
        useState("");

    const [locationDetail, setLocationDetail] =
        useState("");

    const [savedEmail, setSavedEmail] =
        useState<string | null>(null);

    const userData = useQuery(
        api.users.getUserByEmail,
        savedEmail
            ? { email: savedEmail }
            : "skip"
    );

    const addAddressMutation = useMutation(api.address.addAddress);

    const addressData = useQuery(
        api.address.getMyAddress,
        userData
            ? { userId: userData._id }
            : "skip"
    );

    useEffect(() => {

        const getUserLocation = async () => {

            try {

                // request izin lokasi
                const { status } =
                    await Location.requestForegroundPermissionsAsync();

                // kalau ditolak
                if (status !== "granted") {

                    alert(
                        "Izin lokasi diperlukan untuk memilih alamat."
                    );

                    return;
                }

                // ambil lokasi user
                const currentLocation =
                    await Location.getCurrentPositionAsync({});

                setLocation(currentLocation.coords);

                getAddressFromCoordinates(
                    currentLocation.coords.latitude,
                    currentLocation.coords.longitude
                );

            } catch (error) {

                console.log("Location Error:", error);

                alert(
                    "Lokasi tidak tersedia. Pastikan GPS aktif."
                );
            }
        };

        getUserLocation();

    }, []);

    useEffect(() => {

        const getEmail = async () => {

            const email =
                await AsyncStorage.getItem(
                    "userEmail"
                );

            setSavedEmail(email);

        };

        getEmail();

    }, []);

    const getAddressFromCoordinates = async (
        latitude: number,
        longitude: number
    ) => {

        const result =
            await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

        if (result.length > 0) {

            const place = result[0];

            setLocationName(
                place.district ||
                place.street ||
                "Lokasi Dipilih"
            );

            setLocationDetail(
                [
                    place.district,
                    place.city,
                    place.region
                ]
                    .filter(Boolean)
                    .join(", ")
            );

            setFullAddress(
                [
                    place.name,
                    place.street,
                    place.district,
                    place.city,
                    place.region,
                ]
                    .filter(Boolean)
                    .join(", ")
            );
        }
    };

    const handleSaveAddress = async () => {

        if (!userData) return;

        await addAddressMutation({
            userId: userData._id,
            fullAddress,
            labelAddress,
            receiverName,
            phoneNumber,
            latitude:
                (selectedLocation || location).latitude,
            longitude:
                (selectedLocation || location).longitude,
        });

        alert("Alamat berhasil disimpan");

        router.back();
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "#E5E1D1"
            }}
            edges={["bottom"]}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.container}>

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons
                                name="chevron-back"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>

                        <Text style={styles.title}>
                            Address
                        </Text>

                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: 20,
                        }}
                    >

                        {/* Map Card */}
                        <View style={styles.mapCard}>

                            <View style={styles.mapHeader}>
                                <View style={styles.locationRow}>
                                    <MaterialIcons
                                        name="location-on"
                                        size={18}
                                        color="#fff"
                                    />

                                    <View>
                                        <Text style={styles.locationTitle}>
                                            {locationName || "Mencari lokasi…"}
                                        </Text>

                                        <Text style={styles.locationSubtitle}>
                                            {locationDetail || "…"}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.changeButton} onPress={() =>
                                    setIsPickingLocation(!isPickingLocation)
                                }>
                                    <Text style={styles.changeButtonText}>
                                        {isPickingLocation ? "SELESAI" : "UBAH"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {location && (
                                <MapView
                                    style={styles.map}
                                    initialRegion={{
                                        latitude:
                                            selectedLocation?.latitude ||
                                            location.latitude,

                                        longitude:
                                            selectedLocation?.longitude ||
                                            location.longitude,

                                        latitudeDelta: 0.005,
                                        longitudeDelta: 0.005,
                                    }}

                                    showsUserLocation={true}
                                    showsMyLocationButton={true}
                                    zoomEnabled={true}
                                    scrollEnabled={true}
                                    rotateEnabled={true}

                                    onPress={(e) => {

                                        if (!isPickingLocation) return;

                                        const coordinate =
                                            e.nativeEvent.coordinate;

                                        setSelectedLocation(coordinate);

                                        getAddressFromCoordinates(
                                            coordinate.latitude,
                                            coordinate.longitude
                                        );
                                    }}

                                    onPoiClick={(e) => {

                                        if (!isPickingLocation) return;

                                        const coordinate =
                                            e.nativeEvent.coordinate;

                                        setSelectedLocation(coordinate);

                                        getAddressFromCoordinates(
                                            coordinate.latitude,
                                            coordinate.longitude
                                        );

                                        setLocationName(
                                            e.nativeEvent.name ||
                                            "Lokasi Dipilih"
                                        );
                                    }}
                                >

                                    <Marker
                                        coordinate={
                                            selectedLocation || {
                                                latitude: location.latitude,
                                                longitude: location.longitude,
                                            }
                                        }

                                        draggable={isPickingLocation}

                                        onDragEnd={(e) => {

                                            const coordinate =
                                                e.nativeEvent.coordinate;

                                            setSelectedLocation(coordinate);

                                            getAddressFromCoordinates(
                                                coordinate.latitude,
                                                coordinate.longitude
                                            );
                                        }}
                                    />

                                </MapView>
                            )}

                        </View>

                        {/* Form */}
                        <View style={styles.formCard}>
                            <Text style={styles.label}>
                                Alamat Lengkap
                            </Text>

                            <TextInput
                                multiline
                                value={fullAddress}
                                onChangeText={setFullAddress}
                                style={[styles.input, styles.textArea]}
                                placeholder="Masukkan alamat lengkap"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formCard}>
                            <Text style={styles.label}>
                                Label Alamat
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={labelAddress}
                                onChangeText={setLabelAddress}
                                placeholder="Contoh: Rumah / Kantor"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formCard}>
                            <Text style={styles.label}>
                                Nama Penerima
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={receiverName}
                                onChangeText={setReceiverName}
                                placeholder="Masukkan nama penerima"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={styles.formCard}>
                            <Text style={styles.label}>
                                Nomor Hp
                            </Text>

                            <TextInput
                                keyboardType="phone-pad"
                                style={styles.input}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="Masukkan nomor hp"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Button */}
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                            <Text style={styles.saveButtonText}>
                                Simpan
                            </Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E5E1D1",
        paddingTop: 50,
        paddingHorizontal: 10,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 30,
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#000",
    },

    mapCard: {
        backgroundColor: "#92A390",
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 28,
        alignSelf: "center",
        width: "95%",
    },
    map: {
        width: "100%",
        height: 180,
    },

    mapHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
    },

    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    locationTitle: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "700",
    },

    locationSubtitle: {
        color: "#fff",
        fontSize: 11,
        marginTop: 2,
        width: 220,
    },

    changeButton: {
        backgroundColor: "#E5E1D1",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },

    changeButtonText: {
        color: "#000",
        fontSize: 10,
        fontWeight: "700",
    },

    mapImage: {
        width: "100%",
        height: 80,
    },

    formCard: {
        backgroundColor: "#92A390",
        borderRadius: 20,
        padding: 10,
        marginBottom: 18,
        alignSelf: "center",
        width: "95%",
    },

    label: {
        color: "#fff",
        fontSize: 15,
        marginBottom: 10,
        fontWeight: "500",
    },

    input: {
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: "#000",
    },

    textArea: {
        minHeight: 85,
        textAlignVertical: "top",
    },

    saveButton: {
        marginBottom: 15,
        backgroundColor: "#92A390",
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: "center",
        marginHorizontal: 10,
    },

    saveButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    coordinateBox: {
        padding: 10,
        backgroundColor: "#7D8D7B",
    },

    coordinateText: {
        color: "#fff",
        fontSize: 12,
    },
});