import { Request, Response } from "express";
import { OrderModel } from "../models/Order.model";
import { FoodModel } from "../models/Food.model";
import { RestaurantModel } from "../models/Restaurant.model";

// SECURITY FIX (CWE-807: Reliance on Untrusted Inputs in a Security Decision):
// The client previously sent subtotal, deliveryFee, totalAmount, and even each item's
// price/name directly, and the server stored them without verification — allowing a
// user to submit e.g. totalAmount: 1 for a real order. All pricing is now looked up
// server-side from the Food and Restaurant collections; the client only supplies
// restaurantId and a list of { foodId, quantity }. Any client-supplied price fields
// are ignored entirely.
export const createOrder = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const {
            restaurantId, items, deliveryAddress, phone, paymentMethod,
        } = req.body;

        if (!restaurantId || !Array.isArray(items) || items.length === 0 ||
            !deliveryAddress || !phone) {
            return res.status(400).json({
                success: false,
                message: "restaurantId, items, deliveryAddress and phone are required"
            });
        }

        const restaurant = await RestaurantModel.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurant not found" });
        }
        if (!restaurant.isOpen) {
            return res.status(400).json({ success: false, message: "Restaurant is currently closed" });
        }

        // Rebuild each order line from the trusted Food record — client price/name/image ignored.
        const verifiedItems = [];
        let subtotal = 0;

        for (const clientItem of items) {
            const quantity = Number(clientItem.quantity);
            if (!clientItem.foodId || !Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Each item requires a valid foodId and a positive integer quantity"
                });
            }

            const food = await FoodModel.findById(clientItem.foodId);
            if (!food) {
                return res.status(404).json({ success: false, message: `Food item ${clientItem.foodId} not found` });
            }
            if (String(food.restaurantId) !== String(restaurantId)) {
                return res.status(400).json({ success: false, message: "Item does not belong to the selected restaurant" });
            }
            if (!food.isAvailable) {
                return res.status(400).json({ success: false, message: `${food.name} is currently unavailable` });
            }

            verifiedItems.push({
                foodId: food._id,
                name: food.name,
                price: food.price,
                quantity,
                image: food.image,
            });
            subtotal += food.price * quantity;
        }

        const deliveryFee = restaurant.deliveryFee;
        const totalAmount = subtotal + deliveryFee;

        const order = await OrderModel.create({
            userId,
            restaurantId,
            restaurantName: restaurant.name,
            items: verifiedItems,
            subtotal,
            deliveryFee,
            totalAmount,
            deliveryAddress,
            phone,
            paymentMethod: paymentMethod || "Cash on Delivery",
            status: "pending",
        });

        res.status(201).json({ success: true, message: "Order placed successfully", data: order });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserOrders = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const orders = await OrderModel.find({ userId })
            .sort({ orderDate: -1 })
            .populate("restaurantId", "name image rating");
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const order = await OrderModel.findOne({ _id: id, userId })
            .populate("restaurantId", "_id name image rating phone address")
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.status(200).json({ success: true, data: order });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: update any status
export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }
        const order = await OrderModel.findByIdAndUpdate(
            id,
            { status, ...(status === "delivered" ? { deliveryDate: new Date() } : {}) },
            { new: true }
        );
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.status(200).json({ success: true, message: "Order status updated", data: order });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// User: confirm they received the order → delivered
export const confirmDelivery = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        const order = await OrderModel.findOne({ _id: id, userId });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        if (order.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Cannot confirm a cancelled order" });
        }
        if (order.status === "delivered") {
            return res.status(400).json({ success: false, message: "Order already marked as delivered" });
        }

        const updated = await OrderModel.findByIdAndUpdate(
            id,
            { status: "delivered", deliveryDate: new Date() },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Order confirmed as delivered", data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// User: cancel their own order
export const cancelOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;

        const order = await OrderModel.findOne({ _id: id, userId });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        if (order.status === "delivered") {
            return res.status(400).json({ success: false, message: "Cannot cancel a delivered order" });
        }
        if (order.status === "cancelled") {
            return res.status(400).json({ success: false, message: "Order is already cancelled" });
        }

        const updated = await OrderModel.findByIdAndUpdate(
            id,
            { status: "cancelled" },
            { new: true }
        );

        res.status(200).json({ success: true, message: "Order cancelled successfully", data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCurrentOrders = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const orders = await OrderModel.find({
            userId, status: { $in: ["pending", "preparing", "out_for_delivery"] }
        }).sort({ orderDate: -1 }).populate("restaurantId", "name image rating");
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getOrderHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const orders = await OrderModel.find({
            userId, status: { $in: ["delivered", "cancelled"] }
        }).sort({ orderDate: -1 }).populate("restaurantId", "name image rating");
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};