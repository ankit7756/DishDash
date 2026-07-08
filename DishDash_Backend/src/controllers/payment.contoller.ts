import { Request, Response } from "express";
import { sendEmail } from "../config/email";

// Store OTPs temporarily in memory (good enough for college project)
const otpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

// Generate 6 digit OTP
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to email
export const sendPaymentOTP = async (req: Request, res: Response) => {
    try {
        const { phone, amount, restaurantName } = req.body;
        const userId = (req as any).userId;

        if (!phone || !amount) {
            return res.status(400).json({
                success: false,
                message: "Phone and amount are required"
            });
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Store OTP with userId as key
        otpStore.set(userId, { otp, expiresAt });

        // Send email
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                <div style="background: #5C2D91; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Khalti</h1>
                    <p style="color: #e0c9f5; margin: 4px 0 0 0; font-size: 14px;">Digital Wallet</p>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #eee;">
                    <h2 style="color: #333; margin-top: 0;">Payment Verification</h2>
                    <p style="color: #555;">You are making a payment of:</p>
                    <div style="background: #f9f4ff; border: 1px solid #d4b8f0; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center;">
                        <p style="margin: 0; color: #5C2D91; font-size: 28px; font-weight: bold;">Rs. ${amount}</p>
                        <p style="margin: 4px 0 0 0; color: #888; font-size: 14px;">To ${restaurantName} via Foodify</p>
                    </div>
                    <p style="color: #555;">Your OTP code is:</p>
                    <div style="background: #5C2D91; border-radius: 8px; padding: 20px; text-align: center; margin: 16px 0;">
                        <h1 style="color: white; margin: 0; letter-spacing: 12px; font-size: 36px;">${otp}</h1>
                    </div>
                    <p style="color: #888; font-size: 13px;">⏱️ This OTP expires in <strong>5 minutes</strong>.</p>
                    <p style="color: #888; font-size: 13px;">🔒 Never share this OTP with anyone.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
                    <p style="color: #bbb; font-size: 12px; text-align: center;">Foodify Payment System • Powered by Khalti</p>
                </div>
            </div>
        `;

        await sendEmail(
            process.env.EMAIL_USER || "",
            `Rs. ${amount} Payment OTP - Khalti`,
            html
        );

        res.status(200).json({
            success: true,
            message: "OTP sent to your registered email"
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to send OTP"
        });
    }
};

// Verify OTP
export const verifyPaymentOTP = async (req: Request, res: Response) => {
    try {
        const { otp } = req.body;
        const userId = (req as any).userId;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required"
            });
        }

        const stored = otpStore.get(userId);

        if (!stored) {
            return res.status(400).json({
                success: false,
                message: "No OTP found. Please request a new one."
            });
        }

        if (Date.now() > stored.expiresAt) {
            otpStore.delete(userId);
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        if (stored.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP. Please try again."
            });
        }

        // OTP correct — clear it
        otpStore.delete(userId);

        res.status(200).json({
            success: true,
            message: "Payment verified successfully"
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || "Verification failed"
        });
    }
};