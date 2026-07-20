"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { forgetPasswordSchema, ForgetPasswordData } from "../schema";
import { handleRequestPasswordReset } from "../../../lib/actions/auth-action";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Recaptcha from "../_components/shared/Recaptcha";

export default function ForgotPasswordForm() {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | undefined>();

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ForgetPasswordData>({
        resolver: zodResolver(forgetPasswordSchema),
    });

    const onSubmit = async (data: ForgetPasswordData) => {
        setIsLoading(true);
        setError("");
        setSuccess("");
        try {
            const result = await handleRequestPasswordReset(data.email, captchaToken);
            if (result.success) {
                setSuccess(result.message);
            } else {
                setError(result.message || "Something went wrong.");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                <label className="block text-sm font-semibold text-secondary">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input {...register("email")} type="email" placeholder="you@example.com" className="input-field pl-10" />
                </div>
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>

            <div className="flex justify-center">
                <Recaptcha onVerify={(token) => { setCaptchaToken(token); setValue("captchaToken", token); }} />
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Reset Link"}
            </button>

            <p className="text-center text-sm text-text-muted">
                <Link href="/login" className="font-semibold text-primary hover:underline">← Back to login</Link>
            </p>
        </form>
    );
}