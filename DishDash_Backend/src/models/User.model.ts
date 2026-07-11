import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: null },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    // Account lockout tracking (brute-force protection)
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    // Multi-Factor Authentication (TOTP)
    mfaSecret: { type: String, default: null },
    mfaEnabled: { type: Boolean, default: false }
}, { timestamps: true });

export const UserModel = mongoose.model("User", userSchema);