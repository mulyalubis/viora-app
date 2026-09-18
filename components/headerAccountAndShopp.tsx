import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HeaderAccountAndShopp({ cartCount, user }: { cartCount: number, user?: any }) {
    return (
        <View style={styles.viewAccount}>
            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, }}>
                {user?.image ? (
                    <Image
                        source={{ uri: user.image }}
                        style={styles.avatar}
                    />
                ) : (
                    <Ionicons name="person-circle-outline" size={38} />
                )}
                <Text style={styles.textSize}>{user?.name ?? "Pengguna"}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("../shopp/shopping")}>
                <View style={styles.borderShopp}>
                    <MaterialCommunityIcons name="shopping-outline" size={24} color="black" />
                    {cartCount > 0 && (
                        <Text style={styles.cartCount}>{cartCount}</Text>
                    )}
                </View>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    viewAccount: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: "6%",
    },
    textSize: {
        width: "75%",
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
    cartCount: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "red",
        color: "white",
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        fontSize: 12,
    },
    avatar: {
        width: 35,
        height: 35,
        borderRadius: 19,
    }
})