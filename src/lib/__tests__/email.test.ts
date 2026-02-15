import request from "supertest";
import app from "../../app";
import { sendVerificationEmail } from "../email";
import { prisma } from "../prisma";
import { RegisterUserInput } from "../types";

jest.mock("../email", () => ({
	sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

const testEmail = "32raedfa2e@faw3rqeawrdsfszdf.com";

const validUserData = {
	email: testEmail,
	password: "aw3rdsfsdf4543",
} satisfies RegisterUserInput;

describe("Email Verification", () => {
	beforeEach(() => jest.clearAllMocks());

	afterEach(async () => {
		await prisma.user.deleteMany({ where: { email: testEmail } });
		await prisma.$disconnect();
	});

	it("should call sendVerificationEmail after successfull registration", async () => {
		const response = await request(app)
			.post("/api/auth/register")
			.send(validUserData);

		expect(response.status).toBe(201);
		expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
		expect(sendVerificationEmail).toHaveBeenCalledWith(
			testEmail,
			expect.stringMatching(/^[a-f0-9]+$/), // hex string
		);
	});

	it("should not call sendVerificationEmail when registration fails", async () => {
		await request(app)
			.post("/api/auth/registration")
			.send({ password: "2faewfasd" }); // missing email

		expect(sendVerificationEmail).not.toHaveBeenCalled();
	});

	let verificationToken: string | undefined;

	it("should create a user and verify email", async () => {
		const response = await request(app)
			.post("/api/auth/register")
			.send({ email: testEmail, password: "asdfq2fd" });

		expect(response.status).toBe(201);

		const user = await prisma.user.findUnique({
			where: { email: testEmail },
			include: { emailTokens: true },
		});

		verificationToken = user?.emailTokens[0]?.token;
		expect(verificationToken).toBeDefined();

		const emailResponse = await request(app)
			.get("/api/auth/verify-email")
			.query({ token: verificationToken });

		expect(emailResponse.status).toBe(200);

		const verifiedUser = await prisma.user.findUnique({
			where: { email: testEmail },
		});
		expect(verifiedUser?.isVerified).toBe(true);
	});
});

describe("Resend Verification", () => {
	beforeEach(() => jest.clearAllMocks());

	afterEach(async () => {
		await prisma.user.deleteMany({ where: { email: testEmail } });
		await prisma.$disconnect();
	});

	it("should return 400 if email is invalid", async () => {
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

	it("should return 400 if user is already verified", async () => {
		await request(app).post("/api/auth/register").send(validUserData);

		const user = await prisma.user.findUnique({
			where: { email: testEmail },
			include: { emailTokens: true },
		});

		await request(app)
			.get("/api/auth/verify-email")
			.query({ token: user?.emailTokens[0]?.token });

		const verifiedUser = await prisma.user.findUnique({
			where: { email: testEmail },
		});

		expect(verifiedUser).toBeDefined();
		expect(verifiedUser?.isVerified).toBe(true);

		const response = await request(app)
			.post("/api/auth/resend-verification")
			.send({ email: verifiedUser?.email });

		expect(response.status).toBe(400);
	});
});
