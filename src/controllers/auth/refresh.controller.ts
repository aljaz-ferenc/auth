import { RequestHandler } from "express";
import { sendError } from "../../app";
import { prisma } from "../../lib/prisma";
import { AuthService } from "../../services/auth.service";

const authService = new AuthService();

export const refreshController: RequestHandler = async (req, res) => {
	const oldToken = req.cookies?.refreshToken;
	console.log("OLD_TOKEN: ", req.cookies);

	if (!oldToken) {
		return sendError(res, ["Missing refresh token"], 401);
	}

	const refreshTokenDB = await prisma.refreshToken.findUnique({
		where: { token: oldToken },
		include: { user: true },
	});

	if (!refreshTokenDB || refreshTokenDB.expiresAt < new Date()) {
		if (refreshTokenDB) {
			await authService.deleteRefreshToken(refreshTokenDB.token);
		}
		return sendError(res, ["Refresh token invalid"], 401);
	}

	const user = refreshTokenDB.user;

	await authService.deleteRefreshToken(refreshTokenDB.token);
	res.clearCookie("refreshToken");

	const newAccessToken = authService.generateAccessToken(user.id, user.email);
	const newRefreshToken = await authService.createRefreshToken(
		user.id,
		authService.generateRefreshToken(),
	);

	res.cookie("refreshToken", newRefreshToken.token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
		maxAge: 30 * 24 * 60 * 60 * 1000,
	});

	res.status(200).json({
		accessToken: newAccessToken,
		expiresIn: 900,
		user: { id: user.id, email: user.email },
	});
};
