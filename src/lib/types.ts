import { z } from "zod";

export const registerUserSchema = z.object({
	email: z.email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
	username: z.string().optional(),
	name: z.string().optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
