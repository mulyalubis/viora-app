import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Fungsi untuk menambah atau menghapus produk dari wishlist (Toggle)
export const toggleWishlist = mutation({
    args: {
        userId: v.id("users"),
        productId: v.string(),
        name: v.string(),
        price: v.number(),
        image: v.string()
    },
    handler: async (ctx, args) => {
        // Cek apakah produk ini sudah ada di wishlist user tersebut
        const existing = await ctx.db
            .query("wishlist")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("productId"), args.productId))
            .unique();

        if (existing) {
            // Jika ada, hapus (Unlike)
            await ctx.db.delete(existing._id);
            return { status: "removed" };
        } else {
            // Jika tidak ada, tambah (Like)
            await ctx.db.insert("wishlist", {
                userId: args.userId,
                productId: args.productId,
                name: args.name,
                price: args.price,
                image: args.image
            });
            return { status: "added" };
        }
    },
});

// Fungsi untuk mengambil daftar wishlist milik user yang sedang login
export const getMyWishlist = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("wishlist")
            .filter(q => q.eq(q.field("userId"), args.userId))
            .collect();
    },
});