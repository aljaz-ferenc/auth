import { RequestHandler } from "express";
import { AuthService } from "../../services/auth.service";

const authService = new AuthService();

export const logoutController: RequestHandler = async (req, res) => {
	const refreshToken = req.cookies?.refreshToken;

	if (refreshToken) {
		authService.deleteRefreshToken(refreshToken).catch(console.error);
	}

	res.clearCookie("refreshToken");

	return res.status(200).json({ message: "Logged out successfully" });
};
