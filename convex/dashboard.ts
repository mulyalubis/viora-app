import { query } from "./_generated/server";

export const getTotalUsers = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db
            .query("users")
            .collect();

        // Hanya menghitung user biasa
        return users.filter(
            (user) => user.role === "user"
        ).length;
    },
});

export const getTotalOrders = query({
    args: {},

    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .collect();

        return orders.length;
    },
});

export const getAverageRating = query({
    args: {},

    handler: async (ctx) => {
        const reviews = await ctx.db
            .query("reviews")
            .collect();

        if (reviews.length === 0) {
            return 0;
        }

        const totalRating = reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        );

        return Number(
            (totalRating / reviews.length).toFixed(1)
        );
    },
});

export const getTotalDelivery = query({
    args: {},

    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .collect();

        return orders.filter(
            (order) => order.deliveryMethod === "Pengiriman"
        ).length;
    },
});

export const getPaymentMethodStats = query({
    args: {},

    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .collect();

        const result: Record<string, number> = {};

        orders.forEach((order) => {
            const method = order.paymentType ?? "Unknown";;

            result[method] = (result[method] ?? 0) + 1;
        });

        const COLORS = [
            "#3AA8A4",
            "#DBA945",
        ];

        return Object.entries(result).map(([name, value], index) => ({
            name,
            value,
            fill: COLORS[index % COLORS.length],
        }));

    },
});

export const getTopSellingBrands = query({
    args: {},

    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .collect();

        const brandCount: Record<string, number> = {};

        for (const order of orders) {
            for (const brand of order.brands) {
                brandCount[brand] = (brandCount[brand] ?? 0) + 1;
            }
        }

        return Object.entries(brandCount)
            .map(([name, sold]) => ({
                name,
                sold,
            }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 3);
    },
});

export const getMonthlyComparison = query({
    handler: async (ctx) => {
        const now = new Date();

        // Bulan sekarang
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const currentMonthStart = new Date(
            currentYear,
            currentMonth,
            1
        ).getTime();

        const nextMonthStart = new Date(
            currentYear,
            currentMonth + 1,
            1
        ).getTime();

        // Bulan sebelumnya
        const previousMonthStart = new Date(
            currentYear,
            currentMonth - 1,
            1
        ).getTime();

        const orders = await ctx.db
            .query("orders")
            .collect();

        // Hanya order Finished
        const finishedOrders = orders.filter(
            (order) => order.status === "Finished"
        );

        const currentOrders = finishedOrders.filter(
            (order) =>
                order._creationTime >= currentMonthStart &&
                order._creationTime < nextMonthStart
        );

        const previousOrders = finishedOrders.filter(
            (order) =>
                order._creationTime >= previousMonthStart &&
                order._creationTime < currentMonthStart
        );

        // =========================
        // REVENUE
        // =========================

        const currentRevenue = currentOrders.reduce(
            (total, order) =>
                total + (order.amount ?? 0),
            0
        );

        const previousRevenue = previousOrders.reduce(
            (total, order) =>
                total + (order.amount ?? 0),
            0
        );

        // =========================
        // PRODUCTS SOLD
        // =========================

        const currentProductsSold = currentOrders.reduce(
            (total, order) =>
                total + (order.totalItems ?? 0),
            0
        );

        const previousProductsSold = previousOrders.reduce(
            (total, order) =>
                total + (order.totalItems ?? 0),
            0
        );

        // =========================
        // TOTAL ORDERS
        // =========================

        const currentTotalOrders = currentOrders.length;

        const previousTotalOrders = previousOrders.length;

        return {
            revenue: {
                current: currentRevenue,
                previous: previousRevenue,
            },

            productsSold: {
                current: currentProductsSold,
                previous: previousProductsSold,
            },

            orders: {
                current: currentTotalOrders,
                previous: previousTotalOrders,
            },
        };
    },
});

export const getMonthlyUserComparison = query({
    handler: async (ctx) => {
        const now = new Date();

        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Awal bulan ini
        const currentMonthStart = new Date(
            currentYear,
            currentMonth,
            1
        ).getTime();

        // Awal bulan depan
        const nextMonthStart = new Date(
            currentYear,
            currentMonth + 1,
            1
        ).getTime();

        // Awal bulan sebelumnya
        const previousMonthStart = new Date(
            currentYear,
            currentMonth - 1,
            1
        ).getTime();

        const users = await ctx.db
            .query("users")
            .collect();

        // User yang terdaftar bulan ini
        const currentMonthUsers = users.filter(
            (user) =>
                user.role === "user" &&
                user._creationTime >= currentMonthStart &&
                user._creationTime < nextMonthStart
        );

        const previousMonthUsers = users.filter(
            (user) =>
                user.role === "user" &&
                user._creationTime >= previousMonthStart &&
                user._creationTime < currentMonthStart
        );

        const current = currentMonthUsers.length;
        const previous = previousMonthUsers.length;

        return {
            current,
            previous,
        };
    },
});

export const getDashboardMonthlyComparison = query({
    handler: async (ctx) => {
        const orders = await ctx.db
            .query("orders")
            .collect();

        const now = new Date();

        // Bulan berjalan
        const currentStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        ).getTime();

        const currentEnd = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        ).getTime();

        // Bulan sebelumnya
        const previousStart = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
        ).getTime();

        const previousEnd = currentStart;

        const finishedOrders = orders.filter(
            (order) => order.status === "Finished"
        );

        const currentOrders = finishedOrders.filter(
            (order) =>
                order._creationTime >= currentStart &&
                order._creationTime < currentEnd
        );

        const previousOrders = finishedOrders.filter(
            (order) =>
                order._creationTime >= previousStart &&
                order._creationTime < previousEnd
        );

        // Total order
        const currentOrderCount = currentOrders.length;
        const previousOrderCount = previousOrders.length;

        // Delivery
        const currentDeliveryCount = currentOrders.filter(
            (order) => order.deliveryMethod === "Delivery"
        ).length;

        const previousDeliveryCount = previousOrders.filter(
            (order) => order.deliveryMethod === "Delivery"
        ).length;

        const calculatePercent = (
            current: number,
            previous: number
        ) => {
            // Bulan sebelumnya 0
            if (previous === 0) {
                if (current === 0) return 0;
                return 100;
            }

            return ((current - previous) / previous) * 100;
        };

        return {
            orders: {
                current: currentOrderCount,
                previous: previousOrderCount,
                percent: calculatePercent(
                    currentOrderCount,
                    previousOrderCount
                ),
            },

            delivery: {
                current: currentDeliveryCount,
                previous: previousDeliveryCount,
                percent: calculatePercent(
                    currentDeliveryCount,
                    previousDeliveryCount
                ),
            },
        };
    },
});