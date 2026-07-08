import { Router } from "express";
import { getAdminStats, adminGetAllOrders, adminUpdateOrderStatus, adminGetAllReviews } from "../../controllers/admin/misc.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { adminMiddleware } from "../../middleware/admin.middleware";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/stats", getAdminStats);
router.get("/orders", adminGetAllOrders);
router.put("/orders/:id/status", adminUpdateOrderStatus);
router.get("/reviews", adminGetAllReviews);

export default router;