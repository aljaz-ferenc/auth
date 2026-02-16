import path from "node:path";
import emailjs from "@emailjs/nodejs";
import dotenv from "dotenv";
import ejs from "ejs";
import { EmailToken } from "../../prisma/generated/prisma";
import { env } from "../config/env";

dotenv.config();

emailjs.init({ publicKey: env.EMAILJS_PUBLIC_KEY });

export class EmailService {
	async sendEmail(
		email: string,
		token: EmailToken["token"],
		type: EmailToken["type"],
		html: string,
	) {
		await emailjs.send(
			env.EMAILJS_SERVICE_ID,
			env.EMAILJS_TEMPLATE_ID,
			{
				email,
				html,
				subject:
					type === "VERIFICATION" ? "Verify Your Email" : "Reset Your Password",
			},
			{
				publicKey: env.EMAILJS_PUBLIC_KEY,
				privateKey: env.EMAILJS_PRIVATE_KEY,
			},
		);
	}

	async sendVerificationEmail(email: string, token: EmailToken["token"]) {
		if (process.env.NODE_ENV === "test") {
			console.log("Mock sendVerificationEmail running...");
			return;
		}
		const html = await this.generateEmailContent(
			"VERIFICATION",
			`${env.BASE_URL}/api/auth/verify-email?token=${token}`,
		);
		try {
			await this.sendEmail(email, token, "VERIFICATION", html);
		} catch (err) {
			console.error(err);
			throw new Error("Error sending verification email");
		}
	}

	async sendPasswordResetEmail(email: string, token: EmailToken["token"]) {
		if (process.env.NODE_ENV === "test") {
			console.log("Mock sendPasswordResetEmail running...");
			return;
		}
		const html = await this.generateEmailContent(
			"RESET_PASSWORD",
			`${env.BASE_URL}/api/auth/reset-password?token=${token}`,
		);

		try {
			await this.sendEmail(email, token, "RESET_PASSWORD", html);
		} catch (err) {
			console.error(err);
			throw new Error("Error sending reset email");
		}
	}

	private generateEmailContent(type: EmailToken["type"], link: string) {
		const passwordResetTemplate = path.join(
			__dirname,
			"../lib/templates",
			"pasword-reset-email.ejs",
		);
		const emailVerificationTemplate = path.join(
			__dirname,
			"../lib/templates",
			"email-verification-email.ejs",
		);

		const template =
			type === "VERIFICATION"
				? emailVerificationTemplate
				: passwordResetTemplate;

		return ejs.renderFile(template, { link });
	}
}
