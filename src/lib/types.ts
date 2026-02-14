import { z } from "zod";

export const registerUserSchema = z.object({
	email: z.email({
		error: (issue) =>
			issue.input === undefined ? "Email is required" : "Invalid email address",
	}),
	password: z
		.string({ error: "Password is required" })
		.min(6, { message: "Password must be at least 6 characters" })
		.max(72),
	username: z.string().optional(),
	name: z.string().optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
