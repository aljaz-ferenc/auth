import dotenv from "dotenv";
import { RequestHandler } from "express";
import { sendError } from "../../app";
import { loginUserSchema } from "../../lib/types";
import { AuthService } from "../../services/auth.service";

dotenv.config();

const authService = new AuthService();

export const loginController: RequestHandler = async (req, res) => {
	const data = loginUserSchema.parse(req.body);
	const user = await authService.getUserByEmail(data.email);

	if (!user) {
		return sendError(res, ["Invalid email or password"], 401);
	}

	if (!user.isVerified) {
		return sendError(res, ["Please verify your email"], 403);
	}

	if (!user.password) {
		return sendError(res, ["This account uses social login."], 400);
	}

	const isPasswordValid = await authService.isPasswordValid(
		data.password,
		user.password,
	);
	if (!isPasswordValid) {
		return sendError(res, ["Invalid email or password"], 403);
	}

	const accessToken = authService.generateAccessToken(user.id, user.email);
	const refreshToken = await authService.createRefreshToken(
		user.id,
		authService.generateRefreshToken(),
	);

	authService.updateLastLogin(user.id);

	res.cookie("refreshToken", refreshToken.token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
		maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
	});

	res.status(200).json({
		accessToken,
		expiresIn: 900,
		user: { id: user.id, email: user.email },
	});
};
