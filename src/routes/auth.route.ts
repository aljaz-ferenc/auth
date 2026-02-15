import express, { type Router } from "express";
import { loginHandler } from "../controllers/auth/login.controller";
import { registerHandler } from "../controllers/auth/register.controller";
import { resendVerificationHandler } from "../controllers/auth/resend-verification.controller";
import { verifyEmailHandler } from "../controllers/auth/verify-email.controller";

const authRouter: Router = express.Router();

authRouter.post("/register", registerHandler);
authRouter.get("/verify-email", verifyEmailHandler);
authRouter.post("/resend-verification", resendVerificationHandler);
authRouter.post("/login", loginHandler);

export { authRouter };
