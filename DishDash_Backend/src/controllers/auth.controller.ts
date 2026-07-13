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

// ---------- MFA (TOTP) ----------

// Step 1: authenticated user requests MFA setup, gets back a QR code to scan.
export const setupMfa = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const data = await userService.generateMfaSetup(userId);
        return res.status(200).json({ success: true, ...data });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// Step 2: authenticated user submits a code from their authenticator app to confirm
// setup and actually enable MFA on the account.
export const confirmMfa = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ success: false, message: "Verification code is required" });
        }
        const data = await userService.confirmMfaSetup(userId, token);
        return res.status(200).json({ success: true, ...data });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// Second step of login for MFA-enabled accounts. Public route (user isn't fully
// authenticated yet), but requires the short-lived mfaPendingToken issued at login.
export const verifyMfa = async (req: Request, res: Response) => {
    try {
        const { mfaPendingToken, token } = req.body;
        if (!mfaPendingToken || !token) {
            return res.status(400).json({
                success: false,
                message: "mfaPendingToken and token are required"
            });
        }
        const data = await userService.verifyMfaLogin(mfaPendingToken, token);
        return res.status(200).json({ success: true, ...data });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// Disabling MFA requires the current password as re-authentication.
export const disableMfa = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }
        const data = await userService.disableMfa(userId, password);
        return res.status(200).json({ success: true, ...data });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// ---------- Password Policy ----------

// Voluntary password change for an already-authenticated user.
export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "oldPassword and newPassword are required"
            });
        }
        const data = await userService.changePassword(userId, oldPassword, newPassword);
        return res.status(200).json({ success: true, ...data });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// Forced password change after 90-day expiry, using the pendingToken from login.
export const completeExpiredPasswordChange = async (req: Request, res: Response) => {
    try {
        const { passwordChangePendingToken, newPassword } = req.body;
        if (!passwordChangePendingToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "passwordChangePendingToken and newPassword are required"
            });
        }
        const data = await userService.completeExpiredPasswordChange(passwordChangePendingToken, newPassword);
        return res.status(200).json({ success: true, ...data });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};