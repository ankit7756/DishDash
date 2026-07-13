import { Request, Response, NextFunction } from "express";
import { logAudit } from "../services/audit.service";

// SECURITY FEATURE: generic activity logger for entire route groups (e.g. all
// /api/admin/* routes) where we want broad coverage without adding an explicit
// logAudit() call to every single controller. Logs after the response is sent
// (res.on("finish")) so the real outcome (status code) is known. Skips GET
// requests by default — read-only actions are lower audit value and would add
// a lot of log volume for little benefit; write actions (POST/PUT/PATCH/DELETE)
// are what matter most for "who changed what."
export const adminActivityLogger = (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "GET") return next();

    res.on("finish", () => {
        logAudit({
            req,
            userId: (req as any).userId,
            action: `ADMIN_${req.method}_${req.baseUrl.split("/").pop()?.toUpperCase() || "ACTION"}`,
            targetResource: req.originalUrl,
            outcome: res.statusCode < 400 ? "success" : "failure",
        });
    });

    next();
};