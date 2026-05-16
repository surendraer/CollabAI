import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import validate from "../middleware/validate";
import authenticate from "../middleware/authenticate";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshToken);
router.get("/verify-email/:token", authController.verifyEmail);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  authController.resetPassword
);

// Protected routes
router.get("/me", authenticate, authController.getMe);

export default router;
