import express, { type Router } from "express";
import { loginController } from "../controllers/auth/login.controller";
import { logoutController } from "../controllers/auth/logout.controller";
import { registerController } from "../controllers/auth/register.controller";
import { resendVerificationController } from "../controllers/auth/resend-verification.controller";
import { verifyEmailController } from "../controllers/auth/verify-email.controller";

const authRouter: Router = express.Router();

authRouter.post("/register", registerController);
authRouter.get("/verify-email", verifyEmailController);
authRouter.post("/resend-verification", resendVerificationController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);

export { authRouter };
