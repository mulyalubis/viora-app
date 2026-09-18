import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import WebView from "react-native-webview";
import { STORE_LOCATION } from "../../constant/storeLocation";
import { api } from "../../convex/_generated/api";
import { useAuthStore } from "../../store/authStore";


export default function Orders() {
  const savedEmail = useAuthStore((state) => state.userEmail);
  const router = useRouter();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentUrl, setSelectedPaymentUrl] = useState("");

  const [openedOrderId, setOpenedOrderId] =
    useState<string | null>(null);

  const userData = useQuery(
    api.users.getUserByEmail,
    savedEmail ? { email: savedEmail } : "skip"
  );

  const orders = useQuery(
    api.orders.getMyOrdersWithGlobalNumber,
    userData?._id ? { userId: userData._id } : "skip"
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "settlement":
        return "Preparing";
      case "pending":
        return "Waiting for Payment";
      case "expired":
        return "Canceled";
      default:
        return status;
    }
  };

  const storeLocation = {
    latitude: STORE_LOCATION.latitude,
    longitude: STORE_LOCATION.longitude,
  };

  const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Orders</Text>
      </View>

      <FlatList
        data={orders ?? []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {

          const isOpen =
            openedOrderId === item._id;

          return (
            <View>
              <TouchableOpacity
                activeOpacity={0.9}
                style={[
                  styles.card,
                  isOpen && {
                    borderWidth: 2,
                    borderColor: "#000000",
                  }
                ]}
                onPress={() => {

                  if (isOpen) {
                    setOpenedOrderId(null);
                  } else {
                    setOpenedOrderId(item._id);
                  }

                }}
              >

                <View style={styles.row}>
                  <Text style={styles.orderText}>
                    Order #{item.globalOrderNumber}
                  </Text>

                  <Text style={styles.status}>
                    {getStatusText(item.status)}
                  </Text>
                </View>

                <Text style={styles.address}>
                  {item.address}
                </Text>

                <Text style={styles.nameRecipient}>
                  {item.receiverName}
                </Text>

                <View style={styles.divider} />

                <View style={styles.row}>
                  <Text style={styles.productCount}>
                    {item.totalItems ?? 0} Product
                  </Text>

                  <Text style={styles.date}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

              </TouchableOpacity>

              {/* DETAIL CARD */}
              {isOpen && (
                <View style={styles.detailCard}>

                  <View style={styles.headerClose}>
                    <View style={{ flexDirection: "column" }}>
                      <Text style={[styles.orderText, { fontSize: 21 }]}>
                        Order #{item.globalOrderNumber}
                      </Text>

                      <Text style={[styles.value, { color: "#1A4D7E" }]}>
                        {getStatusText(item.status)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() =>
                        setOpenedOrderId(null)
                      }
                    >
                      <Text style={{ color: "white" }}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.centerText}>
                      <Text style={styles.label}>
                        Penerima
                      </Text>

                      <Text style={styles.value}>
                        {item.receiverName}
                      </Text>
                    </View>

                    <View style={styles.centerText}>
                      <Text style={styles.label}>
                        Jumlah Product
                      </Text>

                      <Text style={styles.value}>
                        {item.totalItems} Product
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.centerText}>
                      <Text style={styles.label}>
                        Tanggal Pesanan
                      </Text>

                      <Text style={styles.value}>
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>

                    <View style={[styles.centerText, { width: 94 }]}>
                      <Text style={styles.label}>
                        Brand
                      </Text>

                      <Text style={[styles.value, { textAlign: "left" }]}>
                        {item.brands.join("\n")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailDivider} />

                  {item.status === "pending" && item.paymentUrl && (
                    <TouchableOpacity
                      style={{
                        marginTop: 15,
                        backgroundColor: "#1A4D7E",
                        padding: 12,
                        borderRadius: 10,
                        alignItems: "center",
                      }}
                      onPress={() => {
                        if (item.paymentUrl) {
                          setSelectedPaymentUrl(item.paymentUrl);
                          setShowPaymentModal(true);
                        }
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold" }}>
                        Lanjutkan Pembayaran
                      </Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.routeTitle}>
                    Route
                  </Text>

                  <View style={styles.routeContainer}>

                    <View style={{ gap: 18, marginRight: 30 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Ionicons name="person" size={21} color="#E5E1D1" />
                        <Text style={styles.routeText}>
                          {item.driverName}
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <MaterialIcons name="delivery-dining" size={24} color="#E5E1D1" />
                        <Text style={styles.routeText}>
                          Honda Scoopy
                        </Text>
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <FontAwesome5 name="route" size={24} color="#E5E1D1" />
                        <Text style={styles.routeText}>
                          {item.estimatedDistance !== undefined
                            ? `${item.estimatedDistance.toFixed(1)} km (${Math.round(item.estimatedDuration ?? 0)} menit)`
                            : "-"
                          }
                        </Text>
                      </View>
                    </View>

                    <View style={styles.routeLine} />

                    <View style={styles.timelineWrapper}>

                    </View>

                  </View>

                  <View style={{ marginTop: 18, borderRadius: 15, overflow: "hidden" }}>

                    <MapView
                      provider={PROVIDER_GOOGLE}
                      style={{
                        width: "100%",
                        height: 220,
                      }}
                      initialRegion={{
                        latitude:
                          (STORE_LOCATION.latitude +
                            item.customerLatitude) / 2,

                        longitude:
                          (STORE_LOCATION.longitude +
                            item.customerLongitude) / 2,

                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                      }}
                    >

                      <Marker
                        coordinate={{
                          latitude: STORE_LOCATION.latitude,
                          longitude: STORE_LOCATION.longitude,
                        }}
                        title="Viora Store"
                        description={STORE_LOCATION.address}
                        pinColor="green"
                      />

                      <Marker
                        coordinate={{
                          latitude: item.customerLatitude,
                          longitude: item.customerLongitude,
                        }}
                        title={item.receiverName}
                        description={item.address}
                        pinColor="red"
                      />

                      {/* {item.driverLatitude &&
                        item.driverLongitude && (
                          <Marker
                            coordinate={{
                              latitude: item.driverLatitude,
                              longitude: item.driverLongitude,
                            }}
                            title="Driver"
                          >
                            <Ionicons
                              name="bicycle"
                              size={28}
                              color="#1A4D7E"
                            />
                          </Marker>
                        )} */}

                      <MapViewDirections
                        origin={{
                          latitude: STORE_LOCATION.latitude,
                          longitude: STORE_LOCATION.longitude,
                        }}
                        destination={{
                          latitude: item.customerLatitude,
                          longitude: item.customerLongitude,
                        }}
                        apikey={GOOGLE_MAPS_API_KEY}
                        strokeWidth={4}
                        strokeColor="#1A4D7E"
                      />

                    </MapView>

                  </View>

                </View>
              )}

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
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5E1D1", // Background krem
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexDirection: "row",
    width: "90%",
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    paddingRight: "38%",
    color: "#92A390",
  },
  card: {
    backgroundColor: "#98A78F", // Warna hijau sage
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  orderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  status: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A4D7E",
  },
  address: {
    fontSize: 13,
    color: "white",
    marginTop: 5,
    marginBottom: 10,
    width: "70%",
  },
  nameRecipient: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginVertical: 5,
  },
  productCount: {
    fontSize: 13,
    color: "white",
    fontWeight: "500",
  },
  date: {
    fontSize: 13,
    color: "white",
    fontWeight: "500",
  },
  detailCard: {
    backgroundColor: "#98A78F",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: -5,
    marginBottom: 15,
  },

  headerClose: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 20,
    backgroundColor: "#3b3b3b",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  centerText: {
    alignItems: "flex-start",
    justifyContent: "center",
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 10,
  },

  label: {
    color: "white",
    opacity: 0.8,
    fontSize: 13,
    marginBottom: 4,
  },

  value: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },

  detailDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginBottom: 12,
  },

  routeTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  routeContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%"
  },

  routeLine: {
    width: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 18,
    height: "100%",
  },

  routeText: {
    color: "white",
    fontSize: 14,
  },

  timelineText: {
    color: "white",
    fontSize: 13,
  },

  timelineWrapper: {
    // marginTop: 10,
  },

  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  timelineLeft: {
    alignItems: "center",
    marginRight: 12,
  },

  circle: {
    width: 14,
    height: 14,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.5)",
  },

  activeCircle: {
    backgroundColor: "#000",
  },

  line: {
    width: 2,
    height: 25,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  timelineContent: {
    width: 100,
  },

  timelineTitle: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },

  activeText: {
    color: "#1A4D7E",
    fontWeight: "700",
  },

  timelineTime: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 3,
  },
});