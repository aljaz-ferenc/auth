import request from "supertest";
import z from "zod";
import { app } from "../app";
import { prisma } from "../lib/prisma";
import { RegisterUserInput } from "../lib/types";

const testEmail = "32raedfa2e@faw3rqeawrdsfszdf.com";

describe("Auth API - Registration", () => {
	afterEach(async () => {
		await prisma.user.deleteMany({ where: { email: testEmail } });
		await prisma.$disconnect();
	});

	it("should return 400 when email is missing", async () => {
		const invalidUserData = {
			password: "Test123!",
			username: "testUsername",
		};

		const response = await request(app)
			.post("/api/auth/register")
			.send(invalidUserData);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("errors");
	});

	it("should return 400 when password is missing", async () => {
		const invalidUserData = {
			username: "testUsername",
			email: "wrong@format",
		};

		const response = await request(app)
			.post("/api/auth/register")
			.send(invalidUserData);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("errors");
	});

	it("should return 400 when email is in the wrong format", async () => {
		const invalidUserData = {
			password: "Test123!",
			username: "testUsername",
			email: "wrong@format",
		};

		const response = await request(app)
			.post("/api/auth/register")
			.send(invalidUserData);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("errors");
	});

	it("should return 400 if password is weak", async () => {
		const invalidUserData = {
			password: "pswd",
			username: "testUsername",
			email: testEmail,
		};

		const response = await request(app)
			.post("/api/auth/register")
			.send(invalidUserData);

		expect(response.status).toBe(400);
		expect(response.body).toHaveProperty("errors");
	});

	it("should create a user", async () => {
		const validUserData = {
			email: testEmail,
			password: "aw3rdsfsdf4543",
		} satisfies RegisterUserInput;

		const response = await request(app)
			.post("/api/auth/register")
			.send(validUserData);

		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty("message");
		expect(response.body).toHaveProperty("user");
	});

	it("should return 409 if user with the same email already exists", async () => {
		const validUserData = {
			email: testEmail,
			password: "aw3rdsfsdf4543",
		} satisfies RegisterUserInput;

		await request(app).post("/api/auth/register").send(validUserData);

		const response = await request(app)
			.post("/api/auth/register")
			.send(validUserData);

		expect(response.status).toBe(409);
		expect(response.body).toHaveProperty("errors");
	});
});

describe("Auth API - Login", () => {
	afterEach(async () => {
		await prisma.user.deleteMany({ where: { email: testEmail } });
		await prisma.$disconnect();
	});

	it("should return 400 if password or email are missing", async () => {
		const response = await request(app)
			.post("/api/auth/login")
			.send({ email: testEmail });

		expect(response.status).toBe(400);
	});

	it("should return 403 if user is not verified", async () => {
		const validUserData = {
			email: testEmail,
			password: "aw3rdsfsdf4543",
		} satisfies RegisterUserInput;

		await request(app).post("/api/auth/register").send(validUserData);

		const response = await request(app)
			.post("/api/auth/login")
			.send(validUserData);

		expect(response.status).toBe(403);
	});

	it("should return 403 when password or email is invalid", async () => {
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
			.post("/api/auth/verify-email")
			.query({ token: user?.emailTokens[0]?.token });

		// login
		const response = await request(app)
			.post("/api/auth/login")
			.send({ password: "invalidPassword", email: validUserData.email });

		expect(response.status).toBe(403);
	});

	it("should log the user in and return 200 with a valid access token", async () => {
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

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("accessToken");
		expect(response.body).toHaveProperty("expiresIn");
		expect(response.body).toHaveProperty("user");

		const validJwt = z.jwt().safeParse(response.body.accessToken);
		expect(validJwt.success).toBe(true);
	});
});
