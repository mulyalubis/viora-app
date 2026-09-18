import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../convex/_generated/api";
import { useAuthStore } from "../../store/authStore";


export default function shopping() {
    const addToCart = useMutation(api.cart.addToCart);
    const decreaseQty = useMutation(api.cart.decreaseQty);
    const removeItem = useMutation(api.cart.removeItem);

    const savedEmail = useAuthStore((state) => state.userEmail);

    const userData = useQuery(
        api.users.getUserByEmail,
        savedEmail ? { email: savedEmail } : "skip"
    );

    const cart = useQuery(
        api.cart.getMyCart,
        userData?._id ? { userId: userData._id } : "skip"
    );

    const subtotal = (cart ?? []).reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    const totalCart = cart?.reduce((total, item) => {
        return total + item.quantity;
    }, 0) ?? 0;

    if (savedEmail === undefined) {
        return <Text>Loading...</Text>;
    }

    if (savedEmail && userData === undefined) {
        return <Text>Loading user...</Text>;
    }

    if (savedEmail && cart === undefined) {
        return <Text>Loading cart...</Text>;
    }


    return (
        <View style={styles.view}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push("../(tabs)/product")}>
                    <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Keranjang Belanja</Text>
            </View>
            <View style={{ height: "65%", width: "90%" }}>
                <FlatList
                    data={cart}
                    key={savedEmail}
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
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={async () => {
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
                                        }}
                                    >
                                        <FontAwesome5 name="plus" size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                />
            </View>
            <View style={styles.total}>
                <Text style={{ fontSize: 17, fontWeight: "bold" }}>
                    Subtotal:
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    ({totalCart ?? 0} item)  Rp {subtotal.toLocaleString("id-ID")}
                </Text>
            </View>
            <View style={{ justifyContent: "center", alignItems: "center", width: 250, height: 50, backgroundColor: "#92A390", borderRadius: 50, marginTop: "10%" }}>
                <TouchableOpacity onPress={() => router.push("/shopp/checkout")}>
                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>Lanjutkan ke Checkout</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    view: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: "17%",
        backgroundColor: "#E3DFD3",
    },
    header: {
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        width: "90%",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        paddingRight: "25%",
        color: "#92A390",
    },
    productContainer: {
        marginVertical: "5%",
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
        marginTop: 20,
    },
    buttonCheckout: {
        justifyContent: "center",
        alignItems: "center",
        height: 80,
        backgroundColor: "#E3DFD3",
        padding: 10,
        borderRadius: "50%",
    }

});