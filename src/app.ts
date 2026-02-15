import cors from "cors";
import express, { type Express, Response } from "express";
import helmet from "helmet";
import { errorRequestHandler } from "./error-handlers";
import { authRouter } from "./routes/auth.route";

const ORIGIN = process.env.ORIGIN as string;

if (!ORIGIN) {
	throw new Error("Missing ORIGIN in .env");
}

export const app: Express = express();
app.use(helmet());
app.use(express.json());
app.use(
	cors({
		origin: process.env.ORIGIN,
		credentials: true,
	}),
);
app.use("/api/auth", authRouter);
app.use(errorRequestHandler);

export default app;

export function sendError(res: Response, errors: string[], statusCode: number) {
	return res.status(statusCode).json({ errors });
}
