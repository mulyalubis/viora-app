import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
    args: {
        email: v.string(),
        name: v.string(),
        image: v.string(),
        provider: v.string(),
        password: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // 🔍 cek apakah user sudah ada
        const existing = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (existing) {
            return existing;
        }
        return await ctx.db.insert("users", {
            email: args.email,
            name: args.name,
            image: args.image,
            provider: args.provider,
            role: "user", // default
            password: args.password,
        });
    },
});

export const getUserByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .unique();

        return user;
    },
});

export const loginUser = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (!user) {
            return { success: false, message: "Email tidak ditemukan" };
        }

        if (user.password !== args.password) {
            return { success: false, message: "Password salah" };
        }

        if (user.provider !== "manual") {
            return { success: false, message: "Gunakan login Google" };
        }

        return { success: true, user, };
    },
});

export const savePushToken = mutation({
    args: {
        userId: v.id("users"),
        pushToken: v.string(),
    },

    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            pushToken: args.pushToken,
        });
    },
});

export const getUserById = query({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const loginAdmin = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },

    handler: async (ctx, args) => {
        const users = await ctx.db
            .query("users")
            .collect();

        const admin = users.find(
            (user) =>
                user.email === args.email &&
                user.password === args.password &&
                user.role === "admin"
        );

        if (!admin) {
            throw new Error("Email atau password salah");
        }

        return {
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            image: admin.image,
            role: admin.role,
        };
    },
});

export const loginDriver = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },

    handler: async (ctx, args) => {
        const driver = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (!driver) {
            throw new Error("Email tidak ditemukan");
        }

        if (driver.password !== args.password) {
            throw new Error("Password salah");
        }

        if (driver.role !== "driver") {
            throw new Error("Akun bukan driver");
        }

        return driver;
    },
});