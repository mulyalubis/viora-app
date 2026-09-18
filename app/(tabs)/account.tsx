import AccountIsLogin from "@/components/accountIsLogin";
import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";
import { api } from "@/convex/_generated/api";
import { registerForPushNotifications } from "@/lib/registerPushNotification";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";


const { height } = Dimensions.get("window");

export default function Account() {
    const savedEmail = useAuthStore((state) => state.userEmail);

    const userData = useQuery(
        api.users.getUserByEmail,
        savedEmail ? { email: savedEmail } : "skip"
    );

    const savePushToken =
        useMutation(api.users.savePushToken);

    useEffect(() => {
        let isMounted = true;

        async function setupPushToken() {
            if (!userData?._id) return;

            const token = await registerForPushNotifications();

            if (!token) return;
            if (!isMounted) return;

            await savePushToken({
                userId: userData._id,
                pushToken: token,
            });
        }

        setupPushToken();

        return () => {
            isMounted = false;
        };
    }, [userData?._id]);

    const [toggleWidth, setToggleWidth] = useState(0);

    const isUserLoading = savedEmail && userData === undefined;

    const [isLogin, setIsLogin] = useState(true);

    const translateX = useSharedValue(0);

    const toggle = (login: boolean) => {
        setIsLogin(login);

        translateX.value = withTiming(
            login ? 0 : toggleWidth / 2,
            { duration: 300 }
        );
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    if (savedEmail === undefined) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (isUserLoading) {
        return (
            <View style={styles.container}>
                <Text>Loading account...</Text>
            </View>
        );
    }

    if (userData) {
        return <AccountIsLogin userData={userData} />;
    }

    return (
        <SafeAreaView style={styles.container} key={savedEmail}>
            {/* <View style={styles.container} > */}
            <View style={{ width: "90%", justifyContent: "flex-start", alignItems: "center" }}>
                <Text style={{ fontSize: 36, color: "#92A390", textTransform: "uppercase" }}>viora</Text>
                <Text style={{ fontSize: 15, color: "#92A390", textTransform: "uppercase", paddingTop: 10 }}>
                    Discover beauty curated for you</Text>
            </View>

            <View
                style={styles.toggleContainer}
                onLayout={(event) => {
                    setToggleWidth(event.nativeEvent.layout.width);
                }}
            >
                <Animated.View
                    style={[
                        styles.slider,
                        animatedStyle,
                        { width: toggleWidth / 2 }
                    ]}
                />
                <Text style={[
                    styles.toggleText,
                    { opacity: isLogin ? 1 : 0 }
                ]}
                    onPress={() => toggle(true)}>log in</Text>
                <Text style={[
                    styles.toggleText,
                    { opacity: !isLogin ? 1 : 0 }
                ]}
                    onPress={() => toggle(false)}>register</Text>
            </View>

            {isLogin ? <LoginForm /> : <RegisterForm />}

            {/* </View> */}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        paddingTop: height * 0.06,
        alignItems: "center",
        backgroundColor: "#E3DFD3",
    },
    toggleContainer: {
        width: "70%",
        maxWidth: 320,
        height: 50,
        justifyContent: "space-around",
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "black",
        marginTop: 50,
        borderRadius: 20,
        overflow: "hidden"
    },
    slider: {
        position: "absolute",
        height: "100%",
        left: 0,
        backgroundColor: "white",
        borderRadius: 20
    },

    toggleText: {
        flex: 1,
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: 18,
        color: "#92A390",
        zIndex: 2,
    },
})