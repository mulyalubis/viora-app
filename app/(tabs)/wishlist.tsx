import HeaderAccountAndShopp from "@/components/headerAccountAndShopp";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "convex/react";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../convex/_generated/api";
import { useCartStore } from "../../store/shoppStore";

export default function Wishlist() {
    const [savedEmail, setSavedEmail] = useState<string | null>(null);
    const addToCart = useCartStore((state) => state.addToCart);
    const toggleWishlistMutation = useMutation(api.wishlist.toggleWishlist);
    const [isLoadingEmail, setIsLoadingEmail] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const getEmail = async () => {
                setIsLoadingEmail(true);
                const email = await AsyncStorage.getItem("userEmail");
                console.log("AMBIL EMAIL:", email);
                setSavedEmail(email);
                setIsLoadingEmail(false);
            };

            getEmail();
        }, [])
    );

    // 2. Ambil data user dari Convex
    const userData = useQuery(
        api.users.getUserByEmail,
        savedEmail ? { email: savedEmail } : "skip"
    );

    // 3. Ambil data Wishlist dari Convex berdasarkan ID User
    // Kita kirim undefined jika userData belum siap agar tidak error TS
    const wishlist = useQuery(
        api.wishlist.getMyWishlist,
        userData && savedEmail
            ? { userId: userData._id }
            : "skip"
    );

    const cart = useQuery(
        api.cart.getMyCart,
        userData ? { userId: userData._id } : "skip"
    );

    const totalCart = cart?.reduce((total, item) => {
        return total + item.quantity;
    }, 0) ?? 0;

    const handleToggleWishlist = async (item: any) => {
        if (!userData || !userData._id) return;

        await toggleWishlistMutation({
            userId: userData._id,
            productId: item.productId || item._id,
            name: item.name,
            price: item.price,
            image: item.image
        });
    };



    console.log("EMAIL SEKARANG:", savedEmail);
    console.log("USER DATA:", userData);

    if (!savedEmail) {
        return (
            <View style={styles.view}>
                <HeaderAccountAndShopp cartCount={totalCart} user={userData} />
                <Text style={{ textAlign: "center", marginTop: "50%" }}>
                    Harus login terlebih dahulu
                </Text>
            </View>
        );
    }

    if (isLoadingEmail) {
        return (
            <View style={styles.view}>
                <HeaderAccountAndShopp cartCount={totalCart} user={userData} />
                <ActivityIndicator size="large" style={{ marginTop: "50%" }} />
            </View>
        );
    }

    if (userData === undefined) {
        return (
            <View style={styles.view}>
                <HeaderAccountAndShopp cartCount={totalCart} user={userData} />
                <ActivityIndicator size="large" color="#92A390" style={{ marginTop: "50%" }} />
            </View>
        );
    }

    if (wishlist === undefined) {
        return (
            <View style={styles.view}>
                <HeaderAccountAndShopp cartCount={totalCart} user={userData} />
                <ActivityIndicator size="large" color="#92A390" style={{ marginTop: "50%" }} />
            </View>
        );
    }

    if (wishlist.length === 0) {
        return (
            <View style={styles.view}>
                <HeaderAccountAndShopp cartCount={totalCart} user={userData} />
                <Text style={{ textAlign: "center", marginTop: "50%", fontSize: 16 }}>
                    Wishlist Anda masih kosong
                </Text>
            </View>
        );
    }


    return (
        <View style={styles.view}>
            <HeaderAccountAndShopp cartCount={totalCart} user={userData} />
            <FlatList
                data={wishlist}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.productContainer}
                renderItem={({ item }) => (
                    <View style={styles.productItem}>
                        <Image source={{ uri: item.image }} style={styles.image} />
                        <View style={{ flex: 1, justifyContent: "space-between" }}>
                            <View style={styles.nameAndFavorit}>
                                <Text style={{ fontSize: 14, width: "50%" }}>{item.name}</Text>
                                <TouchableOpacity onPress={() => handleToggleWishlist(item)}>
                                    <FontAwesome
                                        name={wishlist.find((w: any) => w._id === item._id) ? "heart" : "heart-o"}
                                        size={24}
                                        color={wishlist.find((w: any) => w._id === item._id) ? "red" : "black"}
                                    />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.labelAndShopping}>
                                <Text>Rp {item.price.toLocaleString("id-ID")}</Text>
                                <TouchableOpacity onPress={() => addToCart(item)}>
                                    <MaterialCommunityIcons name="shopping-outline" size={24} color="black" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>

    );
}

const styles = StyleSheet.create({
    view: {
        flex: 1,
        paddingTop: 50,
        width: "100%",
        backgroundColor: "#E3DFD3"
    },
    viewAccount: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: "6%",
    },
    textSize: {
        width: "60%",
        fontSize: 17,
        textTransform: "capitalize",
    },
    borderShopp: {
        width: 38,
        height: 38,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    productItem: {
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        height: 150,
        margin: 10,
        borderRadius: 10,
        paddingVertical: "2%",
        paddingHorizontal: "2%",
    },
    productContainer: {
        marginVertical: "5%",
        paddingBottom: 120,
        marginHorizontal: "6%",
    },
    image: {
        position: "absolute",
        left: 110,
        top: 25,
        width: "45%",
        height: "80%",
        borderRadius: 10,
        resizeMode: "cover"
    },
    nameAndFavorit: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    labelAndShopping: {
        marginHorizontal: "2.5%",
        paddingHorizontal: "2%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#E3DFD3",
        width: "40%",
        height: "25%",
        borderRadius: 10,
    },
});