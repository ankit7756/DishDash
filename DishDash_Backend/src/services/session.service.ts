import crypto from "crypto";
import jwt from "jsonwebtoken";
import { RefreshTokenModel } from "../models/Refreshtoken.model";
import * as userRepo from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const ACCESS_TOKEN_TTL = "15m"; // shortened from the previous 7d — see rationale below

// Refresh tokens are high-entropy random values, not user-chosen passwords, so
// a fast hash (SHA-256) is appropriate here — unlike password hashing, which
// deliberately needs to be slow (bcrypt) to resist brute-force guessing.
// There's nothing to "guess" about a 64-byte random token; the hash exists
// purely so a leaked database doesn't hand over directly-usable tokens.
const hashToken = (raw: string): string => crypto.createHash("sha256").update(raw).digest("hex");

const hashUserAgent = (ua?: string): string | null =>
    ua ? crypto.createHash("sha256").update(ua).digest("hex") : null;

interface UserForToken {
    _id: any;
    email: string;
    role: string;
}

export const issueAccessToken = (user: UserForToken): string =>
    jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });

// SECURITY FEATURE (Session Management): issues a new opaque refresh token,
// storing only its hash. Called at login and on every successful rotation.
export const issueRefreshToken = async (userId: string, userAgent?: string): Promise<string> => {
    const rawToken = crypto.randomBytes(64).toString("hex");
    await RefreshTokenModel.create({
        userId,
        tokenHash: hashToken(rawToken),
        userAgentHash: hashUserAgent(userAgent),
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        revoked: false,
    });
    return rawToken;
};

// SECURITY FEATURE (Session Management): refresh token rotation with reuse
// detection. Each refresh token is single-use — using it issues a new one and
// marks the old one "revoked" (not deleted, so reuse can be detected). If a
// REVOKED token is ever presented again, that's a strong signal the token was
// stolen and already used by an attacker (or vice versa) — the correct
// response is to revoke ALL of that user's sessions, not just reject the one
// request, since we can no longer trust any token issued in that chain.
export const rotateRefreshToken = async (rawToken: string, userAgent?: string) => {
    const tokenHash = hashToken(rawToken);
    const stored = await RefreshTokenModel.findOne({ tokenHash });

    if (!stored) {
        throw new HttpError(401, "Invalid session. Please log in again.");
    }

    if (stored.revoked) {
        // Reuse of an already-rotated token — treat as compromise.
        await RefreshTokenModel.updateMany({ userId: stored.userId }, { revoked: true });
        throw new HttpError(401, "Session invalidated due to suspected token reuse. Please log in again.");
    }

    if (stored.expiresAt.getTime() < Date.now()) {
        throw new HttpError(401, "Session expired. Please log in again.");
    }

    const currentUaHash = hashUserAgent(userAgent);
    if (stored.userAgentHash && currentUaHash && stored.userAgentHash !== currentUaHash) {
        // SECURITY FEATURE: session binding to device/user-agent (brief 3.4.4,
        // "optional session binding to user agents or devices"). A refresh
        // attempt from a different device than the one that logged in is
        // rejected rather than silently honored.
        throw new HttpError(401, "Session does not match the original device. Please log in again.");
    }

    const user = await userRepo.getUserById(String(stored.userId));
    if (!user) {
        throw new HttpError(401, "Invalid session state. Please log in again.");
    }

    stored.revoked = true;
    await stored.save();

    const newRefreshToken = await issueRefreshToken(String(stored.userId), userAgent);
    const newAccessToken = issueAccessToken(user);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const revokeRefreshToken = async (rawToken: string) => {
    const tokenHash = hashToken(rawToken);
    await RefreshTokenModel.updateOne({ tokenHash }, { revoked: true });
};

export const revokeAllUserSessions = async (userId: string) => {
    await RefreshTokenModel.updateMany({ userId }, { revoked: true });
};