import emailjs from "@emailjs/nodejs";
import dotenv from 'dotenv';

dotenv.config()

const [EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PRIVATE_KEY, BASE_URL] = [
    process.env.EMAILJS_PUBLIC_KEY as string,
    process.env.EMAILJS_SERVICE_ID as string,
    process.env.EMAILJS_TEMPLATE_ID as string,
    process.env.EMAILJS_PRIVATE_KEY as string,
    process.env.BASE_URL as string
];

if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PRIVATE_KEY) {
    throw new Error("Missing EMAILJS credentials");
}

if (!BASE_URL) {
    throw new Error('Missing BASE_URL in .env')
}

emailjs.init({ publicKey: "mfRAgHp5HiRnef3D4" });

export async function sendVerificationEmail(email: string, token: string) {
    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            verificationLink: `${BASE_URL}/api/auth/verify-email?token=${token}`,
            email
        }, { publicKey: EMAILJS_PUBLIC_KEY, privateKey: EMAILJS_PRIVATE_KEY }).catch(err => console.log(err))
    } catch (err) {
        throw err
    }
}
