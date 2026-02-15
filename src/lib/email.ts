import emailjs from "@emailjs/nodejs";
import dotenv from "dotenv";
import { env } from "../config/env";

dotenv.config();

emailjs.init({ publicKey: "mfRAgHp5HiRnef3D4" });

export async function sendVerificationEmail(email: string, token: string) {
	if (process.env.NODE_ENV === "test") {
		console.log("Mock sendVerificationEmail running...");
		return;
	}

	try {
		await emailjs
			.send(
				env.EMAILJS_SERVICE_ID,
				env.EMAILJS_TEMPLATE_ID,
				{
					verificationLink: `${env.BASE_URL}/api/auth/verify-email?token=${token}`,
					email,
				},
				{
					publicKey: env.EMAILJS_PUBLIC_KEY,
					privateKey: env.EMAILJS_PRIVATE_KEY,
				},
			)
			.catch((err) => console.log(err));
	} catch (err) {
		throw err;
	}
}
