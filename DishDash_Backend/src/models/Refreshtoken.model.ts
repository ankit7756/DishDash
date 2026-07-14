import mongoose from "mongoose";

// SECURITY FEATURE: Session management — refresh token rotation.
// The raw token is NEVER stored, only its SHA-256 hash (same principle as
// password hashing — if the database is ever leaked, stored tokens alone
// aren't directly usable). userAgentHash enables optional session binding:
// a refresh attempt from a wildly different device/browser than the one
// that created the session is treated with suspicion.
const refreshTokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, unique: true },
    userAgentHash: { type: String, default: null },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
}, { timestamps: true });

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-cleanup expired tokens

export const RefreshTokenModel = mongoose.model("RefreshToken", refreshTokenSchema);