import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/encryption";

// User Schema
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    username: { type: String, required: true },
    // SECURITY FEATURE: field-level encryption at rest (AES-256-CBC). The
    // set/get functions make this transparent — every write automatically
    // encrypts, every read (including res.json() output, since getters are
    // enabled below) automatically decrypts. No controller/service changes
    // needed elsewhere in the codebase.
    phone: {
        type: String,
        required: true,
        set: (value: string) => (value ? encrypt(value) : value),
        get: (value: string) => (value ? decrypt(value) : value),
    },
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
    mfaEnabled: { type: Boolean, default: false },
    // Password policy: reuse prevention (last 5) and 90-day expiry
    passwordHistory: { type: [String], default: [] },
    passwordChangedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
});

export const UserModel = mongoose.model("User", userSchema);