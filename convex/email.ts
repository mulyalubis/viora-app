// "use node";

// import nodemailer from "nodemailer";
// import { action } from "./_generated/server";

// type Args = {
//     email: string;
//     otp: string;
// };

// export const sendOtp = action(async (_ctx, { email, otp }: Args) => {
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: process.env.GMAIL_USER!,
//             pass: process.env.GMAIL_PASS!,
//         },
//     });

//     await transporter.sendMail({
//         from: process.env.GMAIL_USER!,
//         to: email,
//         subject: "OTP Login",
//         text: `Kode OTP kamu: ${otp}`,
//     });
// });