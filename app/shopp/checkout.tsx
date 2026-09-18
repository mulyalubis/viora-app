import { STORE_LOCATION } from "@/constant/storeLocation";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useAction, useMutation, useQuery } from "convex/react";
import Constants from "expo-constants";
import { router } from "expo-router";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, LayoutAnimation, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { WebView } from 'react-native-webview';
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { useAuthStore } from "../../store/authStore";

const { width } = Dimensions.get("window");


export default function Checkout() {
    const selectedAddress = useAuthStore((state) => state.selectedAddress);
    const setSelectedAddress = useAuthStore((state) => state.setSelectedAddress);

    const addToCart = useMutation(api.cart.addToCart);
    const decreaseQty = useMutation(api.cart.decreaseQty);
    const removeItem = useMutation(api.cart.removeItem);

    const savedEmail = useAuthStore((state) => state.userEmail);

    const [promoInput, setPromoInput] = useState("");
    const [activePromo, setActivePromo] = useState<Doc<"promos"> | null>(null);
    const promoData = useQuery(api.promos.checkPromo, { code: promoInput });

    const [showModal, setShowModal] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState('');
    const startPayment = useAction(api.midtrans.createTransaction);
    const saveOrder = useMutation(api.orders.createOrder);
    const [currentOrderId, setCurrentOrderId] = useState("");
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentUrl, setSelectedPaymentUrl] = useState("");
    const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

    const createOrderItems = useMutation(api.orderItems.createOrderItems);


    const handleApplyPromo = () => {
        if (promoData) {
            setActivePromo(promoData);
            // Hitung diskon untuk alert
            const nominalDiskon = (promoData.percentage / 100) * subtotal;

            alert(`Berhasil! Diskon ${promoData.percentage}% (Rp ${nominalDiskon.toLocaleString("id-ID")}) terpasang.`);
        } else {
            alert("Kode promo tidak valid.");
            setActivePromo(null);
        }
    };

    const getDistanceAndDuration = async () => {
        const origin =
            `${STORE_LOCATION.latitude},${STORE_LOCATION.longitude}`;

        const destination =
            `${selectedAddress?.latitude},${selectedAddress?.longitude}`;

        const apiKey =
            Constants.expoConfig?.extra?.googleMapsApiKey;

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`
        );

        const data = await response.json();

        if (!data.routes.length) {
            return {
                distance: 0,
                duration: 0,
            };
        }

        const leg = data.routes[0].legs[0];

        return {
            distance: leg.distance.value / 1000,
            duration: leg.duration.value / 60,
        };
    };

    const handleCheckout = async () => {

        if (isLoadingCheckout) return;

        setIsLoadingCheckout(true);

        try {

            if (selectedOption === 'Pilih status') {
                alert("Pilih status barang!");
                return;
            }

            if (!selectedAddress) {
                alert("Silakan pilih alamat terlebih dahulu!");
                return;
            }

            if (!userData?._id || !cart) return;

            if (!stockCheck?.success) {
                alert(stockCheck?.message);
                return;
            }

            const generatedOrderId = `VIORA-${Date.now()}`;

            setCurrentOrderId(generatedOrderId);
            setIsCheckingPayment(true);

            const itemsForMidtrans = cart.map((item) => ({
                id: item.productId.toString(),
                price: item.price,
                quantity: item.quantity,
                name: item.name.substring(0, 50),
            }));

            if (activePromo && finalDiscount > 0) {
                itemsForMidtrans.push({
                    id: "PROMO-DISCOUNT",
                    price: -Math.round(finalDiscount),
                    quantity: 1,
                    name: `Promo: ${activePromo.code}`,
                });
            }

            const routeInfo =
                await getDistanceAndDuration();

            const url = await startPayment({
                amount: finalTotal,
                orderId: generatedOrderId,
                customerName: userData.name || "Customer",
                items: itemsForMidtrans,
                userId: userData._id,
                deliveryMethod: selectedOption,
                address: selectedAddress?.fullAddress || "",
                receiverName: selectedAddress?.receiverName || "",
                phoneNumber: selectedAddress?.phoneNumber || "",
                brands: [...new Set(cart.map((item) => item.brand))],
                customerLatitude: selectedAddress.latitude,
                customerLongitude: selectedAddress.longitude,
                estimatedDistance: routeInfo.distance,
                estimatedDuration: routeInfo.duration,
            });

            const orderId = await saveOrder({
                orderId: generatedOrderId,
                userId: userData._id,
                address: selectedAddress.fullAddress,
                amount: finalTotal,
                deliveryMethod: selectedOption,
                snapToken: "",
                paymentUrl: url,
                totalItems: totalCart,
                receiverName: selectedAddress.receiverName,
                phoneNumber: selectedAddress.phoneNumber,
                brands: [...new Set(cart.map((item) => item.brand))],
                customerLatitude: selectedAddress.latitude,
                customerLongitude: selectedAddress.longitude,
                estimatedDistance: routeInfo.distance,
                estimatedDuration: routeInfo.duration,
            });

            await createOrderItems({
                orderId,
                items: cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })),
            });

            setPaymentUrl(url);
            setShowModal(true);

        } catch (error) {

            console.log(error);

        } finally {

            setIsLoadingCheckout(false);

        }
    };

    const orderStatus = useQuery(
        api.orders.getOrderById,
        currentOrderId ? { orderId: currentOrderId } : "skip"
    );

    useEffect(() => {
        if (!orderStatus || !isCheckingPayment) return;

        if (orderStatus.status === "settlement") {
            alert("Pembayaran berhasil!");
            setShowModal(false);
            setIsCheckingPayment(false);
            router.replace("/product");
        }

        if (orderStatus.status === "expired") {
            alert("Pembayaran expired!");
            setShowModal(false);
            setIsCheckingPayment(false);
        }
    }, [orderStatus, isCheckingPayment]);

    const userData = useQuery(
        api.users.getUserByEmail,
        savedEmail ? { email: savedEmail } : "skip"
    );

    const cart = useQuery(
        api.cart.getMyCart,
        userData?._id ? { userId: userData._id } : "skip"
    );

    const addressData = useQuery(
        api.address.getMyAddress,
        userData
            ? { userId: userData._id }
            : "skip"
    );

    const stockCheck = useQuery(
        api.stock.checkCartStock,
        cart
            ? {
                items: cart.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            }
            : "skip"
    );

    useEffect(() => {

        if (!addressData) return;

        const primaryAddress =
            addressData.find(
                (item) => item.isPrimary
            );

        if (!selectedAddress) {

            if (primaryAddress) {

                setSelectedAddress(primaryAddress);

            } else if (addressData.length > 0) {

                setSelectedAddress(addressData[0]);
            }
        }

    }, [addressData]);

    const myLocation = {
        latitude:
            selectedAddress?.latitude ||
            5.541131819683702,

        longitude:
            selectedAddress?.longitude ||
            95.34667698114097,

        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    };

    const subtotal = (cart ?? []).reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    const totalCart = cart?.reduce((total, item) => {
        return total + item.quantity;
    }, 0) ?? 0;

    const finalDiscount = activePromo
        ? (activePromo.percentage / 100) * subtotal
        : 0;

    const finalTotal = subtotal - finalDiscount;

    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('Pilih status');

    const options = ['Pengiriman', 'Ambil Sendiri'];

    const toggleDropdown = () => {
        // Memberikan efek transisi halus saat list muncul
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen(!isOpen);
    };



    return (
        <View style={styles.view}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Checkout</Text>
            </View>
            <TouchableOpacity style={styles.addressUser} onPress={() =>
                router.push({
                    pathname: "/afterLoginUser/address",
                    params: {
                        from: "checkout",
                    },
                })
            }>
                <View style={{ width: "100%" }}>
                    <Text style={{ paddingBottom: 15, textAlign: "left", paddingLeft: 7 }}>Alamat Pengiriman</Text>
                    <View style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start", gap: 10 }}>
                        <View style={{ borderRadius: 10, overflow: "hidden" }}>
                            <MapView
                                provider={PROVIDER_GOOGLE} // Pakai Google Maps
                                style={styles.map}
                                initialRegion={myLocation}
                            >
                                {/* Menampilkan titik merah di lokasi tersebut */}
                                <Marker
                                    coordinate={{
                                        latitude: myLocation.latitude,
                                        longitude: myLocation.longitude
                                    }}
                                    title={"Lokasi Terpilih"}
                                    description={"Banda Aceh, Indonesia"}
                                />
                            </MapView>
                        </View>
                        <View style={{ marginTop: "2%", gap: 7 }}>
                            <Text style={{ color: "#92A390" }}>{selectedAddress?.labelAddress || "Alamat"}</Text>
                            <Text>{selectedAddress?.receiverName || "-"}</Text>

                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10, width: "77%" }}>
                                <Text style={{ width: "85%" }}>{selectedAddress?.fullAddress || "Belum Memilih Alamat"}</Text>
                                <Ionicons name="chevron-forward" size={24} color="black" />
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
            <View style={{ flex: 1, width: "90%", alignItems: "flex-start" }}>
                <Text style={{ color: "#000000", marginTop: 15, textAlign: "left", paddingLeft: 7 }}>Produk ({cart?.length ?? 0} items)</Text>
                <View style={{ height: "80%", width: "100%", marginTop: 5 }}>
                    <FlatList
                        data={cart}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.productContainer}
                        renderItem={({ item }) => (
                            <View style={styles.productItem}>
                                <Image source={{ uri: item.image }} style={{ width: 60, height: 60 }} />
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={{ width: 150, marginBottom: 5 }}>{item.name}</Text>
                                    <Text>Rp {item.price.toLocaleString("id-ID")}</Text>
                                </View>
                                <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-end", gap: 10 }}>
                                    <TouchableOpacity style={{ marginRight: 8 }} onPress={() => {
                                        if (!userData) return;

                                        removeItem({
                                            userId: userData._id,
                                            productId: item.productId,
                                        });
                                    }}>
                                        <FontAwesome5 name="trash" size={20} color="black" />
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 }}>
                                        <TouchableOpacity style={styles.button} onPress={() => {
                                            if (!userData) return;

                                            decreaseQty({
                                                userId: userData._id,
                                                productId: item.productId,
                                            });
                                        }}>
                                            <FontAwesome5 name="minus" size={16} color="white" />
                                        </TouchableOpacity>
                                        <Text style={{ fontSize: 18 }}>{item.quantity ?? 1}</Text>
                                        <TouchableOpacity style={styles.button} onPress={async () => {
                                            if (!userData) return;

                                            const result = await addToCart({
                                                userId: userData._id,
                                                productId: item.productId,
                                                name: item.name,
                                                price: item.price,
                                                image: item.image,
                                                brand: item.brand,
                                            });

                                            if (!result.success) {
                                                alert(result.message);
                                            }
                                        }}>
                                            <FontAwesome5 name="plus" size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}
                    />
                </View>
            </View>
            <View style={{ width: "75%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 2, padding: 10, borderRadius: 10, backgroundColor: "#92A390", marginTop: 15 }}>
                <TextInput
                    style={{ padding: 10, width: "68%" }}
                    placeholder="Promo Code..."
                    value={promoInput}
                    onChangeText={setPromoInput}
                />
                <TouchableOpacity onPress={handleApplyPromo} style={{ padding: 5, paddingHorizontal: 20, borderRadius: 5, backgroundColor: "black" }}>
                    <Text style={{ fontSize: 16, color: "#fff" }}>Apply</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.total}>
                <Text style={{ fontSize: 17, fontWeight: "bold" }}>
                    Subtotal:
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    ({totalCart ?? 0} item)  Rp {subtotal.toLocaleString("id-ID")}
                </Text>
            </View>
            <View style={styles.discount}>
                <Text style={{ fontSize: 17, fontWeight: "bold" }}>Total Akhir:</Text>
                <View style={{ alignItems: 'flex-end' }}>
                    {activePromo && (
                        <Text style={{ color: 'red', fontSize: 14 }}>
                            - Rp {finalDiscount.toLocaleString("id-ID")}
                        </Text>
                    )}
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: "#92A390" }}>
                        Rp {finalTotal.toLocaleString("id-ID")}
                    </Text>
                </View>
            </View>
            <View style={styles.infoDelivery}>
                <Text style={{ fontSize: 17, fontWeight: "bold", textTransform: "capitalize", alignSelf: "flex-start" }}>
                    status barang:
                </Text>
                <View style={{ width: "40%", alignItems: "flex-end" }}>
                    <TouchableOpacity
                        style={styles.headers}
                        onPress={toggleDropdown}
                        activeOpacity={0.7}
                    >
                        <Text style={{ paddingBottom: 15, fontWeight: "bold", fontSize: 16 }}>{selectedOption}</Text>

                        {/* Icon yang berubah berdasarkan state */}
                        {isOpen ? (
                            <ChevronDown size={20} color="black" style={{ marginTop: 4 }} />
                        ) : (
                            <ChevronRight size={20} color="black" style={{ marginTop: 3 }} />
                        )}
                    </TouchableOpacity>

                    {/* Daftar Opsi yang muncul saat isOpen = true */}
                    {isOpen && (
                        <View style={styles.list}>
                            {options.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.option}
                                    onPress={() => {
                                        setSelectedOption(item);
                                        setIsOpen(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </View>
            <View style={{ justifyContent: "center", alignItems: "center", width: width * 0.89, height: 50, backgroundColor: "#92A390", borderRadius: 50, marginBottom: 10 }}>
                <TouchableOpacity
                    onPress={handleCheckout}
                    disabled={isLoadingCheckout}
                >
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                        {isLoadingCheckout
                            ? "Memproses..."
                            : "Lanjutkan ke Pembayaran"}
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal visible={showModal} animationType="slide">
                <View style={{ flex: 1 }}>
                    {/* Header Pop-up */}
                    <View style={{ height: 80, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, borderBottomWidth: 1, borderColor: '#ddd' }}>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                            <Text style={{ color: 'red', fontWeight: 'bold' }}>Tutup</Text>
                        </TouchableOpacity>
                        <Text style={{ marginLeft: 70, fontWeight: 'bold' }}>Pembayaran Midtrans</Text>
                    </View>

                    {/* WebView Midtrans */}
                    <WebView
                        source={{ uri: paymentUrl }}
                        javaScriptEnabled
                        domStorageEnabled
                        originWhitelist={['*']}
                        startInLoadingState
                        style={{ flex: 1 }}
                    />
                </View>
            </Modal>

            <Modal visible={showPaymentModal} animationType="slide">
                <View style={{ flex: 1 }}>

                    <View
                        style={{
                            height: 80,
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 20,
                            paddingTop: 20,
                            borderBottomWidth: 1,
                            borderColor: "#ddd",
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => setShowPaymentModal(false)}
                        >
                            <Text
                                style={{
                                    color: "red",
                                    fontWeight: "bold",
                                }}
                            >
                                Tutup
                            </Text>
                        </TouchableOpacity>

                        <Text
                            style={{
                                marginLeft: 70,
                                fontWeight: "bold",
                            }}
                        >
                            Pembayaran Midtrans
                        </Text>
                    </View>

                    <WebView
                        source={{ uri: selectedPaymentUrl }}
                        javaScriptEnabled
                        domStorageEnabled
                        originWhitelist={["*"]}
                        startInLoadingState
                        style={{ flex: 1 }}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    view: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 50,
        backgroundColor: "#E3DFD3",
    },
    header: {
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexDirection: "row",
        width: "90%",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        paddingRight: "38%",
        color: "#92A390",
    },
    addressUser: {
        marginTop: 15,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "column",
        width: "90%",
    },
    map: {
        width: width * 0.36,
        height: width * 0.30,
    },
    productContainer: {
        paddingBottom: 25,
    },
    productItem: {
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#fff",
        width: "95%",
        margin: 7,
        borderRadius: 10,
        paddingVertical: "2%",
        paddingHorizontal: "2%",
    },
    button: {
        backgroundColor: "#92A390",
        padding: 10,
        borderRadius: "50%",
    },
    total: {
        width: "90%",
        paddingVertical: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: "2%",
        marginTop: 30,
    },
    discount: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: "2%",
        marginBottom: 10
    },
    infoDelivery: {
        width: "90%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: "2%",
    },

    // Bagian untuk Custom Dropdown
    headers: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600'
    },
    list: {
        backgroundColor: '#fafafa',
        borderRadius: 15,
        borderColor: "#92A390"
    },
    option: {
        padding: 8,
    },
    optionText: {
        fontSize: 14,
        color: '#333',
    },
});
