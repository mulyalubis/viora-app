import { v } from "convex/values";
import { Resend } from "resend";
import { api } from "./_generated/api";
import { action, mutation } from "./_generated/server";


const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOtp = action({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
    },

    handler: async (ctx, args) => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 1. simpan ke DB
        await ctx.runMutation(api.auth.saveOtp, {
            name: args.name,
            email: args.email,
            password: args.password,
            otp,
        });

        // 2. kirim email
        const resend = new Resend(process.env.RESEND_API_KEY!);

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: args.email,
            subject: "Kode OTP",
            html: `<h1>${otp}</h1>`,
        });

        return {
            success: true,
            message: "OTP berhasil dikirim",
        };
    },
});

/* ===============================
   VERIFIKASI OTP
================================= */
export const verifyOtp = mutation({
    args: {
        email: v.string(),
        otp: v.string(),
    },

    handler: async (ctx, args) => {
        const data = await ctx.db
            .query("emailOtps")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (!data) {
            throw new Error("OTP tidak ditemukan");
        }

        if (Date.now() > data.expiredAt) {
            throw new Error("OTP expired");
        }

        if (data.otp !== args.otp) {
            throw new Error("OTP salah");
        }

        // buat user
        await ctx.runMutation(api.users.createUser, {
            email: data.email,
            name: data.name,
            password: data.password,
            image: "",
            provider: "manual",
        });

        // hapus OTP
        await ctx.db.delete(data._id);

        return {
            success: true,
            message: "Register berhasil",
        };
    },
});


export const saveOtp = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        otp: v.string(),
    },

    handler: async (ctx, args) => {
        const oldOtp = await ctx.db
            .query("emailOtps")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .collect();

        for (const item of oldOtp) {
            await ctx.db.delete(item._id);
        }

        await ctx.db.insert("emailOtps", {
            email: args.email,
            name: args.name,
            password: args.password,
            otp: args.otp,
            expiredAt: Date.now() + 1000 * 60 * 5,
            createdAt: Date.now(),
        });
    },
});

// import { v } from "convex/values";
// import { api } from "./_generated/api";
// import { action, mutation, query } from "./_generated/server";

// const generateOtp = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// };

// /* ==================================================
//    QUERY: cek user by email
// ================================================== */
// export const getUserByEmail = query({
//     args: {
//         email: v.string(),
//     },

//     handler: async (ctx, args) => {
//         return await ctx.db
//             .query("users")
//             .withIndex("by_email", (q) => q.eq("email", args.email))
//             .unique();
//     },
// });

// /* ==================================================
//    MUTATION: hapus OTP lama + simpan OTP baru
// ================================================== */
// export const saveOtp = mutation({
//     args: {
//         name: v.string(),
//         email: v.string(),
//         password: v.string(),
//         otp: v.string(),
//     },

//     handler: async (ctx, args) => {
//         const oldOtp = await ctx.db
//             .query("emailOtps")
//             .withIndex("by_email", (q) => q.eq("email", args.email))
//             .collect();

//         for (const item of oldOtp) {
//             await ctx.db.delete(item._id);
//         }

//         await ctx.db.insert("emailOtps", {
//             email: args.email,
//             name: args.name,
//             password: args.password,
//             otp: args.otp,
//             expiredAt: Date.now() + 1000 * 60 * 5,
//             createdAt: Date.now(),
//         });

//         return { success: true };
//     },
// });

// /* ==================================================
//    ACTION: kirim OTP ke email
// ================================================== */
// export const sendOtp = action({
//     args: {
//         name: v.string(),
//         email: v.string(),
//         password: v.string(),
//     },

//     handler: async (ctx, args) => {
//         const existingUser = await ctx.runQuery(api.auth.getUserByEmail, {
//             email: args.email,
//         });

//         if (existingUser) {
//             throw new Error("Email sudah terdaftar");
//         }

//         const otp = generateOtp();

//         await ctx.runAction(api.email.sendOtp, {
//             email: args.email,
//             otp,
//         });

//         try {

//             await ctx.runMutation(api.auth.saveOtp, {
//                 name: args.name,
//                 email: args.email,
//                 password: args.password,
//                 otp,
//             });

//             return {
//                 success: true,
//                 message: "OTP berhasil dikirim",
//             };
//         } catch (err) {
//             console.log(err);
//             throw new Error("Gagal mengirim OTP");
//         }
//     },
// });

// export const verifyOtp = mutation({
//     args: {
//         email: v.string(),
//         otp: v.string(),
//     },

//     handler: async (ctx, args) => {
//         // cari OTP di database
//         const record = await ctx.db
//             .query("emailOtps")
//             .withIndex("by_email", (q) => q.eq("email", args.email))
//             .unique();

//         if (!record) {
//             throw new Error("OTP tidak ditemukan");
//         }

//         // cek expired
//         if (Date.now() > record.expiredAt) {
//             throw new Error("OTP sudah expired");
//         }

//         // cek OTP cocok atau tidak
//         if (record.otp !== args.otp) {
//             throw new Error("OTP salah");
//         }

//         // ambil user data dari OTP (karena kamu simpan di saveOtp)
//         const user = await ctx.db
//             .query("users")
//             .withIndex("by_email", (q) => q.eq("email", args.email))
//             .unique();

//         if (!user) {
//             // kalau belum ada user, buat user baru
//             await ctx.db.insert("users", {
//                 name: record.name,
//                 email: record.email,
//                 password: record.password,
//                 role: "user",
//                 provider: "manual",
//                 image: "",
//             });
//         }

//         // hapus OTP setelah berhasil
//         await ctx.db.delete(record._id);

//         return {
//             success: true,
//             message: "OTP berhasil diverifikasi",
//         };
//     },
// });