import { ErrorRequestHandler } from "express";
import z, { ZodError } from "zod";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "../prisma/generated/prisma/runtime/client";
import { sendError } from "./app";

export function registerProcessHandlers() {
	const gracefulShutdown = async (signal?: string) => {
		console.log(
			`Received ${signal ?? "unknown"} signal. Shutting down gracefully...`,
		);
		process.exit(signal === "SIGINT" || signal === "SIGTERM" ? 0 : 1);
	};

	process.on("unhandledRejection", (reason, promise) => {
		console.error("Unhandled Promise Rejection:", reason, promise);
		process.exit(1);
	});

	process.on("uncaughtException", (err) => {
		console.error("Uncaught Exception:", err);
		process.exit(1);
	});

	["SIGINT", "SIGTERM", "SIGHUP"].forEach((sig) => {
		process.on(sig, () => gracefulShutdown(sig));
	});
}


export const errorRequestHandler: ErrorRequestHandler = (err, req, res, next) => {
	if (err instanceof PrismaClientKnownRequestError) {
		const dbError = err.meta?.driverAdapterError?.cause;

		if (dbError?.kind === "UniqueConstraintViolation") {
			const fields = dbError.constraint?.fields || [];

			if (fields.includes("email")) {
				return sendError(res, ["This email is already registered"], 409);
			}
			if (fields.includes("username")) {
				return sendError(res, ["This username is already registered"], 409);
			}
		}
	}

	if (err instanceof PrismaClientValidationError) {
		console.log(err);
		return sendError(res, ["Validation Error"], 409);
	}

	if (err instanceof ZodError) {
		const errorStrings = Object.values(z.flattenError(err).fieldErrors)
			.map((err) => err)
			.flat();
		return sendError(res, errorStrings as string[], 409);
	}


	if (err instanceof Error) {
		return sendError(res, ["Server error"], 500)
	}
}