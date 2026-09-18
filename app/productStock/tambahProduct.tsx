import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../convex/_generated/api";
import { uploadImage } from "../../utils/uploadImage";

export default function TambahProduct() {

    const [image, setImage] = useState<string | null>(null);

    const [detailImage, setDetailImage] = useState<string | null>(null);

    const [name, setName] = useState("");

    const [brand, setBrand] = useState("");

    const [price, setPrice] = useState("");

    const [stock, setStock] = useState("");

    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);

    const pickImage = async (
        type: "image" | "detailImage"
    ) => {

        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            alert("Izin galeri diperlukan");
            return;
        }

        const result =
            await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

        if (!result.canceled) {

            if (type === "image") {
                setImage(result.assets[0].uri);
            } else {
                setDetailImage(result.assets[0].uri);
            }

        }
    };

    const createProduct = useMutation(
        api.product.createProduct
    );

    const handleSave = async () => {
        if (!image || !detailImage) {
            alert("Silakan pilih kedua gambar.");
            return;
        }

        if (
            !name.trim() ||
            !brand.trim() ||
            !price.trim() ||
            !stock.trim() ||
            !description.trim()
        ) {
            alert("Semua data harus diisi.");
            return;
        }

        try {
            setLoading(true);

            const imageUrl = await uploadImage(image);
            const detailImageUrl = await uploadImage(detailImage);

            console.log("imageUrl =", imageUrl);
            console.log("detailImageUrl =", detailImageUrl);

            const payload = {
                name: name.trim(),
                brand: brand.trim(),
                description: description.trim(),
                price: Number(price),
                sold: Number(0),
                stock: Number(stock),
                image: imageUrl,
                detailImage: detailImageUrl,
            };

            console.log("payload =", payload);

            await createProduct(payload);

            alert("Berhasil");
            router.back();

        } catch (err) {
            console.log("ERROR =", err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: "#E5E1D1" }}
            edges={["bottom"]}
        >

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : "height"
                }
            >

                <View style={styles.container}>

                    {/* Header */}

                    <View style={styles.header}>

                        <TouchableOpacity
                            onPress={() => router.back()}
                        >

                            <Ionicons
                                name="chevron-back"
                                size={24}
                                color="black"
                            />

                        </TouchableOpacity>

                        <Text style={styles.title}>
                            Tambah Product
                        </Text>

                        <View style={{ width: 24 }} />

                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: 30,
                        }}
                    >

                        {/* Image */}

                        <View style={styles.formCard}>

                            <Text style={styles.label}>
                                Product Image
                            </Text>

                            <TouchableOpacity
                                style={styles.imagePicker}
                                onPress={() => pickImage("image")}
                            >

                                {
                                    image ?

                                        <Image
                                            source={{
                                                uri: image,
                                            }}
                                            style={styles.preview}
                                        />

                                        :

                                        <View
                                            style={{
                                                alignItems: "center",
                                            }}
                                        >

                                            <Ionicons
                                                name="image-outline"
                                                size={55}
                                                color="#92A390"
                                            />

                                            <Text style={styles.pickText}>
                                                Pilih Gambar
                                            </Text>

                                        </View>

                                }

                            </TouchableOpacity>

                        </View>

                        <View style={styles.formCard}>

                            <Text style={styles.label}>
                                Detail Product Image
                            </Text>

                            <TouchableOpacity
                                style={styles.imagePicker}
                                onPress={() => pickImage("detailImage")}
                            >

                                {
                                    detailImage ?

                                        <Image
                                            source={{ uri: detailImage }}
                                            style={styles.preview}
                                        />

                                        :

                                        <Text>Pilih Detail Image</Text>

                                }

                            </TouchableOpacity>

                        </View>

                        {/* Nama */}

                        <View style={styles.formCard}>

                            <Text style={styles.label}>
                                Nama Product
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Masukkan nama product"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#999"
                            />

                        </View>

                        {/* Brand */}

                        <View style={styles.formCard}>

                            <Text style={styles.label}>
                                Brand
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Masukkan brand"
                                value={brand}
                                onChangeText={setBrand}
                                placeholderTextColor="#999"
                            />

                        </View>

                        {/* Harga */}

                        <View style={styles.formCard}>

                            <Text style={styles.label}>
                                Harga
                            </Text>

                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="Masukkan harga"
                                value={price}
                                onChangeText={setPrice}
                                placeholderTextColor="#999"
                            />

                        </View>

                        {/* Stock */}

                        <View style={styles.formCard}>

                            <Text style={styles.label}>
                                Stock
                            </Text>

                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                placeholder="Masukkan stock"
                                value={stock}
                                onChangeText={setStock}
                                placeholderTextColor="#999"
                            />

                        </View>

                        {/* Deskripsi */}

                        <View style={styles.formCard}>

                            <Text style={styles.label}>
                                Deskripsi
                            </Text>

                            <TextInput
                                multiline
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Masukkan deskripsi product"
                                placeholderTextColor="#999"
                                style={[
                                    styles.input,
                                    styles.textArea,
                                ]}
                            />

                        </View>

                        {/* Button */}

                        <TouchableOpacity
                            style={[
                                styles.saveButton,
                                loading && { opacity: 0.6 },
                            ]}
                            onPress={handleSave}
                            disabled={loading}
                        >

                            <Text style={styles.saveButtonText}>
                                {loading ? "Menyimpan..." : "Simpan Product"}
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
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 30,
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
    },

    formCard: {
        backgroundColor: "#92A390",
        borderRadius: 20,
        padding: 12,
        marginBottom: 18,
        width: "95%",
        alignSelf: "center",
    },

    label: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 10,
    },

    imagePicker: {
        backgroundColor: "#fff",
        borderRadius: 18,
        height: 180,
        justifyContent: "center",
        alignItems: "center",
    },

    preview: {
        width: "100%",
        height: "100%",
        borderRadius: 18,
        resizeMode: "cover",
    },

    pickText: {
        marginTop: 10,
        fontSize: 16,
        color: "#92A390",
        fontWeight: "600",
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
        minHeight: 100,
        textAlignVertical: "top",
    },

    saveButton: {
        backgroundColor: "#92A390",
        marginHorizontal: 10,
        marginBottom: 25,
        borderRadius: 20,
        paddingVertical: 18,
        alignItems: "center",
    },

    saveButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 18,
    },

});
