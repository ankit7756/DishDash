"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginSchema, LoginData, mfaVerifySchema, MfaVerifyData } from "../schema";
import { handleLogin, handleVerifyMfa } from "../../../lib/actions/auth-action";
import { Eye, EyeOff, Mail, Lock, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import Recaptcha from "../_components/shared/Recaptcha";

export default function LoginForm() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [captchaToken, setCaptchaToken] = useState<string | undefined>();

    // Two-step login state: password step, then (only if the account has MFA
    // enabled) a TOTP code step. The backend never issues a full session
    // token until both steps succeed.
    const [mfaPendingToken, setMfaPendingToken] = useState<string | null>(null);
    const [mfaCode, setMfaCode] = useState("");
    const [mfaError, setMfaError] = useState("");
    const [mfaLoading, setMfaLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
    });

    const redirectByRole = (role: string) => {
        window.location.href = role === "admin" ? "/admin" : "/user/dashboard";
    };

    const onSubmit = async (data: LoginData) => {
        setIsLoading(true);
        setError("");

        try {
            const result = await handleLogin({ ...data, captchaToken });

            if (result.mfaRequired && result.mfaPendingToken) {
                setMfaPendingToken(result.mfaPendingToken);
                setIsLoading(false);
                return;
            }

            if (result.passwordChangeRequired && result.passwordChangePendingToken) {
                router.push(`/change-expired-password?token=${encodeURIComponent(result.passwordChangePendingToken)}`);
                return;
            }

            if (result.success && result.data) {
                redirectByRole(result.data.role);
                return;
            }

            setError(result.message || "Login failed. Please try again.");
            setFailedAttempts((prev) => prev + 1); // shows CAPTCHA from the 2nd attempt on
            setIsLoading(false);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            setIsLoading(false);
        }
    };

    const onVerifyMfa = async () => {
        setMfaError("");
        const parsed = mfaVerifySchema.safeParse({ token: mfaCode });
        if (!parsed.success) {
            setMfaError(parsed.error.issues[0].message);
            return;
        }

        setMfaLoading(true);
        try {
            const result = await handleVerifyMfa(mfaPendingToken!, mfaCode);
            if (result.success && result.data) {
                redirectByRole(result.data.role);
            } else {
                setMfaError(result.message || "Invalid code. Please try again.");
                setMfaLoading(false);
            }
        } catch (err: any) {
            setMfaError(err.message || "Verification failed.");
            setMfaLoading(false);
        }
    };

    // ---------- MFA step UI ----------
    if (mfaPendingToken) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col items-center text-center gap-2">
                    <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-lg font-bold text-secondary">Two-factor verification</h2>
                    <p className="text-sm text-text-muted">
                        Enter the 6-digit code from your authenticator app.
                    </p>
                </div>

                {mfaError && (
                    <div className="p-3 rounded-xl bg-danger-light border border-danger/20 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-danger shrink-0" />
                        <p className="text-sm text-danger font-medium">{mfaError}</p>
                    </div>
                )}

                <input
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                    autoFocus
                />

                <button
                    onClick={onVerifyMfa}
                    disabled={mfaLoading || mfaCode.length !== 6}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                >
                    {mfaLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Continue"}
                </button>

                <button
                    onClick={() => setMfaPendingToken(null)}
                    className="w-full text-sm text-text-muted hover:text-text transition-colors"
                >
                    ← Back to login
                </button>
            </div>
        );
    }

    // ---------- Password step UI ----------
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
                <div className="p-3 rounded-xl bg-danger-light border border-danger/20 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                    <p className="text-sm text-danger font-medium">{error}</p>
                </div>
            )}

            <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-secondary">
                    Email Address
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                        {...register("email")}
                        type="email"
                        id="email"
                        placeholder="you@example.com"
                        className="input-field pl-10"
                    />
                </div>
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-secondary">
                    Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="••••••••"
                        className="input-field pl-10 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>

            {/* SECURITY FEATURE: adaptive CAPTCHA — only shown after a failed
                attempt, matching the backend's own adaptive requirement, rather
                than forcing every legitimate first-try login through it. */}
            {failedAttempts >= 1 && (
                <div className="flex justify-center">
                    <Recaptcha onVerify={(token) => { setCaptchaToken(token); setValue("captchaToken", token); }} />
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Logging in...</span>
                    </>
                ) : (
                    <span>Log in</span>
                )}
            </button>

            <p className="text-center text-sm text-text-muted">
                Don't have an account?{" "}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                    Sign up
                </Link>
            </p>
            <p className="text-center text-sm text-text-muted">
                <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
                    Forgot Password?
                </Link>
            </p>
        </form>
    );
}