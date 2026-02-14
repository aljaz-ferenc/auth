import bcrypt from "bcrypt";
import express, { type Router } from "express";
import { prisma } from "../lib/prisma";
import { type RegisterUserInput, registerUserSchema } from "../lib/types";

const authRouter: Router = express.Router();

authRouter.post("/register", async (req, res) => {
	const validation = registerUserSchema.safeParse(req.body);

	if (!validation.success) {
		return res
			.status(400)
			.json({ message: validation.error.message, error: validation.error });
	}

	const { name, email, password, username }: RegisterUserInput = req.body;

	const hash = await bcrypt.hash(password, 10);

	try {
		await prisma.user.create({
			data: {
				email,
				password: hash,
				username: username ?? null,
				name: name ?? null,
			},
		});

		res.json(validation.data);
	} catch (error) {
		console.log(error);
		res
			.status(400)
			.json({ message: "Something went wrong registering user", error });
	}
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
