import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createOrderItems = mutation({
    args: {
        orderId: v.id("orders"),

        items: v.array(
            v.object({
                productId: v.id("products"),
                quantity: v.number(),
                price: v.number(),
            })
        ),
    },

    handler: async (ctx, args) => {

        for (const item of args.items) {

            await ctx.db.insert("orderItems", {
                orderId: args.orderId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            });

        }
    },
});