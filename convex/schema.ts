import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    products: defineTable(
        v.object({
            name: v.string(),
            price: v.number(),
            image: v.string(),
            detailImage: v.optional(v.string()),
            description: v.string(),
            brand: v.string(),
            stock: v.number(),
            sold: v.number(),
        })).index("by_brand", ["brand"]),
    users: defineTable(
        v.object({
            email: v.string(),
            name: v.string(),
            image: v.string(),
            provider: v.string(),
            role: v.union(
                v.literal("user"),
                v.literal("driver"),
                v.literal("admin")
            ),
            password: v.optional(v.string()),
            pushToken: v.optional(v.string()),
        })
    ).index("by_email", ["email"]),
    wishlist: defineTable({
        userId: v.id("users"),
        productId: v.string(),
        name: v.string(),
        price: v.number(),
        image: v.string(),
    }).index("by_userId", ["userId"]),
    cart: defineTable({
        userId: v.id("users"),
        productId: v.id("products"),
        name: v.string(),
        price: v.number(),
        image: v.string(),
        quantity: v.number(),
        brand: v.string(),
    }).index("by_userId", ["userId"]),
    emailOtps: defineTable({
        email: v.string(),
        name: v.string(),
        password: v.string(),
        otp: v.string(),
        expiredAt: v.number(),
        createdAt: v.number(),
    }).index("by_email", ["email"]),
    reviews: defineTable({
        userId: v.id("users"),
        userName: v.string(),
        productId: v.id("products"),
        comment: v.string(),
        rating: v.number(),
        createdAt: v.number(),
    }).index("by_product", ["productId"])
        .index("by_user_product", ["userId", "productId"]),
    promos: defineTable({
        code: v.string(),
        percentage: v.number(),
        isActive: v.boolean(),
    }).index("by_code", ["code"]),
    orders: defineTable({
        userId: v.id("users"),
        orderId: v.string(),
        globalOrderNumber: v.number(),
        amount: v.number(),
        status: v.string(),
        deliveryMethod: v.string(),
        paymentType: v.optional(v.string()),
        snapToken: v.optional(v.string()),
        paymentUrl: v.optional(v.string()),
        totalItems: v.optional(v.number()),
        address: v.string(),
        receiverName: v.string(),
        phoneNumber: v.string(),
        brands: v.array(v.string()),
        customerLatitude: v.number(),
        customerLongitude: v.number(),
        isDeliveryStarted: v.optional(v.boolean()),
        driverLatitude: v.optional(v.number()),
        driverLongitude: v.optional(v.number()),
        estimatedDuration: v.optional(v.number()),
        estimatedDistance: v.optional(v.number()),
        deliveryProgress: v.optional(
            v.array(
                v.object({
                    message: v.string(),
                    time: v.number(),
                })
            )
        ),
        driverName: v.optional(v.string()),
        driverHeading: v.optional(v.float64()),
        isFinished: v.optional(v.boolean()),
        createdAt: v.number(),
    }).index("by_orderId", ["orderId"])
        .index("by_user", ["userId"]),
    orderItems: defineTable({
        orderId: v.id("orders"),
        productId: v.id("products"),
        quantity: v.number(),
        price: v.number(),
    })
        .index("by_order", ["orderId"])
        .index("by_product", ["productId"]),
    addresses: defineTable({
        userId: v.id("users"),
        fullAddress: v.string(),
        labelAddress: v.string(),
        receiverName: v.string(),
        phoneNumber: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        isPrimary: v.boolean(),
    }).index("by_userId", ["userId"])
        .index("by_isPrimary", ["isPrimary"]),
    notifications: defineTable({
        userId: v.optional(v.id("users")),
        title: v.string(),
        message: v.string(),
        createdAt: v.number(),
        isSent: v.boolean(),
        isGlobal: v.boolean(),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        isExpired: v.optional(v.boolean()),
    }),
    hiddenNotifications: defineTable({
        userId: v.id("users"),
        notificationId: v.id("notifications"),
    }),
    stockHistory: defineTable({
        productId: v.id("products"),
        quantity: v.number(),
        type: v.union(
            v.literal("IN"),
            v.literal("OUT")
        ),
        adminName: v.string(),
    }).index("by_product", ["productId"]),
});