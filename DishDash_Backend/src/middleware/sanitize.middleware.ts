import { Request, Response, NextFunction } from "express";
import { sanitizeInput } from "../utils/sanitize";

// Applied globally to req.body only — safely mutable on Express 5 (unlike
// req.query, which became a read-only getter in Express 5 and cannot be
// reassigned by middleware; query-string-driven queries are guarded
// individually at their point of use instead, see toSafeString/escapeRegex
// in utils/sanitize.ts).
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === "object") {
        req.body = sanitizeInput(req.body);
    }
    next();
};