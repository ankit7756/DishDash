import express from "express";
import {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    confirmDelivery,
    cancelOrder,
    getCurrentOrders,
    getOrderHistory,
} from "../controllers/order.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getUserOrders);
router.get("/current", authMiddleware, getCurrentOrders);
router.get("/history", authMiddleware, getOrderHistory);
router.get("/:id", authMiddleware, getOrderById);

// Admin only — status updates affect any user's order, not just the requester's own.
// SECURITY FIX (CWE-862: Missing Authorization): This route previously only required
// authMiddleware, meaning any authenticated user (not just admins, and not just the
// order owner) could change the status of ANY order in the system. adminMiddleware
// now enforces that only admin-role accounts can call this endpoint.
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

// User actions
router.put("/:id/confirm", authMiddleware, confirmDelivery);
router.put("/:id/cancel", authMiddleware, cancelOrder);

export default router;