import { ConvexHttpClient } from "convex/browser";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { api } from "../../convex/_generated/api";

const TASK_NAME = "driver-location-task";

// Convex client (WAJIB pakai HTTP client untuk background)
const convex = new ConvexHttpClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

let orderIdGlobal: string | null = null;

// SET ORDER ID DARI SCREEN
export const setTrackingOrderId = (id: string) => {
    orderIdGlobal = id;
};

// TASK BACKGROUND
TaskManager.defineTask(TASK_NAME, async ({ data, error }: any) => {
    if (error) return;

    const { locations } = data;
    const loc = locations[0];

    if (!orderIdGlobal) return;

    console.log("TASK RUNNING");
    console.log(loc.coords.latitude);
    console.log(loc.coords.longitude);
    console.log(orderIdGlobal);

    try {
        await convex.mutation(api.orders.updateDriverLocation, {
            orderId: orderIdGlobal as any,
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            heading: loc.coords.heading ?? 0,

        });
        console.log("UPDATE SUCCESS");
    } catch (e) {
        console.log("BACKGROUND UPDATE ERROR:", e);
    }
});

// START TRACKING
export const startBackgroundTracking = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();

    if (status !== "granted") {
        throw new Error("Background location not granted");
    }

    await Location.startLocationUpdatesAsync(TASK_NAME, {
        accuracy: Location.Accuracy.High,

        timeInterval: 5000,

        distanceInterval: 0,

        foregroundService: {
            notificationTitle: "Driver aktif",
            notificationBody: "Tracking lokasi berjalan",
        },
    });
};

// STOP TRACKING
export const stopBackgroundTracking = async () => {
    await Location.stopLocationUpdatesAsync(TASK_NAME);
};