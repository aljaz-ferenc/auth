import { RequestHandler } from "express";
import z from "zod";
import { sendError } from "../../app";
import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/utils";
import { AuthService } from "../../services/auth.service";

const resetPasswordBodySchema = z.object({
	token: z.string().min(1, { error: "Reset token is required" }),
	password: z.string().min(1, { error: "Password is required" }),
});

const authService = new AuthService();

export const resetPasswordController: RequestHandler = async (req, res) => {
	const validated = resetPasswordBodySchema.parse(req.body);
	const resetToken = await authService.getEmailToken(validated.token);

	if (!resetToken) {
		return sendError(res, ["Token not found"], 404);
	}

	const isExpired = resetToken.expiresAt < new Date();
	if (isExpired) {
		return sendError(res, ["Token expired"], 400);
	}

	const user = await authService.getUserById(resetToken.userId, false);
	if (!user) {
		return sendError(res, ["User not found"], 404);
	}

	await prisma.$transaction(async (tx) => {
		await tx.user.update({
			where: { id: user.id },
			data: { password: await hashPassword(validated.password) },
		});

		await tx.emailToken.delete({
			where: { id: resetToken.id },
		});

		await tx.refreshToken.deleteMany({
			where: { userId: user.id },
		});
	});

	res.clearCookie("refreshToken");
	res.status(200).json({ message: "Password has been reset" });
};
