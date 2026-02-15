import { addHours } from "date-fns";
import { RequestHandler } from "express";
import { sendError } from "../../app";
import { sendVerificationEmail } from "../../lib/email";
import { prisma } from "../../lib/prisma";
import { RegisterUserInput, registerUserSchema } from "../../lib/types";
import { generateToken, hashPassword } from "../../lib/utils";

export const registerHandler: RequestHandler = async (req, res) => {
	const validated = registerUserSchema.parse(req.body);
	const { name, email, password, username }: RegisterUserInput = validated;
	const hash = await hashPassword(password);

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
};
