import { z } from "zod";

const passwordSchema = z
	.string({ error: "Password must be a string" })
	.min(1, { error: "Password is required" })
	.min(6, { message: "Password must be at least 6 characters" })
	.max(72);

const emailSchema = z.email({
	error: (issue) =>
		issue.input === undefined ? "Email is required" : "Invalid email address",
});

export const registerUserSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
	username: z.string().optional(),
	name: z.string().optional(),
});

export const loginUserSchema = z.object({
	password: passwordSchema,
	email: z.email({ error: "Invalid email address" }),
});

export const verifyEmailBodySchema = z.object({
	token: z
		.string({ error: "Token invalid" })
		.min(1, { error: "Missing token" }),
});

export const jwtPayloadSchema = z.object({
	userId: z.string().min(1),
	email: z.email(),
	iat: z.number(),
	exp: z.number(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
