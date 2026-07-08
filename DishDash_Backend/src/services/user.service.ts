import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { RegisterInput, LoginInput } from "../types/user.type";
import { JWT_SECRET } from "../config";
import { sendEmail } from "../config/email";

const CLIENT_URL = process.env.CLIENT_URL as string;

export const registerUser = async (data: RegisterInput) => {
    const existingUser = await userRepo.getUserByEmail(data.email);
    if (existingUser) {
        throw new HttpError(400, "Email already exists");
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const newUser = await userRepo.createUser({
        fullName: data.fullName,
        username: data.username,
        phone: data.phone,
        email: data.email,
        password: hashedPassword,
        role: "user"
    });

    return {
        message: "User registered successfully",
        user: {
            _id: newUser._id,
            fullName: newUser.fullName,
            username: newUser.username,
            phone: newUser.phone,
            email: newUser.email,
            role: newUser.role
        }
    };
};

export const loginUser = async (data: LoginInput) => {
    const user = await userRepo.getUserByEmail(data.email);
    if (!user) {
        throw new HttpError(401, "Invalid email or password");
    }

    const isValid = await bcryptjs.compare(data.password, user.password);
    if (!isValid) {
        throw new HttpError(401, "Invalid email or password");
    }

    const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        message: "Login successful",
        token,
        user: {
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            phone: user.phone,
            email: user.email,
            role: user.role
        }
    };
};

export const sendResetPasswordEmail = async (email?: string) => {
    if (!email) {
        throw new HttpError(400, "Email is required");
    }

    const user = await userRepo.getUserByEmail(email);
    if (!user) {
        throw new HttpError(404, "User not found");
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF6B35;">Reset Your Password - Foodify</h2>
            <p>Hello ${user.fullName || user.username},</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background: #FF6B35; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
            <p>Or copy this link: <br><code>${resetLink}</code></p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">Foodify - Food Delivery System</p>
        </div>
    `;

    await sendEmail(user.email, "Password Reset - Foodify", html);
    return user;
};

export const resetPassword = async (token?: string, newPassword?: string) => {
    try {
        if (!token || !newPassword) {
            throw new HttpError(400, "Token and new password are required");
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const user = await userRepo.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10);
        await userRepo.updateUser(userId, { password: hashedPassword });

        return user;
    } catch (error) {
        throw new HttpError(400, "Invalid or expired token");
    }
};