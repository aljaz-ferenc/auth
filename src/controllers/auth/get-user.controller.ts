import { RequestHandler } from "express";
import { sendError } from "../../app";
import { AuthService } from "../../services/auth.service";

const authService = new AuthService();

export const getUserController: RequestHandler = async (req, res) => {
	if (!req.user?.id) {
		return sendError(res, ["User not found"], 404);
	}

	const user = await authService.getUserById(req.user.id, false);

	if (!user) {
		return sendError(res, ["User not found"], 404);
	}

	res.status(200).json(user);
};
