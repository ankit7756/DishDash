import express from "express";
import {
    sendPaymentOTP,
    verifyPaymentOTP,
} from "../controllers/payment.contoller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/khalti/send-otp", authMiddleware, sendPaymentOTP);
router.post("/khalti/verify-otp", authMiddleware, verifyPaymentOTP);

export default router;