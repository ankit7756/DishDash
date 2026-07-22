import Link from "next/link";

export default function UserFooter() {
    return (
        <footer className="border-t border-border/50 bg-background mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © 2025 Foodify. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="/about" className="text-xs text-muted-foreground hover:text-orange-500 transition-colors">About</Link>
                        <Link href="#" className="text-xs text-muted-foreground hover:text-orange-500 transition-colors">Privacy</Link>
                        <Link href="#" className="text-xs text-muted-foreground hover:text-orange-500 transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}