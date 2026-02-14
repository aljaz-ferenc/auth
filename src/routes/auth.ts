import bcrypt from "bcrypt";
import express, { type Router } from "express";
import { prisma } from "../lib/prisma";
import { type RegisterUserInput, registerUserSchema } from "../lib/types";

const authRouter: Router = express.Router();

authRouter.post("/register", async (req, res) => {
	const validated = registerUserSchema.parse(req.body);
	const { name, email, password, username }: RegisterUserInput = validated;
	const hash = await bcrypt.hash(password, 10);

	await prisma.user.create({
		data: {
			email,
			password: hash,
			username: username ?? null,
			name: name ?? null,
		},
	});

	res.json({ message: 'Registration successful! Please check your email to verify your account.', user: { email: validated.email } });
});

// authRouter.post('/login', async (req, res) => {

// })

// authRouter.post('/verify-email', async (req, res) => {

// })

// authRouter.post('/refresh-token', async (req, res) => {

// })

// authRouter.post('/reset-password-request', async (req, res) => {

// })

// authRouter.post('/reset-password', async (req, res) => {

// })

export { authRouter };
