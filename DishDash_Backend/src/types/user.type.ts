import { z } from "zod";

// SECURITY FEATURE: Password policy — minimum 12 characters plus complexity
// (upper, lower, number, special character). Strength is additionally scored
// with zxcvbn server-side in user.service.ts (regex complexity alone doesn't
// catch weak-but-technically-complex passwords like "Password1!").
const passwordPolicy = z.string()
    .min(12, "Password must be at least 12 characters")
    .max(64, "Password must be at most 64 characters")
    .regex(/[a-z]/, "Password needs a lowercase letter")
    .regex(/[A-Z]/, "Password needs an uppercase letter")
    .regex(/[0-9]/, "Password needs a number")
    .regex(/[^a-zA-Z0-9]/, "Password needs a special character");

// Register Schema
export const RegisterSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    email: z.email({ message: "Invalid email format" }),
    password: passwordPolicy,
    captchaToken: z.string().optional(),
});

// Login Schema
export const LoginSchema = z.object({
    email: z.email({ message: "Invalid email format" }),
    password: z.string().min(1, "Password is required"),
    captchaToken: z.string().optional(),
});

export const UpdateUserSchema = z.object({
    fullName: z.string().min(1).optional(),
    username: z.string().min(3).optional(),
    phone: z.string().min(10).optional(),
    email: z.email().optional(),
    password: passwordPolicy.optional(),
    role: z.enum(["user", "admin"]).optional(),
    profileImage: z.string().optional()
});

export const ChangePasswordSchema = z.object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordPolicy,
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;