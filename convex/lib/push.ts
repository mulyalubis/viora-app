export async function sendPushNotification({
    expoPushToken,
    title,
    body,
}: {
    expoPushToken: string;
    title: string;
    body: string;
}) {
    if (!expoPushToken) {
        console.log("NO TOKEN");
        return;
    }

    console.log("SENDING PUSH TO:", expoPushToken);

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            to: expoPushToken,
            title,
            body,
        }),
    });

    const data = await res.json();

    console.log("PUSH RESPONSE:", data);
}