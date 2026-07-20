import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center px-4 py-12">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mb-8">
                <div className="relative h-9 w-9 rounded-xl overflow-hidden">
                    <Image src="/images/foodify_logo.png" alt="Foodify" fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-base">
                        F
                    </div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
                    Foodify
                </span>
            </Link>

            {/* Card */}
            <div className="w-full max-w-md bg-background rounded-2xl border border-border shadow-sm p-8">
                {children}
            </div>
        </div>
    );
}