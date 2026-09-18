import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const addToCart = mutation({
    args: {
        userId: v.id("users"),
        productId: v.id("products"),
        name: v.string(),
        price: v.number(),
        image: v.string(),
        brand: v.string(),
    },

    handler: async (ctx, args) => {
        const product = await ctx.db.get(args.productId);

        if (!product) {
            return {
                success: false,
                message: "Produk tidak ditemukan.",
            };
        }

        const existing = await ctx.db
            .query("cart")
            .withIndex("by_userId", q => q.eq("userId", args.userId))
            .filter(q => q.eq(q.field("productId"), args.productId))
            .unique();

        const currentQty = existing?.quantity ?? 0;

        if (product.stock <= 0) {
            return {
                success: false,
                message: `${product.name} sudah habis.`,
            };
        }

        if (currentQty >= product.stock) {
            return {
                success: false,
                message: `${product.name} hanya tersisa ${product.stock} buah.`,
            };
        }

        if (existing) {
            await ctx.db.patch(existing._id, {
                quantity: existing.quantity + 1,
            });
        } else {
            await ctx.db.insert("cart", {
                ...args,
                quantity: 1,
            });
        }

        return {
            success: true,
        };
    },
});


export const decreaseQty = mutation({
    args: {
        userId: v.id("users"),
        productId: v.id("products"),
    },
    handler: async (ctx, args) => {
        const item = await ctx.db
            .query("cart")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("productId"), args.productId))
            .unique();

        if (!item) return;

        if (item.quantity > 1) {
            await ctx.db.patch(item._id, {
                quantity: item.quantity - 1,
            });
        } else {
            await ctx.db.delete(item._id);
        }
    },
});

export const removeItem = mutation({
    args: {
        userId: v.id("users"),
        productId: v.id("products"),
    },
    handler: async (ctx, args) => {
        const item = await ctx.db
            .query("cart")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("productId"), args.productId))
            .unique();

        if (!item) return;

        await ctx.db.delete(item._id);
    },
});


export const getMyCart = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;
        return await ctx.db
            .query("cart")
            .withIndex("by_userId", (q) => q.eq("userId", userId))
            .collect();
    },
});