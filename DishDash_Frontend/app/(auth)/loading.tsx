import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        </div>
    );
}