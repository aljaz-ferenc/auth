import { RequestHandler } from "express";
import { sendError } from "../../app";
import { prisma } from "../../lib/prisma";

export const verifyEmailHandler: RequestHandler = async (req, res) => {
	const { token } = req.query;

	if (!token) {
		return sendError(res, ["Verification token missing"], 400);
	}
	const tokenDB = await prisma.emailToken.findFirst({
		where: {
			token: token.toString(),
		},
	});

	if (!tokenDB) {
		return sendError(res, ["Invalid verification link"], 404);
	}

	const isExpired = new Date() > tokenDB.expiresAt;

	if (isExpired) {
		await prisma.emailToken.delete({
			where: { id: tokenDB.id },
		});
		return sendError(res, ["Expired verification link"], 400);
	}

	const user = await prisma.user.findUnique({
		where: { id: tokenDB.userId },
	});

	if (!user) {
		return sendError(res, ["User not found"], 404);
	}

	if (user.isVerified) {
		await prisma.emailToken.delete({
			where: { id: tokenDB.id },
		});

		return res.status(200).json({ message: "Email already verified" });
	}

	await prisma.user.update({
		where: { id: tokenDB.userId },
		data: {
			isVerified: true,
			emailTokens: {
				delete: { id: tokenDB.id },
			},
		},
	});

	return res.status(200).json({
		message: "Email verified successfully",
	});
};
