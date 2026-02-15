import bcrypt from "bcrypt";
import crypto from "crypto";
import { addDays, addHours } from "date-fns";
import jwt from "jsonwebtoken";
import { EmailToken, User } from "../../prisma/generated/prisma";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { RegisterUserInput } from "../lib/types";
import { generateToken, hashPassword } from "../lib/utils";

export class AuthService {
	async register(data: RegisterUserInput) {
		const hash = await hashPassword(data.password);

		return prisma.user.create({
			data: {
				email: data.email,
				password: hash,
				username: data.username ?? null,
				name: data.name ?? null,
				emailTokens: {
					create: {
						token: generateToken(),
						type: "VERIFICATION",
						expiresAt: addHours(new Date(), 24),
					},
				},
			},
			include: {
				emailTokens: true,
			},
		});
	}

	async getEmailToken(emailToken: string) {
		return prisma.emailToken.findFirst({ where: { token: emailToken } });
	}

	isEmailTokenExpired(emailToken: EmailToken) {
		return new Date() > emailToken.expiresAt;
	}

	async deleteEmailToken(emailTokenId: EmailToken["id"]) {
		return prisma.emailToken.delete({ where: { id: emailTokenId } });
	}

	async getUserById(userId: User["id"]) {
		return prisma.user.findUnique({ where: { id: userId } });
	}

	async getUserByEmail(email: User["email"]) {
		return prisma.user.findUnique({ where: { email } });
	}

	async verifyUser(userId: User["id"], emailTokenId: EmailToken["id"]) {
		return prisma.user.update({
			where: { id: userId },
			data: {
				isVerified: true,
				emailTokens: {
					delete: { id: emailTokenId },
				},
			},
		});
	}

	generateAccessToken(userId: User["id"], email: User["email"]) {
		return jwt.sign({ userId: userId, email: email }, env.JWT_SECRET, {
			expiresIn: "15m",
		});
	}

	generateRefreshToken() {
		return crypto.randomBytes(40).toString("hex");
	}

	async createRefreshToken(userId: User["id"], refreshToken: string) {
		return prisma.refreshToken.create({
			data: {
				token: refreshToken,
				userId: userId,
				expiresAt: addDays(new Date(), 30),
			},
		});
	}

	async isPasswordValid(plainPassword: string, hash: string) {
		return bcrypt.compare(plainPassword, hash);
	}

	async updateLastLogin(userId: User["id"], date?: Date) {
		return prisma.user.update({
			where: { id: userId },
			data: { lastLogin: date || new Date() },
		});
	}

	async createEmailToken(
		userId: User["id"],
		token: EmailToken["token"],
		type: EmailToken["type"],
	) {
		return prisma.$transaction(async (tx) => {
			await tx.emailToken.deleteMany({
				where: { userId },
			});

			await tx.emailToken.create({
				data: {
					token,
					type,
					userId,
					expiresAt: addHours(new Date(), 24),
				},
			});
		});
	}
}
