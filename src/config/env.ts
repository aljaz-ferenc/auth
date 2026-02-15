import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const envSchema = z.object({
	DATABASE_URL: z.string().min(1),
	DIRECT_URL: z.string().min(1),
	EMAILJS_PUBLIC_KEY: z.string().min(1),
	EMAILJS_SERVICE_ID: z.string().min(1),
	EMAILJS_TEMPLATE_ID: z.string().min(1),
	EMAILJS_PRIVATE_KEY: z.string().min(1),
	BASE_URL: z.string().min(1),
	ORIGIN: z.string().min(1),
	JWT_SECRET: z.string().min(1),
	PORT: z.coerce.number().optional(),
});

export function validateEnv() {
	dotenv.config();

	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		console.error("Invalid environment variables:");
		process.exit(1);
	}

	console.log("ENVs verified");
	return result.data;
}

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;
