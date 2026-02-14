import bcrypt from "bcrypt";
import crypto from 'crypto';
import { addHours } from "date-fns";
import express, { type Router } from "express";
import { sendError } from "../app";
import { sendVerificationEmail } from "../lib/email";
import { prisma } from "../lib/prisma";
import { type RegisterUserInput, registerUserSchema } from "../lib/types";

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
					token: crypto.randomBytes(32).toString('hex'),
					type: 'verification',
					expiresAt: addHours(new Date(), 24)
				}
			}
		},
		include: {
			emailTokens: true
		}
	});

	const token = user.emailTokens[0];

	if (!token) {
		return sendError(res, ['Error generating verification token'], 500)
	}

	await sendVerificationEmail(user.email, token.token)

	res.json({
		message:
			"Registration successful! Please check your email to verify your account.",
		user: { email: validated.email },
	});
});


// authRouter.get('/verify-email', async (req, res) => {
// 	const { token } = req.query

// 	if (!token) {
// 		sendError(res, ['Verification token missing'], 400)
// 	}
// })

export { authRouter };
