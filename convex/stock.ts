import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addStock = mutation({
    args: {
        productId: v.id("products"),
        quantity: v.number(),
        adminName: v.string(),
    },

    handler: async (ctx, args) => {

        const product = await ctx.db.get(args.productId);

        if (!product) {
            throw new Error("Product tidak ditemukan");
        }

        // update stock
        await ctx.db.patch(product._id, {
            stock: product.stock + args.quantity,
        });

        // simpan histori
        await ctx.db.insert("stockHistory", {
            productId: product._id,
            quantity: args.quantity,
            type: "IN",
            adminName: args.adminName,
        });
    },
});

export const getIncomingToday = query({
    args: {
        productId: v.id("products"),
    },

    handler: async (ctx, args) => {

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const histories =
            await ctx.db
                .query("stockHistory")
                .withIndex("by_product",
                    q => q.eq("productId", args.productId))
                .collect();

        return histories
            .filter(item =>
                item.type === "IN" &&
                item._creationTime >= today.getTime()
            )
            .reduce(
                (sum, item) => sum + item.quantity,
                0
            );
    },
});

export const checkCartStock = query({
    args: {
        items: v.array(
            v.object({
                productId: v.id("products"),
                quantity: v.number(),
            })
        ),
    },

    handler: async (ctx, args) => {
        for (const item of args.items) {
            const product = await ctx.db.get(item.productId);

            if (!product) {
                return {
                    success: false,
                    message: "Produk tidak ditemukan",
                };
            }

            if (product.stock <= 0) {
                return {
                    success: false,
                    message: `${product.name} sudah habis.`,
                };
            }

            if (item.quantity > product.stock) {
                return {
                    success: false,
                    message: `${product.name} hanya tersisa ${product.stock} buah.`,
                };
            }
        }

        return {
            success: true,
            message: "Stok tersedia",
        };
    },
});