import { Request } from "express";
import { AuditLogModel } from "../models/AuditLog.model";

interface LogAuditParams {
    req?: Request;
    userId?: string | null;
    userEmail?: string | null;
    action: string;
    targetResource?: string | null;
    outcome: "success" | "failure";
}

// Truncate IP to avoid storing a fully identifying value long-term while still
// being useful for pattern detection (e.g. repeated failures from one subnet).
const truncateIp = (ip?: string | null): string | null => {
    if (!ip) return null;
    const clean = ip.replace("::ffff:", ""); // normalize IPv4-mapped IPv6
    const parts = clean.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    return clean.split(":").slice(0, 4).join(":") + ":xxxx"; // rough IPv6 truncation
};

// Fire-and-forget: logging failures must never break the actual request.
export const logAudit = async ({ req, userId, userEmail, action, targetResource, outcome }: LogAuditParams) => {
    try {
        await AuditLogModel.create({
            userId: userId || null,
            userEmail: userEmail || null,
            action,
            targetResource: targetResource || null,
            outcome,
            ipAddress: truncateIp(req?.ip),
            method: req?.method || null,
            path: req?.originalUrl || null,
        });
    } catch (err) {
        // Logging must be best-effort — never let it throw into the caller.
        console.error("Audit log write failed:", err);
    }
};