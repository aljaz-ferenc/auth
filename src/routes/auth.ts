import bcrypt from "bcrypt";
import { addHours } from "date-fns";
import express, { type Router } from "express";
import z from "zod";
import { sendError } from "../app";
import { sendVerificationEmail } from "../lib/email";
import { prisma } from "../lib/prisma";
import { type RegisterUserInput, registerUserSchema } from "../lib/types";
import { generateToken } from "../lib/utils";

const authRouter: Router = express.Router();

authRouter.post("/register", async (req, res) => {
	const validated = registerUserSchema.parse(req.body);
	const { name, email, password, username }: RegisterUserInput = validated;
	const hash = await bcrypt.hash(password, 10);

	const user = await prisma.user.create({
		data: {
			email,
			password: hash,
			username: username ?? null,
			name: name ?? null,
			emailTokens: {
				create: {
					token: generateToken(),
					type: "VERIFICATION",
					expiresAt: addHours(new Date(), 24),
				},
			},
		},
		include: {
			emailTokens: true,
		},
	});

	const token = user.emailTokens[0];

	if (!token) {
		return sendError(res, ["Error generating verification token"], 500);
	}

	sendVerificationEmail(user.email, token.token);

	res.status(201).json({
		message:
			"Registration successful! Please check your email to verify your account.",
		user: { email: validated.email },
	});
});

authRouter.get("/verify-email", async (req, res) => {
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
});
export { authRouter };

authRouter.post("/resend-verification", async (req, res) => {
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
});
