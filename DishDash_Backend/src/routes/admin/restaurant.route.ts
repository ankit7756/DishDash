import { Router } from "express";
import { AdminRestaurantController } from "../../controllers/admin/restaurant.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { adminMiddleware } from "../../middleware/admin.middleware";
import { uploadRestaurantImage } from "../../middleware/upload.admin.middleware";

const router = Router();
const ctrl = new AdminRestaurantController();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", ctrl.getAllRestaurants);
router.get("/:id", ctrl.getRestaurantById);
router.post("/", uploadRestaurantImage, ctrl.createRestaurant);
router.put("/:id", uploadRestaurantImage, ctrl.updateRestaurant);
router.delete("/:id", ctrl.deleteRestaurant);

export default router;