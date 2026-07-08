// import express from "express";
// import {
//     createOrder,
//     getUserOrders,
//     getOrderById,
//     updateOrderStatus,
//     getCurrentOrders,
//     getOrderHistory,
// } from "../controllers/order.controller";
// import { authMiddleware } from "../middleware/auth.middleware";

// const router = express.Router();

// router.post("/", authMiddleware, createOrder);
// router.get("/", authMiddleware, getUserOrders);
// router.get("/current", authMiddleware, getCurrentOrders);
// router.get("/history", authMiddleware, getOrderHistory);
// router.get("/:id", authMiddleware, getOrderById);
// router.put("/:id/status", authMiddleware, updateOrderStatus);

// export default router;

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

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getUserOrders);
router.get("/current", authMiddleware, getCurrentOrders);
router.get("/history", authMiddleware, getOrderHistory);
router.get("/:id", authMiddleware, getOrderById);

// Admin
router.put("/:id/status", authMiddleware, updateOrderStatus);

// User actions
router.put("/:id/confirm", authMiddleware, confirmDelivery);
router.put("/:id/cancel", authMiddleware, cancelOrder);

export default router;