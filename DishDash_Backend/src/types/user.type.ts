import { z } from "zod";

// Register Schema
export const RegisterSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    email: z.email({ message: "Invalid email format" }),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// Login Schema
export const LoginSchema = z.object({
    email: z.email({ message: "Invalid email format" }),
    password: z.string().min(1, "Password is required"),
});

export const UpdateUserSchema = z.object({
    fullName: z.string().min(1).optional(),
    username: z.string().min(3).optional(),
    phone: z.string().min(10).optional(),
    email: z.email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(["user", "admin"]).optional(),
    profileImage: z.string().optional()
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;