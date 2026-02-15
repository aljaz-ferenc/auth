import app from "./app";
import { env, validateEnv } from "./config/env";

validateEnv();

import { registerProcessHandlers } from "./error-handlers";

registerProcessHandlers();

const PORT = env.PORT ?? 4000;

async function startServer() {
	try {
		// DB connection here
		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error);
		process.exit(1);
	}
}

startServer();
