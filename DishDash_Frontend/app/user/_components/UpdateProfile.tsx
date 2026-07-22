"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { handleUpdateProfile } from "@/lib/actions/auth-action";
import { UpdateUserData, updateUserSchema } from "../schema";
import { User, Mail, Phone, Loader2 } from "lucide-react";

export default function UpdateUserForm({ user }: { user: any }) {
    const { register, handleSubmit, control, formState: { errors, isSubmitting } } =
        useForm<UpdateUserData>({
            resolver: zodResolver(updateUserSchema),
            values: {
                fullName: user?.fullName || '',
                username: user?.username || '',
                phone: user?.phone || '',
                email: user?.email || ''
            }
        });

    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
        onChange(file);
    };

    const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
        setPreviewImage(null);
        onChange?.(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onSubmit = async (data: UpdateUserData) => {
        setError(null);
        try {
            const formData = new FormData();
            formData.append('fullName', data.fullName);
            formData.append('username', data.username);
            formData.append('phone', data.phone);
            formData.append('email', data.email);

            if (data.profileImage) {
                formData.append('profileImage', data.profileImage);
            }

            const response = await handleUpdateProfile(user._id || user.id, formData);

            if (!response.success) {
                throw new Error(response.message || 'Update profile failed');
            }

            handleDismissImage();
            toast.success('Profile updated successfully');
        } catch (error: Error | any) {
            toast.error(error.message || 'Profile update failed');
            setError(error.message || 'Profile update failed');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Update Profile</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Profile Image */}
                <div className="flex items-center gap-6">
                    {previewImage ? (
                        <div className="relative">
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            <Controller
                                name="profileImage"
                                control={control}
                                render={({ field: { onChange } }) => (
                                    <button
                                        type="button"
                                        onClick={() => handleDismissImage(onChange)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            />
                        </div>
                    ) : user?.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-12 h-12 text-gray-400" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2">Profile Image</label>
                        <Controller
                            name="profileImage"
                            control={control}
                            render={({ field: { onChange } }) => (
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                                    accept=".jpg,.jpeg,.png,.webp"
                                    className="text-sm"
                                />
                            )}
                        />
                        {errors.profileImage && (
                            <p className="text-xs text-red-600 mt-1">{errors.profileImage.message}</p>
                        )}
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                {...register("fullName")}
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                {...register("username")}
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                {...register("email")}
                                type="email"
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-2">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                {...register("phone")}
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-pink-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Updating...</span>
                        </>
                    ) : (
                        <span>Update Profile</span>
                    )}
                </button>
            </form>
        </div>
    );
}