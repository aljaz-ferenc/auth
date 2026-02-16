import { RequestHandler } from "express";
import z from "zod";
import { AuthService } from "../../services/auth.service";
import { EmailService } from "../../services/email.service";

const emailService = new EmailService();
const authService = new AuthService();

export const forgotPasswordController: RequestHandler = async (req, res) => {
	const validated = z
		.email({ error: "Invalid email format" })
		.parse(req.body.email);

	const user = await authService.getUserByEmail(validated);

	if (!user) {
		return res.status(200).json({
			message: "If the user exists, a reset link will be sent to their email",
		});
	}

	const emailToken = await authService.createEmailToken(
		user.id,
		authService.generateResetToken(),
		"RESET_PASSWORD",
		1,
	);
	emailService.sendPasswordResetEmail(user.email, emailToken.token);

	return res.status(200).json({
		message: "If the user exists, a reset link will be sent to their email",
	});
};
