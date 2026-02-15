import { RequestHandler } from "express";
import { sendError } from "../../app";
import { registerUserSchema } from "../../lib/types";
import { AuthService } from "../../services/auth.service";
import { EmailService } from "../../services/email.service";

const authService = new AuthService();
const emailService = new EmailService();

export const registerHandler: RequestHandler = async (req, res) => {
	const registerData = registerUserSchema.parse(req.body);
	const user = await authService.register(registerData);
	const token = user.emailTokens[0];

	if (!token) {
		return sendError(res, ["Error generating verification token"], 500);
	}

	await emailService.sendVerificationEmail(user.email, token.token);

	res.status(201).json({
		message:
			"Registration successful! Please check your email to verify your account.",
		user: { email: registerData.email },
	});
};
