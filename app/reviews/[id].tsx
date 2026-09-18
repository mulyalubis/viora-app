import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { router, useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";


export default function ReviewPage() {
    const params = useLocalSearchParams();
    const productId = Array.isArray(params.id) ? params.id[0] : params.id;

    const reviews = useQuery(
        api.review.getReviewsByProduct,
        productId ? { productId: productId as Id<"products"> } : "skip"
    );

    if (!reviews) return <Text>Loading...</Text>;

    return (
        <View>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} />
            </TouchableOpacity>
            <FlatList
                data={reviews}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={{ padding: 15 }}>
                        <Text>{item.comment}</Text>
                        <Text>{item.userName} ⭐ {item.rating}</Text>
                    </View>
                )}
            />

        </View>

    );
}

const styles = StyleSheet.create({
    backBtn: {
        position: "absolute",
        top: 60,
        left: 20,
        zIndex: 10,
    },
    view: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
    },
    searchBar: {
        flex: 1,
        backgroundColor: "#f1f5f9",
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 14,
    },
    icon: {
        marginRight: 12,
        marginTop: 18,
    },
    filterContainer: {
        marginTop: 15,
    },
    filterText: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#f1f5f9",
        marginRight: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    activeFilter: {
        backgroundColor: "#8e7cc3",
        borderColor: "#8e7cc3",
    },
    productContainer: {
        paddingTop: 15,
        paddingHorizontal: 12,
        gap: 12,
    },
    product: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    image: {
        width: "100%",
        aspectRatio: 1,
        resizeMode: "contain",
        borderRadius: 8,
        marginBottom: 10,
    },
    name: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 2,
    },
    price: {
        fontSize: 14,
        fontWeight: "600",
        color: "#8e7cc3",
        marginBottom: 8,
    },
    reviewHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
});
