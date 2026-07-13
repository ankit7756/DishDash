import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadProfileImage } from "../middleware/upload.middleware";
import { authLimiter, sensitiveActionLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

// Public routes — strict IP rate limiting against brute-force/credential-stuffing.
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);

// Password reset routes
// SECURITY FIX (CWE-640 / CWE-306): Removed the legacy "reset-password-direct" endpoint.
// It accepted only { email, newPassword } with no authentication and no proof of email
// ownership, allowing any unauthenticated attacker to take over any account. All password
// resets now go through the token-based flow below (signed JWT emailed to the account,
// 1-hour expiry, verified server-side before any password change is accepted).
router.post("/request-password-reset", sensitiveActionLimiter, authController.sendResetPasswordEmail);
router.post("/reset-password/:token", sensitiveActionLimiter, authController.resetPassword);

// Protected routes
router.get("/profile", authMiddleware, authController.getProfile);
// router.put("/:id", authMiddleware, uploadProfileImage, authController.updateProfile);
router.put("/profile", authMiddleware, uploadProfileImage, authController.updateProfile);

// MFA routes
router.post("/mfa/setup", authMiddleware, authController.setupMfa);
router.post("/mfa/confirm", authMiddleware, authController.confirmMfa);
router.post("/mfa/verify", sensitiveActionLimiter, authController.verifyMfa); // public: uses mfaPendingToken instead of session
router.post("/mfa/disable", authMiddleware, authController.disableMfa);

// Password policy routes
router.post("/change-password", authMiddleware, authController.changePassword);
router.post("/complete-password-change", sensitiveActionLimiter, authController.completeExpiredPasswordChange); // public: uses passwordChangePendingToken

export default router;