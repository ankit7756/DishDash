import LoginForm from "../_components/LoginForm";

export default function LoginPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-secondary">Log in to DishDash</h1>
                <p className="text-sm text-text-muted">Welcome back! Enter your details below.</p>
            </div>
            <LoginForm />
        </div>
    );
}