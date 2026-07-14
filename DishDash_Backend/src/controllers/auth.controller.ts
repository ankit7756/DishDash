import { Request, Response } from "express";
import { RegisterSchema, LoginSchema } from "../types/user.type";
import * as userService from "../services/user.service";
import { UserModel } from "../models/User.model";
import { BASE_URL } from "../config";
import { logAudit } from "../services/audit.service";
import * as sessionService from "../services/session.service";
import path from "path";
import fs from "fs";

// SECURITY FEATURE (Session Management): refresh token delivered as an
// HttpOnly + SameSite=Strict cookie — never exposed to client-side JS, so an
// XSS payload can't steal it (unlike a token sitting in localStorage). `secure`
// is environment-conditional: true in production (HTTPS-only, as it must be),
// relaxed in local development since this project's Docker setup runs plain
// HTTP locally — a deliberate, documented tradeoff, not an oversight.
const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

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
        await logAudit({ req, userEmail: result.data.email, action: "REGISTER", outcome: "success" });
        res.status(201).json({ success: true, ...data });
    } catch (error: any) {
        await logAudit({ req, userEmail: result.data.email, action: "REGISTER", outcome: "failure" });
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
        const data: any = await userService.loginUser(result.data, req.headers["user-agent"]);
        const action = data.mfaRequired
            ? "LOGIN_MFA_PENDING"
            : data.passwordChangeRequired
                ? "LOGIN_PASSWORD_EXPIRED"
                : "LOGIN_SUCCESS";
        await logAudit({ req, userEmail: result.data.email, action, outcome: "success" });

        if (data.refreshToken) {
            setRefreshTokenCookie(res, data.refreshToken);
            delete data.refreshToken; // never expose the raw refresh token in the JSON body
        }
        res.json({ success: true, ...data });
    } catch (error: any) {
        const action = error.statusCode === 423 ? "LOGIN_LOCKED" : "LOGIN_FAILED";
        await logAudit({ req, userEmail: result.data.email, action, outcome: "failure" });
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
        const { email, captchaToken } = req.body;
        await userService.sendResetPasswordEmail(email, captchaToken);
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
        await logAudit({ req, userId, action: "MFA_ENABLED", outcome: "success" });
        return res.status(200).json({ success: true, ...data });
    } catch (error: any) {
        await logAudit({ req, userId: (req as any).userId, action: "MFA_ENABLED", outcome: "failure" });
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
        const data: any = await userService.verifyMfaLogin(mfaPendingToken, token, req.headers["user-agent"]);
        if (data.refreshToken) {
            setRefreshTokenCookie(res, data.refreshToken);
            delete data.refreshToken;
        }
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
        await logAudit({ req, userId, action: "MFA_DISABLED", outcome: "success" });
        return res.status(200).json({ success: true, ...data });
    } catch (error: any) {
        await logAudit({ req, userId: (req as any).userId, action: "MFA_DISABLED", outcome: "failure" });
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// ---------- Session Management ----------

// Uses the refreshToken cookie to mint a new short-lived access token,
// rotating the refresh token in the process (old one is invalidated).
export const refreshSession = async (req: Request, res: Response) => {
    try {
        const rawToken = req.cookies?.refreshToken;
        if (!rawToken) {
            return res.status(401).json({ success: false, message: "No refresh token provided" });
        }
        const { accessToken, refreshToken } = await sessionService.rotateRefreshToken(rawToken, req.headers["user-agent"]);
        setRefreshTokenCookie(res, refreshToken);
        return res.status(200).json({ success: true, token: accessToken });
    } catch (error: any) {
        res.clearCookie("refreshToken");
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// Revokes the current refresh token server-side and clears the cookie —
// a real logout, not just "the client forgets the token" (which alone
// wouldn't stop a stolen refresh token from still being usable).
export const logout = async (req: Request, res: Response) => {
    try {
        const rawToken = req.cookies?.refreshToken;
        if (rawToken) {
            await sessionService.revokeRefreshToken(rawToken);
        }
        res.clearCookie("refreshToken");
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

// ---------- Data Export (Privacy) ----------
export const exportData = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const data = await userService.exportUserData(userId);
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
        await logAudit({ req, userId, action: "PASSWORD_CHANGED", outcome: "success" });
        return res.status(200).json({ success: true, ...data });
    } catch (error: any) {
        await logAudit({ req, userId: (req as any).userId, action: "PASSWORD_CHANGED", outcome: "failure" });
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
        const data: any = await userService.completeExpiredPasswordChange(passwordChangePendingToken, newPassword, req.headers["user-agent"]);
        if (data.refreshToken) {
            setRefreshTokenCookie(res, data.refreshToken);
            delete data.refreshToken;
        }
        return res.status(200).json({ success: true, ...data });
    } catch (error: any) {
        return res.status(error.statusCode ?? 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};