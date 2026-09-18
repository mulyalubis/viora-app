import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../convex/_generated/api";
import { useAuthStore } from "../../store/authStore";


export default function AddressScreen() {
    const { from } = useLocalSearchParams();
    const [savedEmail, setSavedEmail] = useState<string | null>(null);
    const setPrimaryMutation = useMutation(api.address.setPrimaryAddress);

    const deleteAddressMutation =
        useMutation(api.address.deleteAddress);

    const [selectedAddressId, setSelectedAddressId] =
        useState<string | null>(null);

    const setSelectedAddress =
        useAuthStore(
            (state) => state.setSelectedAddress
        );

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

    const handleSetPrimary = async (
        addressId: any
    ) => {

        if (!userData) return;

        await setPrimaryMutation({
            userId: userData._id,
            addressId,
        });
    };

    const userData = useQuery(
        api.users.getUserByEmail,
        savedEmail
            ? { email: savedEmail }
            : "skip"
    );

    const addressData = useQuery(
        api.address.getMyAddress,
        userData
            ? { userId: userData._id }
            : "skip"
    );

    const hasAddress = addressData && addressData.length > 0;

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons
                        name="chevron-back"
                        size={24}
                        color="black"
                    />
                </TouchableOpacity>

                <Text style={styles.title}>Address</Text>
            </View>

            <View style={{ justifyContent: "space-between", flexDirection: "row", marginTop: 15 }}>
                <TouchableOpacity style={styles.addButton} onPress={() => router.push("../addressDetail/addAddressScreen")}>
                    <Text style={styles.addButtonText}>
                        Tambah Alamat
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.deleteButton,
                        !selectedAddressId && {
                            opacity: 0.5,
                        }
                    ]}

                    disabled={!selectedAddressId}

                    onPress={async () => {

                        await deleteAddressMutation({
                            addressId: selectedAddressId as any,
                        });

                        setSelectedAddressId(null);
                    }}
                >
                    <Text style={styles.deleteButtonText}>
                        Hapus Alamat
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20, }}
            >

                {/* Jika ada alamat */}
                {hasAddress ? (

                    <>
                        {addressData?.map((item) => (

                            <TouchableOpacity
                                key={item._id}
                                activeOpacity={0.9}
                                onPress={() =>
                                    setSelectedAddressId(item._id)
                                }
                                style={[
                                    styles.card,

                                    selectedAddressId === item._id && {
                                        borderWidth: 2,
                                        borderColor: "#fff",
                                    }
                                ]}
                            >

                                <View style={styles.topRow}>

                                    <View style={styles.labelContainer}>

                                        <Text style={styles.labelText}>
                                            {item.labelAddress}
                                        </Text>

                                        {item.isPrimary && (
                                            <View style={styles.mainBadge}>
                                                <Text style={styles.mainBadgeText}>
                                                    Utama
                                                </Text>
                                            </View>
                                        )}

                                    </View>

                                    <TouchableOpacity>
                                        <FontAwesome5 name="share" size={18} color="white" />
                                    </TouchableOpacity>

                                </View>

                                <Text style={styles.name}>
                                    {item.receiverName}
                                </Text>

                                <Text style={styles.phone}>
                                    {item.phoneNumber}
                                </Text>

                                <Text style={styles.address}>
                                    {item.fullAddress}
                                </Text>

                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        marginTop: 18,
                                    }}
                                >

                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() =>
                                            router.push({
                                                pathname:
                                                    "../addressDetail/editAddressScreen",

                                                params: {
                                                    addressId: item._id,
                                                    fullAddress: item.fullAddress,
                                                    labelAddress: item.labelAddress,
                                                    receiverName: item.receiverName,
                                                    phoneNumber: item.phoneNumber,
                                                    latitude: item.latitude,
                                                    longitude: item.longitude,
                                                },
                                            })
                                        }
                                    >
                                        <Text style={styles.editButtonText}>
                                            Ubah Alamat
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() =>
                                            handleSetPrimary(item._id)
                                        }
                                    >
                                        <Text style={styles.editButtonText}>
                                            {item.isPrimary
                                                ? "Alamat Utama"
                                                : "Jadikan Utama"}
                                        </Text>
                                    </TouchableOpacity>

                                </View>

                            </TouchableOpacity>

                        ))}

                        <View style={styles.bottomContainer}>
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => {

                                    if (!selectedAddressId) {
                                        alert("Pilih alamat terlebih dahulu");
                                        return;
                                    }

                                    const selectedAddress = addressData?.find(
                                        (item) => item._id === selectedAddressId
                                    );

                                    if (!selectedAddress) return;

                                    setSelectedAddress(selectedAddress);

                                    router.back();
                                }}
                            >
                                <Text style={styles.selectButtonText}>
                                    Pilih Alamat
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </>

                ) : (

                    // Jika belum ada alamat
                    <View style={styles.emptyContainer}>

                        <Ionicons
                            name="location-outline"
                            size={80}
                            color="#92A390"
                        />

                        <Text style={styles.emptyTitle}>
                            Belum Ada Alamat
                        </Text>

                        <Text style={styles.emptyDescription}>
                            Silakan tambahkan alamat terlebih dahulu
                        </Text>

                    </View>

                )}

            </ScrollView>

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
        paddingRight: "30%",
        color: "#92A390",
    },

    addButton: {
        alignSelf: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 10,
        borderRadius: 6,
        backgroundColor: "#92A390",
    },

    addButtonText: {
        color: "#fff",
        fontSize: 11,
    },

    deleteButton: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 10,
        borderRadius: 6,
        backgroundColor: "#92A390",
    },

    deleteButtonText: {
        color: "#fff",
        fontSize: 11,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 80,
    },

    emptyTitle: {
        marginTop: 15,
        fontSize: 20,
        fontWeight: "700",
        color: "#92A390",
    },

    emptyDescription: {
        marginTop: 8,
        fontSize: 14,
        color: "#92A390",
        textAlign: "center",
    },

    card: {
        backgroundColor: "#92A390",
        marginTop: 20,
        borderRadius: 14,
        padding: 14,
        borderWidth: 2,
        borderColor: 'transparent',
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    labelContainer: {
        flexDirection: "row",
        alignItems: "center",
    },

    labelText: {
        color: "#fff",
        fontSize: 12,
        marginRight: 6,
    },

    mainBadge: {
        backgroundColor: "#E8E4DA",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 5,
    },

    mainBadgeText: {
        fontSize: 12,
        color: "#6A7B68",
        fontWeight: "600",
    },

    name: {
        marginTop: 10,
        color: "#fff",
        fontSize: 22,
        fontWeight: "600",
    },

    phone: {
        marginTop: 4,
        color: "#fff",
        fontSize: 12,
    },

    address: {
        marginTop: 8,
        color: "#fff",
        fontSize: 11,
        lineHeight: 16,
    },

    editButton: {
        alignSelf: "center",
        marginTop: 18,
        backgroundColor: "#E8E4DA",
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 10,
    },

    editButtonText: {
        color: "#6A7B68",
        fontWeight: "600",
        fontSize: 12,
    },

    bottomContainer: {
        flex: 1,
        justifyContent: "flex-end",
        marginTop: 20,
        // paddingBottom: 10,
    },

    selectButton: {
        backgroundColor: "#AAB8A0",
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
    },

    selectButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});