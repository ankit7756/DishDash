"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerSchema, RegisterData } from "../schema";
import { handleRegister } from "../../../lib/actions/auth-action";
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle, Phone, AlertCircle } from "lucide-react";
import Recaptcha from "../_components/shared/Recaptcha";
import PasswordStrength from "../_components/shared/PasswordStrength";

export default function RegisterForm() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | undefined>();
    const [passwordValue, setPasswordValue] = useState("");

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterData) => {
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const result = await handleRegister({ ...data, captchaToken });

            if (result.success) {
                setSuccess("Account created successfully! Redirecting to login...");
                setTimeout(() => router.push("/login"), 1500);
            } else {
                setError(result.message || "Registration failed. Please try again.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {success && (
                <div className="p-3 rounded-xl bg-accent-light border border-accent/20 flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <p className="text-sm text-accent font-medium">{success}</p>
                </div>
            )}
            {error && (
                <div className="p-3 rounded-xl bg-danger-light border border-danger/20 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                    <p className="text-sm text-danger font-medium">{error}</p>
                </div>
            )}

            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-secondary">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input {...register("fullName")} placeholder="John Doe" className="input-field pl-10" />
                </div>
                {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-secondary">Username</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input {...register("username")} placeholder="johndoe" className="input-field pl-10" />
                </div>
                {errors.username && <p className="text-xs text-danger mt-1">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-secondary">Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input {...register("phone")} placeholder="98XXXXXXXX" className="input-field pl-10" />
                </div>
                {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-secondary">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input {...register("email")} type="email" placeholder="you@example.com" className="input-field pl-10" />
                </div>
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-secondary">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 12 characters"
                        className="input-field pl-10 pr-10"
                        onChange={(e) => { setPasswordValue(e.target.value); register("password").onChange(e); }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <PasswordStrength password={passwordValue} />
                {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-secondary">Confirm Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                        {...register("confirmPassword")}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        className="input-field pl-10 pr-10"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* SECURITY FEATURE: CAPTCHA always required on registration —
                classic bot-abuse target (mass fake account creation). */}
            <div className="flex justify-center pt-1">
                <Recaptcha onVerify={(token) => { setCaptchaToken(token); setValue("captchaToken", token); }} />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" /><span>Creating account...</span></> : <span>Create Account</span>}
            </button>

            <p className="text-center text-sm text-text-muted">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
            </p>
        </form>
    );
}