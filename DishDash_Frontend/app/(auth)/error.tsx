"use client";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="w-full max-w-md text-center space-y-6">
            <div className="flex justify-center">
                <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Something went wrong!</h2>
                <p className="text-muted-foreground">{error.message}</p>
            </div>
            <button
                onClick={reset}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-pink-700 transition-all"
            >
                Try again
            </button>
        </div>
    );
}