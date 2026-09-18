import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { Tabs } from "expo-router";
import { useEffect } from "react"; // Tambahkan useEffect
import { Platform, View } from "react-native"; // Tambahkan Platform
import Toast from 'react-native-toast-message';
import CustomTabBar from "../../components/CustomTabBar";

// Bersihkan properti handler agar sesuai standar murni Expo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // Hapus shouldShowAlert karena sudah digantikan oleh banner dan list di bawah ini
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Menampilkan pop-up banner di atas layar
    shouldShowList: true,   // Menampilkan notifikasi di tray/laci notifikasi HP
  }),
});

export default function RootLayout() {

  // WAJIB: Daftarkan channel Android begitu layout utama dimuat
  useEffect(() => {
    async function configureAndroidChannel() {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX, // Menjamin banner muncul saat app ditutup
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7A',
        });
      }
    }
    configureAndroidChannel();
  }, []);

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#000",
          tabBarInactiveTintColor: "#888",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "home",
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="product"
          options={{
            title: "product",
            tabBarIcon: ({ color }) => (
              <Ionicons name="cube-outline" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="notification"
          options={{
            title: "",
            tabBarIcon: ({ color }) => (
              <View>
                <Ionicons name="notifications-outline" size={24} color={color} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="wishlist"
          options={{
            title: "wishlist",
            tabBarIcon: ({ color }) => (
              <Ionicons name="heart-outline" size={24} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="account"
          options={{
            title: "account",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>

      <Toast />
    </>
  );
}