import { v } from "convex/values";
import {
    eachDayOfInterval,
    eachMonthOfInterval,
    endOfMonth,
    endOfWeek,
    endOfYear,
    format,
    startOfMonth,
    startOfWeek,
    startOfYear
} from "date-fns";
import { STORE_LOCATION } from "../constant/storeLocation";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";


export const createOrder = mutation({
    args: {
        userId: v.id("users"),
        amount: v.number(),
        orderId: v.string(),
        deliveryMethod: v.string(),
        snapToken: v.string(),
        paymentUrl: v.string(),
        totalItems: v.number(),
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

        // Cek apakah order sudah ada
        const existingOrder = await ctx.db
            .query("orders")
            .withIndex("by_orderId", (q) =>
                q.eq("orderId", args.orderId)
            )
            .first();

        // Jika sudah ada jangan insert lagi
        if (existingOrder) {
            return existingOrder._id;
        }

        const allOrders = await ctx.db
            .query("orders")
            .collect();

        const nextGlobalNumber =
            allOrders.length + 1;

        return await ctx.db.insert("orders", {
            userId: args.userId,
            orderId: args.orderId,
            globalOrderNumber: nextGlobalNumber,
            amount: args.amount,
            status: "pending",
            deliveryMethod: args.deliveryMethod,
            snapToken: args.snapToken,
            paymentUrl: args.paymentUrl,
            totalItems: args.totalItems,
            address: args.address,
            receiverName: args.receiverName,
            phoneNumber: args.phoneNumber,
            createdAt: Date.now(),
            brands: args.brands,
            customerLatitude: args.customerLatitude,
            customerLongitude: args.customerLongitude,
            estimatedDistance: args.estimatedDistance,
            estimatedDuration: args.estimatedDuration,
        });
    },
});

export const updateOrderStatus = mutation({
    args: {
        orderId: v.string(),
        status: v.string(),
        paymentType: v.optional(v.string()),
    },

    handler: async (ctx, args) => {
        console.log("=== updateOrderStatus DIPANGGIL ===");
        console.log(args);

        const order = await ctx.db
            .query("orders")
            .withIndex("by_orderId", (q) => q.eq("orderId", args.orderId))
            .unique();

        console.log("ORDER =", order);

        if (!order) {
            console.log("ORDER TIDAK DITEMUKAN");
            return;
        }

        await ctx.db.patch(order._id, {
            status: args.status,
            paymentType: args.paymentType,
        });

        console.log("STATUS ORDER BERHASIL DIUPDATE");

        if (args.status !== "settlement") {
            console.log("BUKAN SETTLEMENT");
            return;
        }

        const items = await ctx.db
            .query("orderItems")
            .withIndex("by_order", (q) => q.eq("orderId", order._id))
            .collect();

        console.log("ITEMS =", items);

        for (const item of items) {

            console.log("ITEM =", item);

            const product = await ctx.db.get(item.productId);

            console.log("PRODUCT =", product);

            if (!product) {
                console.log("PRODUCT TIDAK DITEMUKAN");
                continue;
            }

            console.log("PATCH PRODUCT", product._id);

            await ctx.db.patch(product._id, {
                stock: product.stock - item.quantity,
                sold: (product.sold ?? 0) + item.quantity,
            });

            console.log("PATCH BERHASIL");
        }

        console.log("=== SELESAI updateOrderStatus ===");
    },
});

export const getOrderById = query({
    args: { orderId: v.string() },

    handler: async (ctx, args) => {

        const orders = await ctx.db
            .query("orders")
            .withIndex("by_orderId", (q) =>
                q.eq("orderId", args.orderId)
            )
            .collect();

        return orders[0];
    },
});

export const getMyOrders = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("orders")
            .filter((q) => q.eq(q.field("userId"), args.userId))
            .order("desc")
            .collect();
    },
});

export const getMyOrdersWithGlobalNumber = query({
    args: {
        userId: v.id("users"),
    },

    handler: async (ctx, args) => {

        return await ctx.db
            .query("orders")
            .filter((q) =>
                q.eq(q.field("userId"), args.userId)
            )
            .order("desc")
            .collect();
    },
});

export const getAllOrdersForAdmin = query({
    args: {},

    handler: async (ctx) => {

        const orders = await ctx.db
            .query("orders")
            .order("desc")
            .collect();

        return orders
            .filter((order) => !order.isFinished)
            .map((order, index) => ({
                _id: order._id,
                userId: order.userId,
                orderId: order.orderId,
                globalOrderNumber: order.globalOrderNumber,
                receiverName: order.receiverName,
                totalItems: order.totalItems,
                deliveryMethod: order.deliveryMethod,
                status: order.status,
                driverName: order.driverName,
                isFinished: order.isFinished,
                paymentType: order.paymentType,
                _creationTime: order._creationTime,


                paymentStatus:
                    order.paymentType
                        ? "Sudah Bayar"
                        : "Belum Bayar",
            }));
    },
});

export const getOrderDetail = query({
    args: {
        id: v.id("orders"),
    },

    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getDeliveryOrders = query({
    args: {},

    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .order("desc")
            .collect();

        return orders.filter(
            (order) =>
                order.deliveryMethod === "Pengiriman" &&
                !order.isFinished
        );
    },
});

export const startDelivery = mutation({
    args: {
        orderId: v.id("orders"),
    },

    handler: async (ctx, args) => {
        await ctx.db.patch(args.orderId, {
            isDeliveryStarted: true,
        });
    },
});

export const updateDriverLocation = mutation({
    args: {
        orderId: v.id("orders"),
        latitude: v.float64(),
        longitude: v.float64(),
        heading: v.optional(v.float64()),
    },

    handler: async (ctx, args) => {
        await ctx.db.patch(args.orderId, {
            driverLatitude: args.latitude,
            driverLongitude: args.longitude,
            driverHeading: args.heading,
        });
    },
});

export const updateAdminOrder = action({
    args: {
        id: v.id("orders"),
        status: v.string(),
        driverName: v.optional(v.string()),
    },

    handler: async (ctx, args) => {
        const order = await ctx.runQuery(api.orders.getOrderDetail, {
            id: args.id,
        });

        if (!order) return;

        const updateData: any = {
            status: args.status,
            driverName: args.driverName,
            isFinished: args.status === "Finished",
        };

        if (args.status === "Delivery") {
            updateData.driverLatitude = STORE_LOCATION.latitude;
            updateData.driverLongitude = STORE_LOCATION.longitude;
        }

        console.log("STATUS DIKIRIM:", args.status);

        await ctx.runMutation(api.orders.patchOrder, {
            id: args.id,
            status: args.status,
            driverName: args.driverName,
            isFinished: args.status === "Finished",
            driverLatitude: args.status === "Delivery"
                ? STORE_LOCATION.latitude
                : undefined,
            driverLongitude: args.status === "Delivery"
                ? STORE_LOCATION.longitude
                : undefined,
        });

        if (args.status === "Take In") {

            console.log("MASUK PUSH BLOCK");

            const user = await ctx.runQuery(api.users.getUserById, {
                id: order.userId,
            });

            if (user?.pushToken) {
                console.log("SENDING PUSH TO:", user.pushToken);

                const res = await fetch("https://exp.host/--/api/v2/push/send", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        to: user.pushToken,
                        title: "Pesanan Siap Diambil",
                        body: `Pesanan #${order.globalOrderNumber} sudah siap di toko`,
                    }),
                });

                const data = await res.json();
                console.log("PUSH RESPONSE:", data);
            }
        }
    },
});

export const patchOrder = mutation({
    args: {
        id: v.id("orders"),
        status: v.optional(v.string()),
        driverName: v.optional(v.string()),
        isFinished: v.optional(v.boolean()),
        driverLatitude: v.optional(v.float64()),
        driverLongitude: v.optional(v.float64()),
    },

    handler: async (ctx, args) => {
        console.log("PATCH ORDER:", args);
        const { id, ...data } = args;

        const cleanData = Object.fromEntries(
            Object.entries(data).filter(([, value]) => value !== undefined)
        );

        await ctx.db.patch(id, cleanData);
    }
});

export const getTotalProductsSold = query({
    args: {},
    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .collect();

        const paidOrders = orders.filter(
            (order) => order.status !== "Pending"
        );

        const totalProductsSold = paidOrders.reduce(
            (total, order) => total + (order.totalItems ?? 0),
            0
        );

        return totalProductsSold;
    },
});

export const getFinishedOrders = query({
    args: {},
    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .collect();

        return orders.filter(
            (order) => order.status === "Finished"
        );
    },
});

export const getTotalRevenue = query({
    args: {},
    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .collect();

        const finishedOrders = orders.filter(
            (order) => order.status === "Finished"
        );

        const totalRevenue = finishedOrders.reduce(
            (total, order) => total + order.amount,
            0
        );

        return totalRevenue;
    },
});

export const getSalesChart = query({
    args: {
        period: v.union(
            v.literal("day"),
            v.literal("week"),
            v.literal("month"),
            v.literal("year")
        ),
    },

    handler: async (ctx, args) => {
        const orders = (await ctx.db.query("orders").collect())
            .filter(order => order.status !== "Pending");

        const now = new Date();

        // ==========================
        // DAY
        // ==========================
        if (args.period === "day") {

            const hours = Array.from({ length: 24 }, (_, i) => ({
                label: `${i}:00`,
                sales: 0,
            }));

            orders.forEach(order => {
                const date = new Date(order.createdAt);

                if (
                    date.getFullYear() === now.getFullYear() &&
                    date.getMonth() === now.getMonth() &&
                    date.getDate() === now.getDate()
                ) {
                    hours[date.getHours()].sales += order.amount;
                }
            });

            return hours;
        }

        // ==========================
        // WEEK
        // ==========================

        if (args.period === "week") {

            const start = startOfWeek(now, {
                weekStartsOn: 1,
            });

            const end = endOfWeek(now, {
                weekStartsOn: 1,
            });

            const days = eachDayOfInterval({
                start,
                end,
            }).map(day => ({
                label: format(day, "EEE"),
                sales: 0,
            }));

            orders.forEach(order => {

                const date = new Date(order.createdAt);

                if (date >= start && date <= end) {

                    const index = Math.floor(
                        (date.getTime() - start.getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    days[index].sales += order.amount;
                }
            });

            return days;
        }

        // ==========================
        // MONTH
        // ==========================

        if (args.period === "month") {

            const start = startOfMonth(now);

            const end = endOfMonth(now);

            const days = eachDayOfInterval({
                start,
                end,
            }).map(day => ({
                label: format(day, "d"),
                sales: 0,
            }));

            orders.forEach(order => {

                const date = new Date(order.createdAt);

                if (date >= start && date <= end) {

                    const index = date.getDate() - 1;

                    days[index].sales += order.amount;
                }
            });

            return days;
        }

        // ==========================
        // YEAR
        // ==========================

        const start = startOfYear(now);

        const end = endOfYear(now);

        const months = eachMonthOfInterval({
            start,
            end,
        }).map(month => ({
            label: format(month, "MMM"),
            sales: 0,
        }));

        orders.forEach(order => {

            const date = new Date(order.createdAt);

            if (date >= start && date <= end) {

                months[date.getMonth()].sales += order.amount;
            }

        });

        return months;
    },
});

export const getSalesReport = query({
    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .collect();

        const products = await ctx.db
            .query("products")
            .collect();

        // Hanya order yang sudah selesai / berhasil
        const completedOrders = orders.filter(
            (order) => order.status === "Finished"
        );

        const totalRevenue = completedOrders.reduce(
            (total, order) => total + order.amount,
            0
        );

        const totalOrders = completedOrders.length;

        const totalProductsSold = completedOrders.reduce(
            (total, order) => total + (order.totalItems ?? 0),
            0
        );

        // Payment Type
        const paymentTypes = completedOrders.reduce<
            Record<string, number>
        >((acc, order) => {
            const type = order.paymentType ?? "Unknown";

            acc[type] = (acc[type] ?? 0) + 1;

            return acc;
        }, {});

        return {
            totalRevenue,
            totalOrders,
            totalProductsSold,

            products: products.map((product) => ({
                name: product.name,
                brand: product.brand,
                price: product.price,
                stock: product.stock,
                sold: product.sold ?? 0,
            })),

            paymentTypes,
        };
    },
});

export const getMonthlyOrders = query({
    args: {
        year: v.number(),
    },

    handler: async (ctx, args) => {
        const orders = await ctx.db
            .query("orders")
            .collect();

        const months = [
            "Jan", "Feb", "Mar", "Apr",
            "Mei", "Jun", "Jul", "Agu",
            "Sep", "Okt", "Nov", "Des",
        ];

        const result = months.map((month) => ({
            month,
            orders: 0,
        }));

        orders.forEach((order) => {
            const date = new Date(order.createdAt);

            if (
                date.getFullYear() === args.year &&
                order.status === "Finished"
            ) {
                result[date.getMonth()].orders += 1;
            }
        });

        return result;
    },
});