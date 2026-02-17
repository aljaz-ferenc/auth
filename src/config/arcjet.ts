import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/node";
import { env } from "../config/env";

export const aj = {
	// For login/register (strict rate limits)
	auth: arcjet({
		key: env.ARCJET_KEY,
		rules: [
			shield({ mode: "LIVE" }),
			tokenBucket({
				mode: "LIVE",
				refillRate: 3,
				interval: 60,
				capacity: 5,
			}),
		],
	}),

	// For public endpoints (more lenient)
	public: arcjet({
		key: env.ARCJET_KEY,
		rules: [
			shield({ mode: "LIVE" }),
			detectBot({
				mode: "LIVE",
				allow: [
					"CATEGORY:SEARCH_ENGINE",
					"CATEGORY:MONITOR",
					"CATEGORY:PREVIEW",
				],
			}),
			tokenBucket({
				mode: "LIVE",
				refillRate: 20,
				interval: 60,
				capacity: 30,
			}),
		],
	}),

	// For verification endpoints (medium)
	verify: arcjet({
		key: env.ARCJET_KEY,
		rules: [
			shield({ mode: "LIVE" }),
			detectBot({ mode: "LIVE", allow: [] }),
			tokenBucket({
				mode: "LIVE",
				refillRate: 5,
				interval: 60,
				capacity: 10,
			}),
		],
	}),
};
