import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadProfileImage } from "../middleware/upload.middleware";

const router = Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Password reset routes
router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.post("/reset-password/:token", authController.resetPassword);
router.post("/reset-password-direct", authController.resetPasswordDirect);

// Protected routes
router.get("/profile", authMiddleware, authController.getProfile);
// router.put("/:id", authMiddleware, uploadProfileImage, authController.updateProfile);
router.put("/profile", authMiddleware, uploadProfileImage, authController.updateProfile);

export default router;