import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";


export const createTransaction = action({
    args: {
        amount: v.number(),
        orderId: v.string(),
        customerName: v.string(),
        userId: v.id("users"),
        deliveryMethod: v.string(),
        items: v.array(v.object({
            id: v.string(),
            price: v.number(),
            quantity: v.number(),
            name: v.string(),
        })),
        address: v.string(),
        receiverName: v.string(),
        phoneNumber: v.string(),
        brands: v.array(v.string()),
        customerLatitude: v.number(),
        customerLongitude: v.number(),
        estimatedDistance: v.number(),
        estimatedDuration: v.number(),
    },
    handler: async (ctx, args) => {
        const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
        const authString = btoa(`${SERVER_KEY}:`);

        const response = await fetch("https://app.sandbox.midtrans.com/snap/v1/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${authString}`,
            },
            body: JSON.stringify({
                transaction_details: {
                    order_id: args.orderId,
                    gross_amount: Math.round(args.amount),
                },
                item_details: args.items,
                customer_details: {
                    first_name: args.customerName,
                },
                enabled_payments: [
                    "other_qris",
                    "bsi_va",
                ],
            })
        });

        const data = await response.json();
        const totalItems = args.items.reduce((total, item) => {
            if (item.id === "PROMO-DISCOUNT") return total;
            return total + item.quantity;
        }, 0);

        await ctx.runMutation(api.orders.createOrder, {
            userId: args.userId,
            orderId: args.orderId,
            amount: args.amount,
            deliveryMethod: args.deliveryMethod,
            snapToken: data.token,
            paymentUrl: data.redirect_url,
            address: args.address,
            receiverName: args.receiverName,
            phoneNumber: args.phoneNumber,
            totalItems: totalItems,
            brands: args.brands,
            customerLatitude: args.customerLatitude,
            customerLongitude: args.customerLongitude,
            estimatedDistance: args.estimatedDistance,
            estimatedDuration: args.estimatedDuration,
        });

        return data.redirect_url;
    },
});