import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const tabWidth = width * 0.75;

  return (
    <View style={styles.wrapper}>

      <Svg width={tabWidth} height={60} viewBox="0 0 257 46" preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: 0
        }}>
        <Path
          d="M106 25.7182C103.497 22.7593 102.896 18.3358 103.113 13.988C103.46 7.04295 98.6262 0 91.6725 0H10C4.47715 0 0 4.47715 0 10V36C0 41.5228 4.47715 46 10 46H247C252.523 46 257 41.5228 257 36V10C257 4.47715 252.523 0 247 0H165.328C158.374 0 153.54 7.04294 153.887 13.988C154.104 18.3358 153.503 22.7593 151 25.7182C142.912 35.2779 114.088 35.2779 106 25.7182Z"
          fill="#fff"
        />
      </Svg>

      {/* TAB ITEMS */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.notificationWrapper}
          onPress={() => navigation.navigate("notification")}
        >
          <View style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </View>
        </TouchableOpacity>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const label =
            options.tabBarLabel ?? options.title ?? route.name;

          const iconMap: any = {
            index: "home-outline",
            product: "cube-outline",
            notification: "notifications-outline",
            wishlist: "heart-outline",
            account: "person-outline",
          };

          // SLOT KOSONG UNTUK NOTIFICATION
          if (route.name === "notification") {
            return <View key={route.key} style={{ flex: 1 }} />;
          }

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabBarItem}
              onPress={() => navigation.navigate(route.name)}
            >
              <Ionicons
                name={iconMap[route.name]}
                size={22}
                color={isFocused ? "#000" : "#888"}
              />

              <Text
                style={{
                  fontSize: 11,
                  marginTop: 2,
                  color: isFocused ? "#000" : "#888",
                }}
              >
                {String(label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 25,
    width: "100%",
    alignItems: "center",
  },

  svg: {
    position: "absolute",
  },

  tabBar: {
    width: "75%",
    height: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 35,
  },

  tabBarItem: {
    flex: 1,
    alignItems: "center",
  },

  notificationWrapper: {
    position: "absolute",
    top: -15,
    alignSelf: "center",
  },

  notificationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
});

// import { Ionicons } from "@expo/vector-icons";
// import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
// import { router } from "expo-router";
// import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// import Svg, { Path } from "react-native-svg";

// const { width } = Dimensions.get("window");

// export default function CustomTabBar({ state, descriptors }: BottomTabBarProps) {
//   const tabWidth = width * 0.75;

//   return (
//     <View style={styles.wrapper}>
//       {/* SVG BACKGROUND */}
//       <Svg
//         width={tabWidth}
//         height={60}
//         viewBox="0 0 257 46"
//         preserveAspectRatio="none"
//         style={{
//           position: "absolute",
//           bottom: 0,
//         }}
//       >
//         <Path
//           d="M106 25.7182C103.497 22.7593 102.896 18.3358 103.113 13.988C103.46 7.04295 98.6262 0 91.6725 0H10C4.47715 0 0 4.47715 0 10V36C0 41.5228 4.47715 46 10 46H247C252.523 46 257 41.5228 257 36V10C257 4.47715 252.523 0 247 0H165.328C158.374 0 153.54 7.04294 153.887 13.988C154.104 18.3358 153.503 22.7593 151 25.7182C142.912 35.2779 114.088 35.2779 106 25.7182Z"
//           fill="#fff"
//         />
//       </Svg>

//       {/* NOTIFICATION BUTTON (TENGAH) */}
//       <TouchableOpacity
//         style={styles.notificationWrapper}
//         onPress={() => {
//           try {
//             router.push("/notification");
//           } catch (e) {
//             console.log("Navigation error:", e);
//           }
//         }}
//       >
//         <View style={styles.notificationButton}>
//           <Ionicons name="notifications-outline" size={24} color="#000" />
//         </View>
//       </TouchableOpacity>

//       {/* TAB ITEMS */}
//       <View style={styles.tabBar}>
//         {state.routes.map((route, index) => {
//           const { options } = descriptors[route.key];
//           const isFocused = state.index === index;

//           const label = options.title ?? route.name;

//           const iconMap: any = {
//             index: "home-outline",
//             product: "cube-outline",
//             notification: "notifications-outline",
//             wishlist: "heart-outline",
//             account: "person-outline",
//           };

//           // SLOT KOSONG UNTUK TOMBOL TENGAH
//           if (route.name === "notification") {
//             return <View key={route.key} style={{ flex: 1 }} />;
//           }

//           return (
//             <TouchableOpacity
//               key={route.key}
//               style={styles.tabBarItem}
//               onPress={() => {
//                 try {
//                   router.push(`/(tabs)/${route.name}` as any);
//                 } catch (e) {
//                   console.log("Navigation error:", e);
//                 }
//               }}
//             >
//               <Ionicons
//                 name={iconMap[route.name]}
//                 size={22}
//                 color={isFocused ? "#000" : "#888"}
//               />

//               <Text
//                 style={{
//                   fontSize: 11,
//                   marginTop: 2,
//                   color: isFocused ? "#000" : "#888",
//                 }}
//               >
//                 {String(label)}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   wrapper: {
//     position: "absolute",
//     bottom: 25,
//     width: "100%",
//     alignItems: "center",
//   },

//   tabBar: {
//     width: "75%",
//     height: 60,
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     borderRadius: 35,
//   },

//   tabBarItem: {
//     flex: 1,
//     alignItems: "center",
//   },

//   notificationWrapper: {
//     position: "absolute",
//     top: -15,
//     alignSelf: "center",
//     zIndex: 10,
//   },

//   notificationButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#fff",
//     justifyContent: "center",
//     alignItems: "center",

//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 6,
//     elevation: 5,
//   },
// });