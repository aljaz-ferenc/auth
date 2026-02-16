import { RequestHandler } from "express";
import { aj } from "../config/arcjet";

export function arcjet(instance: keyof typeof aj): RequestHandler {
	return async (req, res, next) => {
		if (process.env.NODE_ENV === "test") {
			return next();
		}

		try {
			const decision = await aj[instance].protect(req, {
				requested: 1,
			});

			if (decision.isDenied()) {
				if (decision.reason.isRateLimit()) {
					return res.status(429).json({
						error: "Too many requests. Please try again later.",
					});
				}

				if (decision.reason.isBot()) {
					return res.status(403).json({
						error: "Automated requests are not allowed.",
					});
				}

				return res.status(403).json({
					error: "Access denied.",
				});
			}

			if (decision.ip.isHosting()) {
				console.warn(`Request from hosting IP: ${req.ip}`);
			}

			next();
		} catch (error) {
			console.error("Arcjet error:", error);
			next();
		}
	};
}
