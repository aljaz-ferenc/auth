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
