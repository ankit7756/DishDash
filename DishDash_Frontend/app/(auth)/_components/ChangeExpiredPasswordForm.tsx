"use client";
import { useForm } from "react-hook-form";
import { resetPasswordSchema, ResetPasswordData } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleCompletePasswordChange } from "../../../lib/actions/auth-action";
import { useState } from "react";
import { Lock, Loader2, Clock, Eye, EyeOff } from "lucide-react";
import PasswordStrength from "../_components/shared/PasswordStrength";

// SECURITY FEATURE: 90-day password expiry. Reached only via the
// passwordChangeRequired branch from login — a correct-but-expired password
// does not grant a session; the user must set a new one first.
export default function ChangeExpiredPasswordForm({ pendingToken }: { pendingToken: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValue, setPasswordValue] = useState("");

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (values: ResetPasswordData) => {
        setIsLoading(true);
        setError("");
        try {
            const result = await handleCompletePasswordChange(pendingToken, values.newPassword);
            if (result.success && result.data) {
                window.location.href = result.data.role === "admin" ? "/admin" : "/user/dashboard";
            } else {
                setError(result.message || "Failed to update password.");
                setIsLoading(false);
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-warning-light flex items-center justify-center mx-auto">
                    <Clock className="h-6 w-6 text-warning" />
                </div>
                <h1 className="text-xl font-bold text-secondary">Your password has expired</h1>
                <p className="text-sm text-text-muted">
                    It's been over 90 days since you last changed it. Please set a new password to continue.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && <p className="text-sm text-danger text-center">{error}</p>}

                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-secondary">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                            {...register("newPassword")}
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 12 characters"
                            className="input-field pl-10 pr-10"
                            onChange={(e) => { setPasswordValue(e.target.value); register("newPassword").onChange(e); }}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <PasswordStrength password={passwordValue} />
                    {errors.newPassword && <p className="text-xs text-danger mt-1">{errors.newPassword.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-secondary">Confirm New Password</label>
                    <input {...register("confirmNewPassword")} type="password" placeholder="Re-enter password" className="input-field" />
                    {errors.confirmNewPassword && <p className="text-xs text-danger mt-1">{errors.confirmNewPassword.message}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password & Continue"}
                </button>
            </form>
        </div>
    );
}