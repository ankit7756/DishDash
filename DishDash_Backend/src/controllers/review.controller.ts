import { Request, Response } from "express";
import { ReviewModel } from "../models/Review.model";
import { OrderModel } from "../models/Order.model";

// Submit a review for a delivered order
export const submitReview = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { orderId } = req.params;
        const { stars, message } = req.body;

        if (!stars || stars < 1 || stars > 5) {
            return res.status(400).json({ success: false, message: "Stars must be between 1 and 5" });
        }

        // Verify the order belongs to this user and is delivered
        const order = await OrderModel.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if (order.status !== "delivered") {
            return res.status(400).json({ success: false, message: "Can only review delivered orders" });
        }

        // Check if already reviewed
        const existing = await ReviewModel.findOne({ orderId });
        if (existing) {
            return res.status(400).json({ success: false, message: "You have already reviewed this order" });
        }

        const review = await ReviewModel.create({
            userId,
            orderId,
            restaurantId: order.restaurantId,
            restaurantName: order.restaurantName,
            foodItems: order.items.map((i: any) => i.name),
            stars,
            message: message || "",
        });

        res.status(201).json({ success: true, message: "Review submitted successfully", data: review });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all reviews by the logged-in user
export const getUserReviews = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const reviews = await ReviewModel.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get review for a specific order
export const getReviewByOrder = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const review = await ReviewModel.findOne({ orderId });
        res.status(200).json({ success: true, data: review || null });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all reviews for a restaurant (for admin/public use later)
export const getRestaurantReviews = async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.params;
        const reviews = await ReviewModel.find({ restaurantId })
            .sort({ createdAt: -1 })
            .populate("userId", "fullName username");
        res.status(200).json({ success: true, count: reviews.length, data: reviews });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};