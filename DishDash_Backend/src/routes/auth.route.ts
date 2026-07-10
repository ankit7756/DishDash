import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadProfileImage } from "../middleware/upload.middleware";

const router = Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Password reset routes
// SECURITY FIX (CWE-640 / CWE-306): Removed the legacy "reset-password-direct" endpoint.
// It accepted only { email, newPassword } with no authentication and no proof of email
// ownership, allowing any unauthenticated attacker to take over any account. All password
// resets now go through the token-based flow below (signed JWT emailed to the account,
// 1-hour expiry, verified server-side before any password change is accepted).
router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.post("/reset-password/:token", authController.resetPassword);

// Protected routes
router.get("/profile", authMiddleware, authController.getProfile);
// router.put("/:id", authMiddleware, uploadProfileImage, authController.updateProfile);
router.put("/profile", authMiddleware, uploadProfileImage, authController.updateProfile);

export default router;