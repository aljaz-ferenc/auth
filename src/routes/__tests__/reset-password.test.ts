import request from "supertest";
import app from "../../app";
import { prisma } from "../../lib/prisma";

const testEmail = "32raedfa2e@faw3rqeawrdsfszdf.com";

describe("Auth API - Reset Password", () => {
	afterAll(async () => {
		await prisma.user.deleteMany({ where: { email: testEmail } });
		await prisma.$disconnect();
	});

	it("should return 404 if token is not found", async () => {
		const response = await request(app)
			.post("/api/auth/reset-password")
			.send({ password: "testPass", token: "nonExistingToken" });

		expect(response.status).toBe(404);
	});
});
