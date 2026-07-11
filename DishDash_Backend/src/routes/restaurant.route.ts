import express from "express";
import {
    sendPaymentOTP,
    verifyPaymentOTP,
} from "../controllers/payment.contoller";
import { authMiddleware } from "../middleware/auth.middleware";
import { sensitiveActionLimiter } from "../middleware/rateLimiter.middleware";

const router = express.Router();

router.post("/khalti/send-otp", authMiddleware, sensitiveActionLimiter, sendPaymentOTP);
router.post("/khalti/verify-otp", authMiddleware, sensitiveActionLimiter, verifyPaymentOTP);

export default router;