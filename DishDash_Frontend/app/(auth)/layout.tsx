import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
            <Link href="/" className="flex items-center gap-2 mb-8">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white">
                    <UtensilsCrossed className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold text-secondary">
                    Dish<span className="text-primary">Dash</span>
                </span>
            </Link>

            <div className="w-full max-w-md card p-8">
                {children}
            </div>
        </div>
    );
}