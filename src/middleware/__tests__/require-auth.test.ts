/**
 * FOR TESTING MIDDLEWARE ONLY!
 */

import request from "supertest";
import app from "../../app";
import { AuthService } from "../../services/auth.service";

const authService = new AuthService();

describe("requireAuth middleware", () => {
	it("should pass with valid token", async () => {
		const token = authService.generateAccessToken("username", "test@email.com");

		const response = await request(app)
			.get("/test")
			.auth(token, { type: "bearer" });

		expect(response.status).toBe(200);
		expect(response.body.user).toBeDefined();
	});

	it("should fail with invalid token", async () => {
		const response = await request(app)
			.get("/test")
			.auth("invalidToken", { type: "bearer" });

		expect(response.status).toBe(401);
	});

	it("should fail without authentication header", async () => {
		const response = await request(app).get("/test");

		expect(response.status).toBe(401);
	});
});
