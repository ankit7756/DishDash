import ChangeExpiredPasswordForm from "../_components/ChangeExpiredPasswordForm";

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
                <h1 className="text-2xl font-bold text-danger">Invalid Session</h1>
                <p className="text-text-muted">Please log in again.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <ChangeExpiredPasswordForm pendingToken={token} />
        </div>
    );
}