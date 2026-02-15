import request from "supertest";
import app from "../../app";
import { prisma } from "../../lib/prisma";
import { RegisterUserInput } from "../../lib/types";

const testEmail = "32raedfa2e@faw3rqeawrdsfszdf.com";

describe("Auth API - Me", () => {
	afterEach(async () => {
		await prisma.user.deleteMany({ where: { email: testEmail } });
		await prisma.$disconnect();
	});

	it("should return the user when they are logged in", async () => {
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

		// login
		const response = await request(app)
			.post("/api/auth/login")
			.send(validUserData);

		const foundUser = await request(app)
			.post("/api/auth/me")
			.auth(response.body.accessToken, { type: "bearer" });

		expect(foundUser.body).toHaveProperty("id");
		expect(foundUser.body).toHaveProperty("email");
		expect(foundUser.body.id).toBeTruthy();
		expect(foundUser.body.email).toBeTruthy();
	});
});
