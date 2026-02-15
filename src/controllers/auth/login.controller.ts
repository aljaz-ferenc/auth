import bcrypt from "bcrypt";
import crypto from "crypto";
import { addDays } from "date-fns";
import dotenv from "dotenv";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../../app";
import { prisma } from "../../lib/prisma";
import { loginUserSchema } from "../../lib/types";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in .env");

export const loginHandler: RequestHandler = async (req, res) => {
	const { email, password } = req.body;
	const validated = loginUserSchema.parse({ email, password });

	const user = await prisma.user.findUnique({ where: { email } });

	if (!user) {
		return sendError(res, ["Invalid email or password"], 401);
	}

	if (!user.isVerified) {
		return sendError(res, ["Please verify your email"], 403);
	}

	if (!user.password) {
		return sendError(
			res,
			["This account uses social login. Please log in with Google."],
			400,
		);
	}

	const match = await bcrypt.compare(validated.password, user.password);

	if (!match) {
		return sendError(res, ["Invalid email or password"], 403);
	}

	const accessToken = jwt.sign(
		{ userId: user.id, email: user.email },
		JWT_SECRET,
		{ expiresIn: "15m" },
	);

	const refreshToken = crypto.randomBytes(40).toString("hex");

	await prisma.refreshToken.create({
		data: {
			token: refreshToken,
			userId: user.id,
			expiresAt: addDays(new Date(), 30),
		},
	});

	await prisma.user.update({
		where: { email },
		data: { lastLogin: new Date() },
	});

	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
	});

	res.status(200).json({
		accessToken,
		expiresIn: 900,
		user: { id: user.id, email: user.email },
	});
};
