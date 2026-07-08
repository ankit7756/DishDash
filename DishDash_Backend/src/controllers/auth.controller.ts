import { Request, Response } from "express";
import { RegisterSchema, LoginSchema } from "../types/user.type";
import * as userService from "../services/user.service";
import { UserModel } from "../models/User.model";
import { BASE_URL } from "../config";
import path from "path";
import fs from "fs";

export const register = async (req: Request, res: Response) => {
    const result = RegisterSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.format(),
        });
    }

    try {
        const data = await userService.registerUser(result.data);
        res.status(201).json({ success: true, ...data });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};

export const login = async (req: Request, res: Response) => {
    const result = LoginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: result.error.format(),
        });
    }

    try {
        const data = await userService.loginUser(result.data);
        res.json({ success: true, ...data });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const user = await UserModel.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let profileImageUrl = null;
        if (user.profileImage) {
            profileImageUrl = `${BASE_URL}/uploads/profiles/${user.profileImage}`;
        }

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                phone: user.phone,
                profileImage: profileImageUrl,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// export const updateProfile = async (req: Request, res: Response) => {
//     try {
//         const userId = req.params.id;
//         const loggedInUserId = (req as any).userId;

//         if (userId !== loggedInUserId) {
//             return res.status(403).json({
//                 success: false,
//                 message: "You can only update your own profile"
//             });
//         }

//         const { fullName, username, phone } = req.body;

//         const user = await UserModel.findById(userId);

//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             });
//         }

//         if (fullName) user.fullName = fullName;
//         if (username) user.username = username;
//         if (phone) user.phone = phone;

//         if (req.file) {
//             if (user.profileImage) {
//                 const oldImagePath = path.join(__dirname, "../../uploads/profiles", user.profileImage);
//                 if (fs.existsSync(oldImagePath)) {
//                     fs.unlinkSync(oldImagePath);
//                 }
//             }
//             user.profileImage = req.file.filename;
//         }

//         await user.save();

//         let profileImageUrl = null;
//         if (user.profileImage) {
//             profileImageUrl = `${BASE_URL}/uploads/profiles/${user.profileImage}`;
//         }

//         res.status(200).json({
//             success: true,
//             message: "Profile updated successfully",
//             data: {
//                 id: user._id,
//                 fullName: user.fullName,
//                 username: user.username,
//                 email: user.email,
//                 phone: user.phone,
//                 profileImage: profileImageUrl,
//                 role: user.role
//             }
//         });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

export const updateProfile = async (req: Request, res: Response) => {
    try {
        // ✅ FIX: Always use the userId from the JWT token
        // Mobile sends PUT /api/auth/profile (no ID in URL)
        // So we just trust the token — user can only update themselves
        const userId = (req as any).userId;

        const { fullName, username, phone } = req.body;

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (fullName) user.fullName = fullName;
        if (username) user.username = username;
        if (phone) user.phone = phone;

        if (req.file) {
            if (user.profileImage) {
                const oldImagePath = path.join(
                    __dirname,
                    "../../uploads/profiles",
                    user.profileImage
                );
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            user.profileImage = req.file.filename;
        }

        await user.save();

        let profileImageUrl = null;
        if (user.profileImage) {
            profileImageUrl = `${BASE_URL}/uploads/profiles/${user.profileImage}`;
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                phone: user.phone,
                profileImage: profileImageUrl,
                role: user.role
            }
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ✅ NEW: Request password reset
export const sendResetPasswordEmail = async (req: Request, res: Response) => {
    try {
        const email = req.body.email;
        await userService.sendResetPasswordEmail(email);
        return res.status(200).json({
            success: true,
            message: "If the email is registered, a reset link has been sent."
        });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// ✅ NEW: Reset password
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const token = req.params.token as string;
        const { newPassword } = req.body;
        await userService.resetPassword(token, newPassword);
        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully."
        });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// Simple direct password reset for mobile app (no email/token needed)
export const resetPasswordDirect = async (req: Request, res: Response) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email"
            });
        }

        const bcryptjs = await import('bcryptjs');
        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};