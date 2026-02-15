import request from "supertest";
import app from "../../app";
import { prisma } from "../../lib/prisma";
import { RegisterUserInput } from "../../lib/types";

const testEmail = "32raedfa2e@faw3rqeawrdsfszdf.com";

describe("Auth API - Resend Verification", () => {
	afterEach(async () => {
		await prisma.user.deleteMany({ where: { email: testEmail } });
		await prisma.$disconnect();
	});

	it("should return 400 when email is invalid", async () => {
		const response = await request(app)
			.post("/api/auth/resend-verification")
			.send({ email: "invalid@email" });

		expect(response.status).toBe(400);
	});

	it("should return 200 if the user is not found to prevent email enumeration", async () => {
		const response = await request(app)
			.post("/api/auth/resend-verification")
			.send({ email: testEmail });

		expect(response.status).toBe(200);
	});

	it("should return 400 when user is already verified", async () => {
		const validUserData = {
			email: testEmail,
			password: "aw3rdsfsdf4543",
		} satisfies RegisterUserInput;

		// register
		await request(app).post("/api/auth/register").send(validUserData);

		const user = await prisma.user.findUnique({
			where: { email: validUserData.email },
			include: { emailTokens: true },
		});

		// verify
		await request(app)
			.get("/api/auth/verify-email")
			.query({ token: user?.emailTokens[0]?.token });

		const response = await request(app)
			.post("/api/auth/resend-verification")
			.send({ email: validUserData.email });

		expect(response.status).toBe(400);
	});
});
