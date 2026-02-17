import { RequestHandler } from "express";
import z from "zod";
import { sendError } from "../../app";
import { generateToken } from "../../lib/utils";
import { AuthService } from "../../services/auth.service";
import { EmailService } from "../../services/email.service";

const authService = new AuthService();
const emailService = new EmailService();

export const resendVerificationController: RequestHandler = async (
	req,
	res,
) => {
	const validated = z
		.email({ error: "Invalid email format" })
		.safeParse(req.body.email);

	if (!validated.success) {
		return sendError(res, ["Invalid email format"], 400);
	}

	const user = await authService.getUserByEmail(validated.data);
	if (!user) {
		return res.status(200).json({ message: "Verification email sent" });
	}

	if (user.isVerified) {
		return sendError(res, ["User already verified"], 400);
	}

	const newToken = generateToken();
	await authService.createEmailToken(user.id, newToken, "VERIFICATION");
	emailService.sendVerificationEmail(user.email, newToken);

	res.status(200).json({ message: "Verification email sent" });
};
