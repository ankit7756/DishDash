import rateLimit from "express-rate-limit";

// SECURITY FEATURE (OWASP: Brute Force / Excessive Requests):
// IP-based rate limiting, applied as the first layer of defense against
// brute-force and credential-stuffing attacks. Complements the per-account
// lockout in user.service.ts — this limiter protects against a single IP
// hammering many different accounts; account lockout protects against an
// attacker who rotates IPs but targets one account.

// Strict limiter for login/register — most sensitive, most targeted by bots.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many attempts from this IP. Please try again in 15 minutes.",
    },
});

// Slightly looser limiter for other sensitive-but-less-targeted endpoints
// (password reset requests, OTP requests, etc.) — prevents abuse without
// being as aggressive as the login limiter.
export const sensitiveActionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP. Please try again in 15 minutes.",
    },
});

// General-purpose limiter for the whole API — generous ceiling, mainly to
// blunt scripted abuse/scraping rather than target any specific flow.
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP. Please slow down.",
    },
});