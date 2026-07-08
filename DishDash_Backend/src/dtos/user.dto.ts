import { z } from "zod";
import { RegisterSchema, LoginSchema, UpdateUserSchema } from "../types/user.type";

export const CreateUserDTO = RegisterSchema.pick({
    fullName: true,
    email: true,
    password: true,
}).extend({
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = LoginSchema;
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UpdateUserSchema;
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;