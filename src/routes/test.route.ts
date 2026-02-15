// ONLY FOR TESTING MIDDLEWARE

import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.middleware";

const testRouter: Router = Router();

testRouter.get("/", requireAuth, (req, res) => {
	res.json({
		success: true,
		user: req.user,
	});
});

export { testRouter };
