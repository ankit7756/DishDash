import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
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

// SECURITY FIX (CWE-307): Account lockout, complementing IP-based rate limiting.
// Rate limiting alone can be bypassed by an attacker rotating IPs; locking the
// account itself after repeated failures closes that gap regardless of source IP.
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const loginUser = async (data: LoginInput) => {
    const user = await userRepo.getUserByEmail(data.email);
    if (!user) {
        // Same generic message as a wrong password — avoids confirming which
        // emails are registered (username enumeration).
        throw new HttpError(401, "Invalid email or password");
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
        const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        throw new HttpError(423, `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`);
    }

    const isValid = await bcryptjs.compare(data.password, user.password);
    if (!isValid) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

        if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
            user.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
            user.failedLoginAttempts = 0;
            await user.save();
            throw new HttpError(423, "Account locked due to too many failed attempts. Try again in 15 minute(s).");
        }

        await user.save();
        throw new HttpError(401, "Invalid email or password");
    }

    // Successful login — clear any prior failure tracking.
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
        await user.save();
    }

    // SECURITY FEATURE (MFA / Zero-Trust): if the account has MFA enabled, a correct
    // password alone is not enough to authenticate. Instead of the real session JWT,
    // issue a short-lived "pending" token that only grants access to the MFA-verify
    // endpoint — nothing else. The real session token is issued only after the TOTP
    // code is also verified.
    if (user.mfaEnabled) {
        const mfaPendingToken = jwt.sign(
            { userId: user._id, mfaPending: true },
            JWT_SECRET,
            { expiresIn: "5m" }
        );
        return {
            message: "MFA verification required",
            mfaRequired: true,
            mfaPendingToken,
        };
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
            email: user.email,
            role: user.role
        }
    };
};

// ---------- MFA (TOTP) ----------

// Step 1 of setup: generate a new secret and return a QR code for the user to scan
// with an authenticator app. mfaEnabled stays false until confirmSetup succeeds —
// this prevents a half-finished setup from silently locking a user out later.
export const generateMfaSetup = async (userId: string) => {
    const user = await userRepo.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    const secret = speakeasy.generateSecret({
        name: `DishDash (${user.email})`,
        length: 20,
    });

    if (!secret.otpauth_url) {
        throw new HttpError(500, "Failed to generate MFA setup URL");
    }

    user.mfaSecret = secret.base32;
    user.mfaEnabled = false; // not enabled until confirmed
    await user.save();

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    return { qrCodeDataUrl, secret: secret.base32 };
};

// Step 2 of setup: user submits a code from their authenticator app to prove the
// setup actually worked before we turn MFA on for real.
export const confirmMfaSetup = async (userId: string, token: string) => {
    const user = await userRepo.getUserById(userId);
    if (!user || !user.mfaSecret) {
        throw new HttpError(400, "MFA setup has not been started for this account");
    }

    const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token,
        window: 1, // allow ±30s clock drift
    });

    if (!verified) {
        throw new HttpError(400, "Invalid verification code");
    }

    user.mfaEnabled = true;
    await user.save();

    return { message: "MFA enabled successfully" };
};

// Step 2 of login: verify the TOTP code against the mfaPendingToken issued at login,
// and only then issue the real session JWT.
export const verifyMfaLogin = async (mfaPendingToken: string, token: string) => {
    let decoded: any;
    try {
        decoded = jwt.verify(mfaPendingToken, JWT_SECRET);
    } catch {
        throw new HttpError(401, "Invalid or expired MFA session. Please log in again.");
    }

    if (!decoded.mfaPending) {
        throw new HttpError(401, "Invalid MFA session token");
    }

    const user = await userRepo.getUserById(decoded.userId);
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
        throw new HttpError(400, "MFA is not enabled on this account");
    }

    const verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: "base32",
        token,
        window: 1,
    });

    if (!verified) {
        throw new HttpError(401, "Invalid MFA code");
    }

    const sessionToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        message: "Login successful",
        token: sessionToken,
        user: {
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            role: user.role
        }
    };
};

// Disabling MFA requires the current password — prevents a hijacked session
// (e.g. stolen JWT) from being used to silently strip MFA off the account.
export const disableMfa = async (userId: string, password: string) => {
    const user = await userRepo.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) throw new HttpError(401, "Incorrect password");

    user.mfaEnabled = false;
    user.mfaSecret = null;
    await user.save();

    return { message: "MFA disabled" };
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