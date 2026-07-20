"use client";
import { useForm } from "react-hook-form";
import { resetPasswordSchema, ResetPasswordData } from "../schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { handleResetPassword } from "../../../lib/actions/auth-action";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import PasswordStrength from "../_components/shared/PasswordStrength";

export default function ResetPasswordForm({ token }: { token: string }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValue, setPasswordValue] = useState("");
    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
    });
    const [error, setError] = useState<string | null>(null);

    const onSubmit = (values: ResetPasswordData) => {
        setError(null);
        startTransition(async () => {
            try {
                const result = await handleResetPassword(token, values.newPassword);
                if (result.success) {
                    toast.success("Password has been reset successfully!");
                    router.push('/login');
                } else {
                    throw new Error(result.message || 'Failed to reset password');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to reset password');
                toast.error(err.message || 'Failed to reset password');
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-1">
                <h1 className="text-xl font-bold text-secondary">Set a new password</h1>
                <p className="text-sm text-text-muted">Choose a strong password you haven't used before.</p>
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
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input {...register("confirmNewPassword")} type="password" placeholder="Re-enter password" className="input-field pl-10" />
                    </div>
                    {errors.confirmNewPassword && <p className="text-xs text-danger mt-1">{errors.confirmNewPassword.message}</p>}
                </div>

                <button type="submit" disabled={pending} className="btn-primary w-full flex items-center justify-center gap-2">
                    {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle className="h-4 w-4" /> Reset Password</>}
                </button>

                <p className="text-center text-sm text-text-muted">
                    <Link href="/login" className="font-semibold text-primary hover:underline">← Back to login</Link>
                </p>
            </form>
        </div>
    );
}