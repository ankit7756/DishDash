import ForgotPasswordForm from "../_components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-secondary">Forgot your password?</h1>
                <p className="text-sm text-text-muted">Enter your email and we'll send you a reset link.</p>
            </div>
            <ForgotPasswordForm />
        </div>
    );
}