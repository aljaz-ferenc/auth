import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../app";
import { env } from "../config/env";
import { jwtPayloadSchema } from "../lib/types";

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string;
				email: string;
			};
		}
	}
}

export const requireAuth: RequestHandler = (req, res, next) => {
	const accessToken = req.headers.authorization?.split("Bearer ")[1];

	if (!accessToken) {
		return sendError(res, ["Not logged in"], 401);
	}

	const verifiedToken = jwtPayloadSchema.parse(
		jwt.verify(accessToken, env.JWT_SECRET),
	);

	req.user = {
		id: verifiedToken.userId,
		email: verifiedToken.email,
	};

	next();
};
