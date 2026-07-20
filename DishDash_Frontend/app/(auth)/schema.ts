import { z } from "zod";

// Matches the backend's password policy exactly (min 12 + complexity) — the
// old schema here allowed a 6-character password, which would pass frontend
// validation but always be rejected by the backend. Fixed to prevent that
// confusing mismatch.
const passwordPolicy = z.string()
    .min(12, { message: "Password must be at least 12 characters" })
    .max(64, { message: "Password must be at most 64 characters" })
    .regex(/[a-z]/, { message: "Needs a lowercase letter" })
    .regex(/[A-Z]/, { message: "Needs an uppercase letter" })
    .regex(/[0-9]/, { message: "Needs a number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Needs a special character" });

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address!" }),
    password: z.string().min(1, { message: "Password is required" }),
    captchaToken: z.string().optional(),
});

export const registerSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
    email: z.string().email({ message: "Invalid email address!" }),
    password: passwordPolicy,
    confirmPassword: z.string(),
    captchaToken: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const forgetPasswordSchema = z.object({
    email: z.string().email({ message: "Enter a valid email" }),
    captchaToken: z.string().optional(),
});

export const resetPasswordSchema = z.object({
    newPassword: passwordPolicy,
    confirmNewPassword: z.string(),
}).refine((v) => v.newPassword === v.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
});

export const mfaVerifySchema = z.object({
    token: z.string().length(6, { message: "Enter the 6-digit code" }),
});

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: passwordPolicy,
    confirmNewPassword: z.string(),
}).refine((v) => v.newPassword === v.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "Passwords do not match",
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ForgetPasswordData = z.infer<typeof forgetPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type MfaVerifyData = z.infer<typeof mfaVerifySchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;