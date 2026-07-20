import RegisterForm from "../_components/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-secondary">Create your account</h1>
                <p className="text-sm text-text-muted">Join DishDash and get food delivered fast.</p>
            </div>
            <RegisterForm />
        </div>
    );
}