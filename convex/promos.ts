// convex/promos.ts
import { v } from "convex/values";
import { query } from "./_generated/server";

export const checkPromo = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const promo = await ctx.db
            .query("promos")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .unique();

        if (!promo || !promo.isActive) {
            return null;
        }
        return promo;
    },
});