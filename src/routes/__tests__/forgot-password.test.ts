import request from "supertest";
import app from "../../app";
import { prisma } from "../../lib/prisma";

const testEmail = "32raedfa2e@faw3rqeawrdsfszdf.com";

describe("Auth API - Forgot Password", () => {
	afterAll(async () => {
		await prisma.user.deleteMany({ where: { email: testEmail } });
		await prisma.$disconnect();
	});

	it("should return 400 when email is invalid", async () => {
		const response = await request(app)
			.post("/api/auth/forgot-password")
			.send({ email: "invalidEmail" });

		expect(response.status).toBe(400);
	});

	it("should return 200 if the user does not exist for security", async () => {
		const response = await request(app)
			.post("/api/auth/forgot-password")
			.send({ email: "validEmail@nonExistentUser.com" });

		expect(response.status).toBe(200);
	});

	it("should return 200 if email is valid and user exists", async () => {
		const user = await prisma.user.create({
			data: {
				email: testEmail,
				isVerified: true,
			},
		});
		const response = await request(app)
			.post("/api/auth/forgot-password")
			.send({ email: user.email });

		expect(response.status).toBe(200);
	});
});
