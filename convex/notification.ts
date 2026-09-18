import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

export const getAllNotifications = query({
    args: {},

    handler: async (ctx) => {

        return await ctx.db
            .query("notifications")
            .order("desc")
            .collect();

    },
});

export const getMyNotifications = query({
    args: {
        userId: v.id("users"),
    },

    handler: async (ctx, args) => {

        // notif yang di-hide user
        const hidden =
            await ctx.db
                .query("hiddenNotifications")
                .filter((q) =>
                    q.eq(q.field("userId"), args.userId)
                )
                .collect();

        // ambil id notif
        const hiddenIds = hidden.map(
            (item) => item.notificationId.toString()
        );

        // semua notif
        const notifications =
            await ctx.db
                .query("notifications")
                .order("desc")
                .collect();

        const now = Date.now();

        return notifications.filter((notif) => {
            const hidden =
                hiddenIds.includes(notif._id.toString());

            const started =
                !notif.startDate || now >= notif.startDate;

            const notExpired =
                !notif.endDate || now <= notif.endDate;

            return (
                notif.isSent &&
                started &&
                notExpired &&
                (notif.isGlobal ||
                    notif.userId === args.userId) &&
                !hidden
            );
        });

    },
});

export const createDraftNotification = mutation({
    args: {},

    handler: async (ctx) => {

        return await ctx.db.insert("notifications", {
            userId: undefined,
            title: "Promo Viora",
            message: "",
            createdAt: Date.now(),

            isSent: false,
            isGlobal: true,

            startDate: undefined,
            endDate: undefined,
        });

    },
});

// export const createNotification = mutation({
//     args: {
//         userId: v.id("users"),
//         title: v.string(),
//         message: v.string(),
//     },

//     handler: async (ctx, args) => {

//         await ctx.db.insert("notifications", {
//             userId: args.userId,
//             title: args.title,
//             message: args.message,
//             createdAt: Date.now(),
//             isSent: true,
//             isGlobal: false,
//         });

//     },
// });


export const updateNotification = mutation({
    args: {
        id: v.id("notifications"),
        title: v.string(),
        message: v.string(),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },

    handler: async (ctx, args) => {

        await ctx.db.patch(args.id, {
            title: args.title,
            message: args.message,
            startDate: args.startDate,
            endDate: args.endDate,
        });

    },
});

export const deleteNotification = mutation({
    args: {
        id: v.id("notifications"),
    },

    handler: async (ctx, args) => {

        await ctx.db.delete(args.id);

    },
});

export const sendNotification = mutation({
    args: {
        id: v.id("notifications"),
    },

    handler: async (ctx, args) => {

        await ctx.db.patch(args.id, {
            isSent: true,
        });

    },
});

export const deleteAllNotifications = mutation({
    args: {},

    handler: async (ctx) => {

        const notifications =
            await ctx.db
                .query("notifications")
                .collect();

        for (const notif of notifications) {
            await ctx.db.delete(notif._id);
        }

    },
});

export const hideNotificationForUser = mutation({
    args: {
        userId: v.id("users"),
        notificationId: v.id("notifications"),
    },

    handler: async (ctx, args) => {

        // cek biar tidak duplicate
        const existing = await ctx.db
            .query("hiddenNotifications")
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), args.userId),
                    q.eq(
                        q.field("notificationId"),
                        args.notificationId
                    )
                )
            )
            .first();

        if (existing) return;

        await ctx.db.insert("hiddenNotifications", {
            userId: args.userId,
            notificationId: args.notificationId,
        });

    },
});

export const sendPushNotification = action({
    args: {
        expoPushToken: v.string(),
        title: v.string(),
        body: v.string(),
    },

    handler: async (_, args) => {
        const res = await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to: args.expoPushToken,
                title: args.title,
                body: args.body,
            }),
        });

        const data = await res.json();
        console.log("PUSH RESPONSE:", data);
    },
});

export const getNotificationById = query({
    args: {
        id: v.id("notifications"),
    },

    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    }
})