import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
    path: "/midtrans-webhook", // Endpoint ini yang didaftarkan di Midtrans
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const data = await request.json();

        console.log("Data Webhook Masuk:", data);

        if (data.transaction_status === "settlement" || data.transaction_status === "capture") {
            await ctx.runMutation(api.orders.updateOrderStatus, {
                orderId: data.order_id,
                status: "settlement",
                paymentType: data.payment_type
            });
        } else if (data.transaction_status === "expire" || data.transaction_status === "cancel") {
            await ctx.runMutation(api.orders.updateOrderStatus, {
                orderId: data.order_id,
                status: "expired",
                paymentType: data.payment_type
            });
        }

        return new Response(null, { status: 200 });
    }),
});

export default http;