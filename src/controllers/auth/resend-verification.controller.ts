import { RequestHandler } from "express";
import z from "zod";
import { sendError } from "../../app";
import { sendVerificationEmail } from "../../lib/email";
import { generateToken } from "../../lib/utils";
import { AuthService } from "../../services/auth.service";

const authService = new AuthService();

export const resendVerificationController: RequestHandler = async (
	req,
	res,
) => {
	const validated = z.email().safeParse(req.body.email);

	if (!validated.success) {
		return sendError(res, ["Invalid email format"], 400);
	}

	const user = await authService.getUserByEmail(validated.data);
	if (!user) {
		return sendError(
			res,
			["If an account exists, a verification email has been sent"],
			200,
		);
	}

	if (user.isVerified) {
		return sendError(res, ["User already verified"], 400);
	}

	const newToken = generateToken();
	await authService.createEmailToken(user.id, newToken, "VERIFICATION");
	sendVerificationEmail(user.email, newToken);

	res.status(200).json({ message: "Verification email sent" });
};
