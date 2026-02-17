import request from "supertest";
import app from "../../app";
import { prisma } from "../../lib/prisma";
import { hashPassword } from "../../lib/utils";
import { AuthService } from "../../services/auth.service";

const validUserData = {
	email: `test-${Date.now()}@test.com`,
	password: "Test123!",
	isVerified: true,
};
const testUserId = crypto.randomUUID();
const authService = new AuthService();

describe("Auth API - Refresh", () => {
	beforeEach(async () => {
		await prisma.user.deleteMany({
			where: { email: validUserData.email },
		});
	});

	afterAll(async () => {
		await prisma.user.deleteMany({
			where: {
				email: validUserData.email,
			},
		});
		await prisma.refreshToken.deleteMany({
			where: { user: { email: validUserData.email } },
		});

		await prisma.$disconnect();
	});

	it("should return 401 when refresh token is not provided in cookies", async () => {
		const response = await request(app).post("/api/auth/refresh");

		expect(response.status).toBe(401);
		expect(response.body.errors).toContain("Missing refresh token");
	});

	it("should return 401 if refresh token is invalid", async () => {
		const response = await request(app)
			.post("/api/auth/refresh")
			.set("Cookie", "refreshToken=invalidToken123");

		expect(response.status).toBe(401);
		expect(response.body.errors).toContain("Refresh token invalid");
	});

	it("should return 200 and new access token with valid refresh token", async () => {
		const user = await prisma.user.create({
			data: {
				email: `test-${Date.now()}@test.com`,
				password: await hashPassword(validUserData.password),
				isVerified: true,
			},
		});

		const refreshToken = await authService.createRefreshToken(
			user.id,
			authService.generateRefreshToken(),
		);

		const response = await request(app)
			.post("/api/auth/refresh")
			.set("Cookie", `refreshToken=${refreshToken.token}`);

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("accessToken");
		expect(response.body.accessToken).toBeTruthy();
		expect(response.body).toHaveProperty("expiresIn", 900);
		expect(response.body).toHaveProperty("user");
		expect(response.body.user.id).toBe(user.id);
		expect(response.body.user.email).toBe(user.email);

		const oldToken = await prisma.refreshToken.findUnique({
			where: { token: refreshToken.token },
		});
		expect(oldToken).toBeNull();
	});

	it("should return 401 if refresh token is expired", async () => {
		const user = await prisma.user.create({
			data: {
				...validUserData,
				isVerified: true,
			},
		});
		const expiredToken = await prisma.refreshToken.create({
			data: {
				token: authService.generateRefreshToken(),
				userId: user.id,
				expiresAt: new Date(Date.now() - 1000),
			},
		});

		const response = await request(app)
			.post("/api/auth/refresh")
			.set("Cookie", `refreshToken=${expiredToken.token}`);

		expect(response.status).toBe(401);
	});
});
