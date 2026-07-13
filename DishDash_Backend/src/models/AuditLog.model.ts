import mongoose from "mongoose";

// AuditLog Schema
// SECURITY FEATURE: Activity logging & monitoring (OWASP: Security Logging and
// Monitoring Failures). Deliberately excludes request bodies, passwords, tokens,
// or other sensitive payloads — only records WHO did WHAT, WHEN, and whether it
// succeeded, which is enough for auditing/incident response without becoming a
// second copy of sensitive data sitting in the logs collection itself.
const auditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    userEmail: { type: String, default: null }, // captured even for failed logins where no userId exists yet
    action: { type: String, required: true }, // e.g. "LOGIN_SUCCESS", "LOGIN_FAILED", "ORDER_STATUS_CHANGED"
    targetResource: { type: String, default: null }, // e.g. an order id, "auth", "mfa"
    outcome: { type: String, enum: ["success", "failure"], required: true },
    ipAddress: { type: String, default: null }, // truncated, see audit.service.ts
    method: { type: String, default: null },
    path: { type: String, default: null },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

export const AuditLogModel = mongoose.model("AuditLog", auditLogSchema);