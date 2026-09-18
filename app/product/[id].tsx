import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";



export default function ProductDetail() {
    const [expanded, setExpanded] = useState(false);
    const { id } = useLocalSearchParams<{ id: string }>();

    const product = useQuery(api.product.getProductById, {
        id: id as Id<"products">,
    });

    const stock = useQuery(api.product.getStockById, {
        productId: id as Id<"products">,
    })

    const [savedEmail, setSavedEmail] = useState<string | null>(null);
    const addToCartMutation = useMutation(api.cart.addToCart);

    const addReviewMutation = useMutation(api.review.addReview);

    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(5);

    useEffect(() => {
        const getEmail = async () => {
            const email = await AsyncStorage.getItem("userEmail");
            setSavedEmail(email);
        };
        getEmail();
    }, []);

    const userData = useQuery(
        api.users.getUserByEmail,
        savedEmail ? { email: savedEmail } : "skip"
    );

    const wishlist = useQuery(
        api.wishlist.getMyWishlist,
        userData ? { userId: userData._id } : "skip"
    );

    const toggleWishlistMutation = useMutation(api.wishlist.toggleWishlist);

    const isWishlisted =
        wishlist && product
            ? wishlist.some((w) => w.productId === product._id.toString())
            : false;


    const handleToggleWishlist = async () => {
        if (!userData || !product) return;

        await toggleWishlistMutation({
            userId: userData._id,
            productId: product._id.toString(),
            name: product.name,
            price: product.price,
            image: product.image,
        });
    };

    const reviews = useQuery(
        api.review.getReviewsByProduct,
        product ? { productId: product._id } : "skip"
    );

    const avgRating =
        reviews && reviews.length > 0
            ? (
                reviews.reduce((sum, r) => sum + r.rating, 0) /
                reviews.length
            ).toFixed(1)
            : "0.0";

    if (product === undefined) {
        return <Text>Loading...</Text>;
    }

    if (!product) {
        return <Text>Product tidak ditemukan</Text>;
    }

    const fullDescription = product.description ?? "";

    const shortDescription =
        fullDescription.length > 150
            ? fullDescription.substring(0, 95) + "..."
            : fullDescription;

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ flexGrow: 1 }}
                >

                    {/* SCROLL CONTENT */}
                    <ScrollView showsVerticalScrollIndicator={false}>

                        {/* IMAGE */}
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: product.detailImage }}
                                style={styles.image}
                            />

                            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={24} />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.favoriteBtn} onPress={handleToggleWishlist}>
                                <FontAwesome
                                    name={isWishlisted ? "heart" : "heart-o"}
                                    size={24}
                                    color={isWishlisted ? "red" : "black"}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* CONTENT */}
                        <View style={styles.content}>
                            <View>
                                <Text style={styles.title}>
                                    {product.name}
                                </Text>

                                {/* RATING + STOCK */}
                                <View style={styles.row}>

                                    <Text style={styles.subtitle}>
                                        {product.name} • {product.brand}
                                    </Text>

                                    <View style={styles.ratingAndStockContainer}>
                                        <View style={styles.rating}>
                                            <FontAwesome name="star" size={18} color="#FFD700" />
                                            <Text style={{ fontSize: 16, marginLeft: 4 }}>{avgRating}</Text>
                                            {/* ini masukkan ke dalam data convex table product rating */}
                                        </View>

                                        <View style={styles.stock}>
                                            <Text style={{ color: "#fff" }}>{product.stock} Stock</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* PRICE */}
                                <Text style={styles.price}>Rp {product.price.toLocaleString("id-ID")}</Text>
                            </View>

                            <View style={{ width: "100%", height: 2, backgroundColor: "#000" }}></View>

                            <View>
                                {/* DESCRIPTION */}
                                <Text style={styles.sectionTitle}>Deskripsi</Text>
                                <Text style={styles.desc}>
                                    {expanded ? product.description : shortDescription}
                                </Text>

                                {fullDescription.length > 150 && (
                                    <TouchableOpacity
                                        style={{
                                            width: "25%",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            position: "relative",
                                            left: 265,
                                        }}
                                        onPress={() => setExpanded(!expanded)}
                                    >
                                        <Text style={styles.readMore}>
                                            {expanded ? "Read Less" : "Read More"}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={{ width: "100%", height: 2, backgroundColor: "#000" }}></View>

                            {/* REVIEW */}
                            <View style={styles.reviewHeader}>
                                <Text>⭐ {avgRating} ({reviews?.length} Ulasan)</Text>
                                <TouchableOpacity
                                    onPress={() =>
                                        router.push({
                                            pathname: "/reviews/[id]",
                                            params: { id: product._id.toString() },
                                        })
                                    }
                                >
                                    <Text>Lihat Semua ›</Text>
                                </TouchableOpacity>
                            </View>

                            <View>
                                {reviews?.slice(0, 2).map((review) => (
                                    <View key={review._id} style={{ padding: 10, gap: 5 }}>
                                        <Text>"{review.comment}"</Text>
                                        <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center" }}>
                                            <Text style={{ marginRight: 10 }}>{review.userName}</Text>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <TouchableOpacity key={star} disabled>
                                                    <FontAwesome
                                                        name={star <= review.rating ? "star" : "star-o"}
                                                        size={22}
                                                        color="#FFD700"
                                                        style={{ marginRight: 5 }}
                                                    />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <View>
                                {userData && (
                                    <View style={{ marginTop: 20 }}>
                                        <Text>Tulis Ulasan</Text>

                                        <View style={{ flexDirection: "row", marginTop: 10 }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                                    <FontAwesome
                                                        name={star <= rating ? "star" : "star-o"}
                                                        size={22}
                                                        color="#FFD700"
                                                        style={{ marginRight: 5 }}
                                                    />
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        <TextInput
                                            placeholder="Komentar..."
                                            value={comment}
                                            onChangeText={setComment}
                                            style={{
                                                borderWidth: 1,
                                                padding: 10,
                                                borderRadius: 10,
                                                marginTop: 10,
                                            }}
                                        />

                                        <TouchableOpacity
                                            style={{
                                                backgroundColor: "#000",
                                                padding: 12,
                                                marginTop: 10,
                                                borderRadius: 10,
                                            }}
                                            onPress={async () => {
                                                try {
                                                    await addReviewMutation({
                                                        productId: product._id,
                                                        userId: userData._id,
                                                        userName: userData.name,
                                                        rating,
                                                        comment,
                                                    });

                                                    setComment("");
                                                } catch (err: any) {
                                                    const message = err?.message;

                                                    if (message === "COMMENT_EMPTY") {
                                                        ToastAndroid.show("Komentar tidak boleh kosong", ToastAndroid.SHORT);

                                                    } else if (message === "INVALID_RATING") {
                                                        ToastAndroid.show("Rating harus 1 - 5", ToastAndroid.SHORT);

                                                    } else if (message === "ALREADY_REVIEWED") {
                                                        ToastAndroid.show("Kamu sudah memberi ulasan", ToastAndroid.SHORT);

                                                    } else {
                                                        ToastAndroid.show("Terjadi kesalahan", ToastAndroid.SHORT);
                                                        console.log(err);
                                                    }
                                                }
                                            }}
                                        >
                                            <Text style={{ color: "#fff", textAlign: "center" }}>
                                                Kirim Ulasan
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                        </View>
                    </ScrollView>

                    {/* BOTTOM BUTTON */}


                </ScrollView>

                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={async () => {
                            if (!userData) return;

                            const result = await addToCartMutation({
                                userId: userData._id,
                                productId: product._id,
                                name: product.name,
                                price: product.price,
                                image: product.image,
                                brand: product.brand,
                            });

                            if (!result.success) {
                                alert(result.message);
                            }
                        }}
                    >
                        <Text style={{ color: "#fff", fontSize: 16 }}>
                            Tambah ke Keranjang
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        height: 320,
        position: "relative",
    },
    image: {
        width: "100%",
        height: "107%",
        resizeMode: "cover",
    },
    backBtn: {
        position: "absolute",
        top: 50,
        left: 20,
        backgroundColor: "rgba(255,255,255,0.8)",
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
    },
    favoriteBtn: {
        position: "absolute",
        top: 50,
        right: 20,
        backgroundColor: "rgba(255,255,255,0.8)",
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 20,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 90,
        borderRadius: 25,
        backgroundColor: "#fff",
        height: "100%"
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        width: "55%"
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    ratingAndStockContainer: {
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 7,
    },
    rating: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff3cd",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        width: "56.5%",
    },
    stock: {
        marginLeft: 10,
        backgroundColor: "green",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    price: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#e63946",
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 15,
    },
    desc: {
        fontSize: 15,
        color: "#444",
        marginBottom: 10,
    },
    bullet: {
        fontSize: 15,
        marginLeft: 10,
        marginBottom: 5,
        color: "#444",
    },
    readMore: {
        // alignSelf: "flex-end",
        color: "#e63946",
        fontWeight: "bold",
        marginTop: 5,
        marginBottom: 10,
    },
    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 30,
        marginBottom: 15,
    },
    reviewText: {
        fontSize: 15,
        marginBottom: 10,
    },
    reviewUser: {
        fontWeight: "bold",
    },
    bottomBar: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
    },
    button: {
        backgroundColor: "#000",
        height: 50,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
    },
});