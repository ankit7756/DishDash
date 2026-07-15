import { Request, Response } from "express";
import { OrderModel } from "../models/Order.model";
import { UserModel } from "../models/User.model";
import { initiateKhaltiPayment, lookupKhaltiPayment } from "../services/khalti.service";
import { logAudit } from "../services/audit.service";

// SECURITY / TRANSACTION FEATURE: replaces the previous email-OTP "payment"
// mockup with a real trusted third-party gateway (Khalti). Step 1: open a
// Khalti payment session for an order the requesting user actually owns.
export const initiateKhaltiPaymentController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ success: false, message: "orderId is required" });
        }

        // SECURITY: ownership check — a user can only pay for their own order,
        // not any order ID they happen to guess (anti-IDOR, same pattern used
        // throughout the rest of this app).
        const order = await OrderModel.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.paymentMethod !== "Khalti") {
            return res.status(400).json({ success: false, message: "This order is not set up for Khalti payment" });
        }

        if (order.paymentStatus === "completed") {
            return res.status(400).json({ success: false, message: "This order has already been paid" });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { pidx, paymentUrl } = await initiateKhaltiPayment({
            amountInRupees: order.totalAmount,
            orderId: String(order._id),
            customerName: user.fullName,
            customerEmail: user.email,
            customerPhone: order.phone, // already decrypted transparently via the Order model getter
        });

        order.khaltiPidx = pidx;
        order.paymentStatus = "pending";
        await order.save();

        await logAudit({
            req, userId, action: "PAYMENT_INITIATED", targetResource: String(order._id), outcome: "success",
        });

        return res.status(200).json({ success: true, pidx, paymentUrl });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Failed to initiate payment"
        });
    }
};

// Step 2: confirm the REAL payment status via a server-to-server lookup —
// never trust a client-reported "success" (e.g. a forged return_url query
// param). This is the actual source of truth for whether money moved.
export const verifyKhaltiPaymentController = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ success: false, message: "orderId is required" });
        }

        const order = await OrderModel.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (!order.khaltiPidx) {
            return res.status(400).json({ success: false, message: "No payment has been initiated for this order" });
        }

        const { status, transactionId } = await lookupKhaltiPayment(order.khaltiPidx);

        switch (status) {
            case "Completed":
                order.paymentStatus = "completed";
                if (order.status === "pending") order.status = "preparing"; // unlock fulfillment now payment is confirmed
                break;
            case "Refunded":
            case "Partially Refunded":
                order.paymentStatus = "refunded";
                break;
            case "Expired":
            case "User canceled":
                order.paymentStatus = "failed";
                break;
            case "Pending":
            default:
                order.paymentStatus = "pending";
                break;
        }
        await order.save();

        await logAudit({
            req, userId, action: "PAYMENT_VERIFIED", targetResource: String(order._id),
            outcome: order.paymentStatus === "completed" ? "success" : "failure",
        });

        return res.status(200).json({
            success: true,
            paymentStatus: order.paymentStatus,
            khaltiStatus: status,
            transactionId,
            order,
        });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Failed to verify payment"
        });
    }
};