import { Request, Response, NextFunction } from "express";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const userRole = (req as any).userRole;

        if (!userRole) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        if (userRole !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        next();
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Authorization check failed"
        });
    }
};