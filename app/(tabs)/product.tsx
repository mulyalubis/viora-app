import HeaderAccountAndShopp from "@/components/headerAccountAndShopp";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "convex/react";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Animated, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Toast from 'react-native-toast-message';
import BannerCarousel from "../../components/CarouselProduct";
import { api } from "../../convex/_generated/api";



const width = Dimensions.get("window").width;


export default function Product() {
    const [savedEmail, setSavedEmail] = useState<string | null>(null);

    const addToCartMutation = useMutation(api.cart.addToCart);

    const toggleWishlistMutation = useMutation(api.wishlist.toggleWishlist);

    const [selectedBrand, setSelectedBrand] = useState<string>("all");

    const shakeAnimation = useState(new Animated.Value(0))[0];
    const [shakingId, setShakingId] = useState<string | null>(null);


    const userData = useQuery(
        api.users.getUserByEmail,
        savedEmail ? { email: savedEmail } : "skip"
    );

    useFocusEffect(
        useCallback(() => {
            const getEmail = async () => {
                const email = await AsyncStorage.getItem("userEmail");
                console.log("EMAIL PRODUCT:", email);
                setSavedEmail(email);
            };

            getEmail();
        }, [])
    );

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



    const productsQuery = useQuery(api.product.getProducts, {
        brand: selectedBrand === "all" ? undefined : selectedBrand,
    });

    const products = productsQuery ?? [];

    // const brands = [
    //     { label: "All", value: "all" },
    //     { label: "Fix & Lock", value: "fix-and-lock" },
    //     { label: "Skindose", value: "skindose" },
    //     { label: "Makeover", value: "makeover" },
    //     { label: "Lavojoy", value: "lavojoy" },
    //     { label: "Glutawhite", value: "glutawhite" },
    //     { label: "Dazzle Me", value: "dazzle-me" },
    // ];

    const brands = useQuery(api.product.getBrands) ?? [];

    const brandFilters = [
        { label: "All", value: "all" },
        ...brands.map((brand) => ({
            label: brand,
            value: brand,
        })),
    ];

    const shakeCartIcon = (productId: string) => {

        setShakingId(productId);

        Animated.sequence([
            Animated.timing(shakeAnimation, {
                toValue: 8,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: -8,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShakingId(null);
        });
    };

    const toggleWishlist = async (item: any) => {
        if (!userData) return;

        await toggleWishlistMutation({
            userId: userData._id,
            productId: item._id,
            name: item.name,
            price: item.price,
            image: item.image
        });
    };

    const totalCart = cart?.reduce((total, item) => {
        return total + item.quantity;
    }, 0) ?? 0;

    return (
        <View style={styles.view} key={savedEmail}>
            <HeaderAccountAndShopp cartCount={totalCart} user={userData} />
            <BannerCarousel />
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, flexDirection: "row" }}
                >

                    {brandFilters.map((brand) => (
                        <TouchableOpacity
                            key={brand.value}
                            style={[
                                styles.filterText,
                                selectedBrand === brand.value &&
                                styles.activeFilter,
                            ]}
                            onPress={() =>
                                setSelectedBrand(brand.value)
                            }
                        >
                            <Text
                                style={{
                                    color:
                                        selectedBrand === brand.value
                                            ? "#fff"
                                            : "#000",
                                }}
                            >
                                {brand.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <View style={{ flex: 1 }}>
                <FlatList
                    data={products}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    contentContainerStyle={styles.productContainer}
                    renderItem={({ item }) => {
                        const isWishlisted =
                            wishlist && savedEmail
                                ? wishlist.some((w) => w.productId === item._id.toString())
                                : false;

                        return (
                            <TouchableOpacity
                                onPress={() => router.push(`../product/${item._id}`)}
                            >
                                <View style={styles.product}>
                                    <Image source={{ uri: item.image }} style={styles.image} />

                                    <View style={{ flex: 1, justifyContent: "space-between" }}>
                                        <View style={styles.nameAndFavorit}>
                                            <Text style={{ fontSize: 13, width: "50%" }}>
                                                {item.name}
                                            </Text>

                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    toggleWishlist(item);
                                                }}
                                            >
                                                <FontAwesome
                                                    name={isWishlisted ? "heart" : "heart-o"}
                                                    size={24}
                                                    color={isWishlisted ? "red" : "black"}
                                                />
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.labelAndShopping}>
                                            <Text>
                                                Rp {item.price.toLocaleString("id-ID")}
                                            </Text>

                                            <TouchableOpacity
                                                onPress={async () => {
                                                    if (!userData) {

                                                        shakeCartIcon(item._id.toString());

                                                        Toast.show({
                                                            type: "info",
                                                            text1: "Harus Login",
                                                            text2: "Silakan login terlebih dahulu",
                                                            position: "top",
                                                            topOffset: 70,
                                                        });

                                                        return;
                                                    }

                                                    const result = await addToCartMutation({
                                                        userId: userData._id,
                                                        productId: item._id,
                                                        name: item.name,
                                                        price: item.price,
                                                        image: item.image,
                                                        brand: item.brand,
                                                    });

                                                    if (!result.success) {
                                                        Toast.show({
                                                            type: "error",
                                                            text1: "Gagal",
                                                            text2: result.message,
                                                            position: "top",
                                                            topOffset: 70,
                                                        });

                                                        return;
                                                    }

                                                    Toast.show({
                                                        type: "success",
                                                        text1: "Berhasil",
                                                        text2: "Produk ditambahkan ke keranjang",
                                                        position: "top",
                                                        topOffset: 70,
                                                    });
                                                }}
                                            >
                                                <Animated.View
                                                    style={{
                                                        transform: [
                                                            {
                                                                translateX:
                                                                    shakingId === item._id.toString()
                                                                        ? shakeAnimation
                                                                        : 0,
                                                            },
                                                        ],
                                                    }}
                                                >
                                                    <MaterialCommunityIcons
                                                        name="shopping-outline"
                                                        size={24}
                                                        color="black"
                                                    />
                                                </Animated.View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
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
    filterContainer: {
        marginTop: 20,
    },
    filterText: {
        borderWidth: 2,
        borderColor: "#92A390",
        borderRadius: 20,
        textAlign: "center",
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: "#fff",
    },
    activeFilter: {
        backgroundColor: "#92A390",
    },
    productContainer: {
        marginVertical: "5%",
        paddingBottom: 120,
        marginHorizontal: "6%",
    },
    product: {
        position: "relative",
        overflow: "hidden",
        width: (width - 60) / 2,
        height: 150,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
    },
    image: {
        position: "absolute",
        left: 50,
        top: 30,
        width: "80%",
        height: "80%",
        borderRadius: 10,
        resizeMode: "cover"
    },
    nameAndFavorit: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
    },
    labelAndShopping: {
        marginHorizontal: "2.5%",
        paddingHorizontal: "5%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#E3DFD3",
        width: "95%",
        height: "25%",
        borderRadius: 10,
    },
    cartCountNone: {
        display: "none",
        backgroundColor: "white",
    },

})