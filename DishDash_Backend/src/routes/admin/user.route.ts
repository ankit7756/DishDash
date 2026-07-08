import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { authMiddleware } from "../../middleware/auth.middleware";
import { adminMiddleware } from "../../middleware/admin.middleware";
import { uploadProfileImage } from "../../middleware/upload.middleware";

const router = Router();
const adminUserController = new AdminUserController();

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// POST /api/admin/users - Create user with image upload
router.post("/", uploadProfileImage, adminUserController.createUser);

// GET /api/admin/users - Get all users
router.get("/", adminUserController.getAllUsers);

// GET /api/admin/users/:id - Get single user
router.get("/:id", adminUserController.getUserById);

// PUT /api/admin/users/:id - Update user with image upload
router.put("/:id", uploadProfileImage, adminUserController.updateUser);

// DELETE /api/admin/users/:id - Delete user
router.delete("/:id", adminUserController.deleteUser);

export default router;