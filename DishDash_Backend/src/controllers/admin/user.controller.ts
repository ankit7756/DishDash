import { Request, Response, NextFunction } from "express";
import { AdminUserService } from "../../services/admin/user.service";
import { BASE_URL } from "../../config";
import { QueryParams } from "../../types/query.type";

const adminUserService = new AdminUserService();

export class AdminUserController {
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userData = req.body;

            if (req.file) {
                userData.profileImage = req.file.filename;
            }

            const newUser = await adminUserService.createUser(userData);

            let profileImageUrl = null;
            if (newUser.profileImage) {
                profileImageUrl = `${BASE_URL}/uploads/profiles/${newUser.profileImage}`;
            }

            return res.status(201).json({
                success: true,
                message: "User Created",
                data: {
                    ...newUser.toObject(),
                    profileImage: profileImageUrl
                }
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const { page, size, search }: QueryParams = req.query;
            const { users, pagination } = await adminUserService.getAllUsers(
                page, size, search
            );

            // Format users with full image URLs
            const formattedUsers = users.map((user: any) => {
                let profileImageUrl = null;
                if (user.profileImage) {
                    profileImageUrl = `${BASE_URL}/uploads/profiles/${user.profileImage}`;
                }
                return {
                    ...user.toObject(),
                    profileImage: profileImageUrl
                };
            });

            return res.status(200).json({
                success: true,
                data: formattedUsers,
                pagination: pagination,
                message: "All Users Retrieved"
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id as string;
            const user = await adminUserService.getUserById(userId);

            let profileImageUrl = null;
            if ((user as any).profileImage) {
                profileImageUrl = `${BASE_URL}/uploads/profiles/${(user as any).profileImage}`;
            }

            return res.status(200).json({
                success: true,
                data: {
                    ...(user as any).toObject(),
                    profileImage: profileImageUrl
                },
                message: "Single User Retrieved"
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id as string;
            const updateData = req.body;

            if (req.file) {
                updateData.profileImage = req.file.filename;
            }

            const updatedUser = await adminUserService.updateUser(userId, updateData);

            let profileImageUrl = null;
            if ((updatedUser as any).profileImage) {
                profileImageUrl = `${BASE_URL}/uploads/profiles/${(updatedUser as any).profileImage}`;
            }

            return res.status(200).json({
                success: true,
                message: "User Updated",
                data: {
                    ...(updatedUser as any).toObject(),
                    profileImage: profileImageUrl
                }
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id as string;
            const deleted = await adminUserService.deleteUser(userId);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "User Deleted"
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal Server Error"
            });
        }
    }
}