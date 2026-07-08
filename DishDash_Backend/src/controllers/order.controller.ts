// import { Request, Response } from "express";
// import { OrderModel } from "../models/Order.model";

// export const createOrder = async (req: Request, res: Response) => {
//     try {
//         const userId = (req as any).userId;

//         const {
//             restaurantId,
//             restaurantName,
//             items,
//             subtotal,
//             deliveryFee,
//             totalAmount,
//             deliveryAddress,
//             phone,
//             paymentMethod,
//         } = req.body;

//         // Validate required fields
//         if (!restaurantId || !restaurantName || !items || items.length === 0 ||
//             !subtotal || !deliveryFee || !totalAmount || !deliveryAddress || !phone) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required"
//             });
//         }

//         // Create order
//         const order = await OrderModel.create({
//             userId,
//             restaurantId,
//             restaurantName,
//             items,
//             subtotal,
//             deliveryFee,
//             totalAmount,
//             deliveryAddress,
//             phone,
//             paymentMethod: paymentMethod || "Cash on Delivery",
//             status: "pending",
//         });

//         res.status(201).json({
//             success: true,
//             message: "Order placed successfully",
//             data: order,
//         });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// // Get user's orders
// export const getUserOrders = async (req: Request, res: Response) => {
//     try {
//         const userId = (req as any).userId;

//         const orders = await OrderModel.find({ userId })
//             .sort({ orderDate: -1 })
//             .populate("restaurantId", "name image rating");

//         res.status(200).json({
//             success: true,
//             count: orders.length,
//             data: orders,
//         });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// // Get single order
// export const getOrderById = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;
//         const userId = (req as any).userId;

//         const order = await OrderModel.findOne({ _id: id, userId })
//             .populate("restaurantId", "name image rating phone address");

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: order,
//         });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// // Update order status (for testing - later for admin)
// export const updateOrderStatus = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;
//         const { status } = req.body;

//         const validStatuses = ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"];

//         if (!validStatuses.includes(status)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid status"
//             });
//         }

//         const order = await OrderModel.findByIdAndUpdate(
//             id,
//             {
//                 status,
//                 ...(status === "delivered" ? { deliveryDate: new Date() } : {})
//             },
//             { new: true }
//         );

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found"
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Order status updated",
//             data: order,
//         });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// // Get current orders (pending, preparing, out_for_delivery)
// export const getCurrentOrders = async (req: Request, res: Response) => {
//     try {
//         const userId = (req as any).userId;

//         const orders = await OrderModel.find({
//             userId,
//             status: { $in: ["pending", "preparing", "out_for_delivery"] }
//         })
//             .sort({ orderDate: -1 })
//             .populate("restaurantId", "name image rating");

//         res.status(200).json({
//             success: true,
//             count: orders.length,
//             data: orders,
//         });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

// // Get order history (delivered, cancelled)
// export const getOrderHistory = async (req: Request, res: Response) => {
//     try {
//         const userId = (req as any).userId;

//         const orders = await OrderModel.find({
//             userId,
//             status: { $in: ["delivered", "cancelled"] }
//         })
//             .sort({ orderDate: -1 })
//             .populate("restaurantId", "name image rating");

//         res.status(200).json({
//             success: true,
//             count: orders.length,
//             data: orders,
//         });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

import { Request, Response } from "express";
import { OrderModel } from "../models/Order.model";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const {
            restaurantId, restaurantName, items, subtotal,
            deliveryFee, totalAmount, deliveryAddress, phone, paymentMethod,
        } = req.body;

        if (!restaurantId || !restaurantName || !items || items.length === 0 ||
            !subtotal || !deliveryFee || !totalAmount || !deliveryAddress || !phone) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const order = await OrderModel.create({
            userId, restaurantId, restaurantName, items, subtotal,
            deliveryFee, totalAmount, deliveryAddress, phone,
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