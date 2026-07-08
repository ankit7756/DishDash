import express from "express";
import {
    submitReview,
    getUserReviews,
    getReviewByOrder,
    getRestaurantReviews,
} from "../controllers/review.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/order/:orderId", authMiddleware, submitReview);
router.get("/my", authMiddleware, getUserReviews);
router.get("/order/:orderId", authMiddleware, getReviewByOrder);
router.get("/restaurant/:restaurantId", getRestaurantReviews);

export default router;