import express from "express";
import {
    initiateKhaltiPaymentController,
    verifyKhaltiPaymentController,
} from "../controllers/payment.contoller";
import { authMiddleware } from "../middleware/auth.middleware";
import { sensitiveActionLimiter } from "../middleware/rateLimiter.middleware";

const router = express.Router();

router.post("/khalti/initiate", authMiddleware, sensitiveActionLimiter, initiateKhaltiPaymentController);
router.post("/khalti/verify", authMiddleware, sensitiveActionLimiter, verifyKhaltiPaymentController);

export default router;