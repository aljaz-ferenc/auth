import express, { type Router } from "express";
import { getUserController } from "../controllers/auth/get-user.controller";
import { loginController } from "../controllers/auth/login.controller";
import { logoutController } from "../controllers/auth/logout.controller";
import { registerController } from "../controllers/auth/register.controller";
import { resendVerificationController } from "../controllers/auth/resend-verification.controller";
import { verifyEmailController } from "../controllers/auth/verify-email.controller";
import { requireAuth } from "../middleware/requireAuth.middleware";

const authRouter: Router = express.Router();

authRouter.post("/register", registerController);
authRouter.get("/verify-email", verifyEmailController);
authRouter.post("/resend-verification", resendVerificationController);
authRouter.post("/login", loginController);
authRouter.post("/logout", logoutController);
authRouter.post("/me", requireAuth, getUserController);

export { authRouter };
