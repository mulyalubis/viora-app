import { v } from "convex/values";
import { mutation, query } from "./_generated/server";


export const addReview = mutation({
    args: {
        productId: v.id("products"),
        userId: v.id("users"),
        userName: v.string(),
        rating: v.number(),
        comment: v.string(),
    },
    handler: async (ctx, args) => {

        // 1️⃣ Validasi rating
        if (args.rating < 1 || args.rating > 5) {
            throw new Error("Rating harus antara 1 - 5");
        }

        // 2️⃣ Cek user sudah pernah review belum
        const existing = await ctx.db
            .query("reviews")
            .filter((q) =>
                q.and(
                    q.eq(q.field("productId"), args.productId),
                    q.eq(q.field("userId"), args.userId)
                )
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                rating: args.rating,
                comment: args.comment,
                createdAt: Date.now(),
            });
            return;
        }

        // 3️⃣ Insert review
        await ctx.db.insert("reviews", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

export const getProductRating = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        const reviews = await ctx.db
            .query("reviews")
            .withIndex("by_product", (q) =>
                q.eq("productId", args.productId)
            )
            .collect();

        if (reviews.length === 0) {
            return { avg: 0, total: 0 };
        }

        const total = reviews.reduce((sum, r) => sum + r.rating, 0);

        return {
            avg: total / reviews.length,
            total: reviews.length,
        };
    },
});

export const getReviewsByProduct = query({
    args: { productId: v.id("products") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("reviews")
            .withIndex("by_product", (q) =>
                q.eq("productId", args.productId)
            )
            .order("desc") // terbaru di atas
            .collect();
    },
});