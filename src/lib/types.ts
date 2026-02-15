import { z } from "zod";

const passwordSchema = z
	.string({ error: "Password is required" })
	.min(6, { message: "Password must be at least 6 characters" })
	.max(72);

export const registerUserSchema = z.object({
	email: z.email({
		error: (issue) =>
			issue.input === undefined ? "Email is required" : "Invalid email address",
	}),
	password: passwordSchema,
	username: z.string().optional(),
	name: z.string().optional(),
});

export const loginUserSchema = z.object({
	password: passwordSchema,
	email: z.email(),
});

export const verifyEmailBodySchema = z.object({
	token: z.string().min(1, { error: "Missing email token" }),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
