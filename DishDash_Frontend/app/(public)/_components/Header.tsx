"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, Menu, X } from "lucide-react";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
];

export default function Header() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border">
            <div className="container flex items-center justify-between h-16">
                <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                    <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white group-hover:bg-primary-dark transition-colors">
                        <UtensilsCrossed className="h-4.5 w-4.5" />
                    </div>
                    <span className="text-xl font-bold text-secondary">
                        Dish<span className="text-primary">Dash</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-medium transition-colors ${pathname === link.href ? "text-primary" : "text-text-muted hover:text-text"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <Link href="/login" className="text-sm font-semibold text-text hover:text-primary transition-colors px-4 py-2">
                        Log in
                    </Link>
                    <Link href="/register" className="btn-primary text-sm">
                        Sign up
                    </Link>
                </div>

                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden p-2 text-text"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {mobileOpen && (
                <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-3">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="block text-sm font-medium text-text py-1"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="flex gap-3 pt-2">
                        <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 text-center text-sm">
                            Log in
                        </Link>
                        <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 text-center text-sm">
                            Sign up
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}