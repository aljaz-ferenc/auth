import bcrypt from "bcrypt";
import crypto from "crypto";

export function generateToken() {
	return crypto.randomBytes(32).toString("hex");
}

export async function hashPassword(password: string) {
	return await bcrypt.hash(password, 10);
}
