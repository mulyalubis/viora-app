import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addAddress = mutation({
    args: {
        userId: v.id("users"),
        fullAddress: v.string(),
        labelAddress: v.string(),
        receiverName: v.string(),
        phoneNumber: v.string(),
        latitude: v.number(),
        longitude: v.number(),
    },

    handler: async (ctx, args) => {

        await ctx.db.insert("addresses", {
            userId: args.userId,
            fullAddress: args.fullAddress,
            labelAddress: args.labelAddress,
            receiverName: args.receiverName,
            phoneNumber: args.phoneNumber,
            latitude: args.latitude,
            longitude: args.longitude,
            isPrimary: false,
        });

    },
});

export const getMyAddress = query({
    args: {
        userId: v.id("users"),
    },

    handler: async (ctx, args) => {

        return await ctx.db
            .query("addresses")
            .filter((q) =>
                q.eq(q.field("userId"), args.userId)
            )
            .collect();
    },
});

export const setPrimaryAddress = mutation({
    args: {
        userId: v.id("users"),
        addressId: v.id("addresses"),
    },

    handler: async (ctx, args) => {

        const addresses = await ctx.db
            .query("addresses")
            .filter((q) =>
                q.eq(
                    q.field("userId"),
                    args.userId
                )
            )
            .collect();

        // reset semua alamat
        for (const item of addresses) {

            await ctx.db.patch(item._id, {
                isPrimary: false,
            });
        }

        // set alamat utama
        await ctx.db.patch(args.addressId, {
            isPrimary: true,
        });
    },
});

export const updateAddress = mutation({
    args: {
        addressId: v.id("addresses"),
        fullAddress: v.string(),
        labelAddress: v.string(),
        receiverName: v.string(),
        phoneNumber: v.string(),
        latitude: v.number(),
        longitude: v.number(),
    },

    handler: async (ctx, args) => {

        await ctx.db.patch(args.addressId, {
            fullAddress: args.fullAddress,
            labelAddress: args.labelAddress,
            receiverName: args.receiverName,
            phoneNumber: args.phoneNumber,
            latitude: args.latitude,
            longitude: args.longitude,
        });
    },
});

export const deleteAddress = mutation({
    args: {
        addressId: v.id("addresses"),
    },

    handler: async (ctx, args) => {

        await ctx.db.delete(args.addressId);
    },
});