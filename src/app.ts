import cors from "cors";
import express, { type Express, Response } from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorRequestHandler } from "./error-handlers";
import { authRouter } from "./routes/auth.route";

export const app: Express = express();
app.use(helmet());
app.use(express.json());
app.use(
	cors({
		origin: env.ORIGIN,
		credentials: true,
	}),
);
app.use("/api/auth", authRouter);
app.use(errorRequestHandler);

export default app;

export function sendError(res: Response, errors: string[], statusCode: number) {
	return res.status(statusCode).json({ errors });
}
