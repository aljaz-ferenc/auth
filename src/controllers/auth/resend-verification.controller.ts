import { addHours } from "date-fns";
import { RequestHandler } from "express";
import z from "zod";
import { sendError } from "../../app";
import { sendVerificationEmail } from "../../lib/email";
import { prisma } from "../../lib/prisma";
import { generateToken } from "../../lib/utils";

export const resendVerificationHandler: RequestHandler = async (req, res) => {
	const { email } = req.body;
	const validated = z.email().safeParse(email);

	if (!validated.success) {
		return sendError(res, ["Invalid email format"], 400);
	}

	const user = await prisma.user.findUnique({
		where: { email: validated.data },
	});

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

	await prisma.$transaction(async (tx) => {
		await tx.emailToken.deleteMany({
			where: { userId: user.id },
		});

		await tx.emailToken.create({
			data: {
				token: newToken,
				type: "VERIFICATION",
				userId: user.id,
				expiresAt: addHours(new Date(), 24),
			},
		});
	});

	sendVerificationEmail(user.email, newToken);
	res.status(200).json({ message: "Verification email sent" });
};
