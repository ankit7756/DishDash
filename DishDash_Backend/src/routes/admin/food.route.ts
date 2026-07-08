import { Router } from "express";
import { AdminFoodController } from "../../controllers/admin/food.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { adminMiddleware } from "../../middleware/admin.middleware";
import { uploadFoodImage } from "../../middleware/upload.admin.middleware";

const router = Router();
const ctrl = new AdminFoodController();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/", ctrl.getAllFoods);
router.get("/:id", ctrl.getFoodById);
router.post("/", uploadFoodImage, ctrl.createFood);
router.put("/:id", uploadFoodImage, ctrl.updateFood);
router.delete("/:id", ctrl.deleteFood);

export default router;