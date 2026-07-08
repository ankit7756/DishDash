import { Request, Response } from "express";
import { OrderModel } from "../../models/Order.model";
import { ReviewModel } from "../../models/Review.model";
import { UserModel } from "../../models/User.model";
import { RestaurantModel } from "../../models/Restaurant.model";
import { FoodModel } from "../../models/Food.model";
import { BASE_URL } from "../../config";

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            totalUsers,
            totalRestaurants,
            totalFoods,
            totalOrders,
            ordersThisMonth,
            revenueResult,
            recentOrders,
        ] = await Promise.all([
            UserModel.countDocuments({ role: "user" }),
            RestaurantModel.countDocuments(),
            FoodModel.countDocuments(),
            OrderModel.countDocuments(),
            OrderModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
            OrderModel.aggregate([
                { $match: { status: "delivered", createdAt: { $gte: startOfMonth } } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]),
            OrderModel.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .populate("userId", "fullName email"),
        ]);

        const revenueThisMonth = revenueResult[0]?.total ?? 0;

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalRestaurants,
                totalFoods,
                totalOrders,
                ordersThisMonth,
                revenueThisMonth,
                recentOrders,
            },
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const adminGetAllOrders = async (req: Request, res: Response) => {
    try {
        const { page = "1", size = "15", status, search } = req.query as any;
        const pageNum = parseInt(page);
        const pageSize = parseInt(size);

        const query: any = {};
        if (status && status !== "all") query.status = status;
        if (search) {
            query.$or = [
                { restaurantName: { $regex: search, $options: "i" } },
            ];
        }

        const [orders, total] = await Promise.all([
            OrderModel.find(query)
                .populate("userId", "fullName email profileImage")
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * pageSize)
                .limit(pageSize),
            OrderModel.countDocuments(query),
        ]);

        // Format profile images on populated user
        const formatted = orders.map((o) => {
            const obj = o.toObject() as any;
            if (obj.userId?.profileImage) {
                obj.userId.profileImage = `${BASE_URL}/uploads/profiles/${obj.userId.profileImage}`;
            }
            return obj;
        });

        return res.status(200).json({
            success: true,
            data: formatted,
            pagination: {
                page: pageNum,
                size: pageSize,
                totalItems: total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const adminUpdateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const valid = ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"];
        if (!valid.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }
        const order = await OrderModel.findByIdAndUpdate(
            id,
            { status, ...(status === "delivered" ? { deliveryDate: new Date() } : {}) },
            { new: true }
        ).populate("userId", "fullName email");

        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        return res.status(200).json({ success: true, message: "Status updated", data: order });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ── Reviews ───────────────────────────────────────────────────────────────────
export const adminGetAllReviews = async (req: Request, res: Response) => {
    try {
        const { page = "1", size = "12" } = req.query as any;
        const pageNum = parseInt(page);
        const pageSize = parseInt(size);

        const [reviews, total] = await Promise.all([
            ReviewModel.find()
                .populate("userId", "fullName username profileImage")
                .sort({ createdAt: -1 })
                .skip((pageNum - 1) * pageSize)
                .limit(pageSize),
            ReviewModel.countDocuments(),
        ]);

        const formatted = reviews.map((r) => {
            const obj = r.toObject() as any;
            if (obj.userId?.profileImage) {
                obj.userId.profileImage = `${BASE_URL}/uploads/profiles/${obj.userId.profileImage}`;
            }
            return obj;
        });

        return res.status(200).json({
            success: true,
            data: formatted,
            pagination: { page: pageNum, size: pageSize, totalItems: total, totalPages: Math.ceil(total / pageSize) },
        });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};