import express, { type Router } from "express";
import { forgotPasswordController } from "../controllers/auth/forgot-password.controller";
import { getUserController } from "../controllers/auth/get-user.controller";
import { loginController } from "../controllers/auth/login.controller";
import { logoutController } from "../controllers/auth/logout.controller";
import { refreshController } from "../controllers/auth/refresh.controller";
import { registerController } from "../controllers/auth/register.controller";
import { resendVerificationController } from "../controllers/auth/resend-verification.controller";
import { resetPasswordController } from "../controllers/auth/reset-password.controller";
import { verifyEmailController } from "../controllers/auth/verify-email.controller";
import { arcjet } from "../middleware/arcjet.middleware";
import { requireAuth } from "../middleware/require-auth.middleware";

const authRouter: Router = express.Router();

authRouter.post("/register", arcjet("auth"), registerController);
authRouter.get("/verify-email", arcjet("public"), verifyEmailController);
authRouter.post(
	"/resend-verification",
	arcjet("verify"),
	resendVerificationController,
);
authRouter.post("/login", arcjet("auth"), loginController);
authRouter.post("/logout", arcjet("public"), logoutController);
authRouter.post("/me", arcjet("public"), requireAuth, getUserController);
authRouter.post("/forgot-password", arcjet("auth"), forgotPasswordController);
authRouter.get("/reset-password", arcjet("auth"), resetPasswordController);
authRouter.get("/refresh", refreshController);

export { authRouter };
