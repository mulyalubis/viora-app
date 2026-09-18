import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export async function registerForPushNotifications() {
    if (!Device.isDevice) return null;

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return null;

    const projectId = "88dfecac-6022-478a-92a2-e29461b22236";

    const token = await Notifications.getExpoPushTokenAsync({
        projectId,
    });

    console.log("TOKEN:", token.data);
    return token.data;
}