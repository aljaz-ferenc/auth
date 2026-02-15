import { RequestHandler } from "express";
import { sendError } from "../../app";
import { verifyEmailBodySchema } from "../../lib/types";
import { AuthService } from "../../services/auth.service";

const authService = new AuthService();

export const verifyEmailController: RequestHandler = async (req, res) => {
	const { token } = verifyEmailBodySchema.parse(req.query);
	const tokenDB = await authService.getEmailToken(token.toString());

	if (!tokenDB) {
		return sendError(res, ["Invalid verification link"], 404);
	}

	if (authService.isEmailTokenExpired(tokenDB)) {
		await authService.deleteEmailToken(tokenDB.id);
		return sendError(res, ["Expired verification link"], 400);
	}

	const user = await authService.getUserById(tokenDB.userId, false);

	if (!user) {
		return sendError(res, ["User not found"], 404);
	}

	if (user.isVerified) {
		await authService.deleteEmailToken(tokenDB.id);
		return res.status(200).json({ message: "Email already verified" });
	}

	await authService.verifyUser(tokenDB.userId, tokenDB.id);

	return res.status(200).json({
		message: "Email verified successfully",
	});
};
