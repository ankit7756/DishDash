import ResetPasswordForm from "../_components/ResetPasswordForm";

export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const query = await searchParams;
    const token = query.token as string | undefined;

    if (!token) {
        return (
            <div className="w-full max-w-md text-center space-y-4">
                <h1 className="text-2xl font-bold text-danger">Invalid Reset Link</h1>
                <p className="text-text-muted">The password reset link is invalid or has expired.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <ResetPasswordForm token={token} />
        </div>
    );
}