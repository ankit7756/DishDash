import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const UserSchema = z.object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    phone: z.string().min(10, { message: "Phone must be at least 10 digits" }),
    email: z.string().email({ message: "Enter a valid email" }),
    password: z.string().min(6, { message: "Minimum 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Minimum 6 characters" }),
    profileImage: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
            message: "Max file size is 5MB",
        })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Only .jpg, .jpeg, .png and .webp formats are supported",
        }),
}).refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

export type UserData = z.infer<typeof UserSchema>;

export const UserEditSchema = z.object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }).optional(),
    username: z.string().min(3, { message: "Username must be at least 3 characters" }).optional(),
    phone: z.string().min(10, { message: "Phone must be at least 10 digits" }).optional(),
    email: z.string().email({ message: "Enter a valid email" }).optional(),
    password: z.string().min(6, { message: "Minimum 6 characters" }).optional(),
    confirmPassword: z.string().optional(),
    profileImage: z
        .instanceof(File)
        .optional()
        .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
            message: "Max file size is 5MB",
        })
        .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: "Only .jpg, .jpeg, .png and .webp formats are supported",
        }),
}).refine(
    (data) => {
        if (data.password && data.password.length > 0) {
            return data.password === data.confirmPassword;
        }
        return true;
    },
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);

export type UserEditData = z.infer<typeof UserEditSchema>;