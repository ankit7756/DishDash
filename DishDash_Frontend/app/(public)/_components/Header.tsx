"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "@/app/_components/ThemeToggle";

const NAV_LINKS = [
    { href: "/", label: "Explore" },
    { href: "/about", label: "About" },
];

export default function Header() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActive = (href: string) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-background/95 backdrop-blur-xl shadow-sm border-b border-border/60"
                : "bg-background/70 backdrop-blur-md"
                }`}
        >
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-8">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                        <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-md group-hover:shadow-orange-200 dark:group-hover:shadow-orange-900/40 transition-shadow duration-300">
                            <Image
                                src="/images/foodify_logo.png"
                                alt="Foodify"
                                fill
                                className="object-cover"
                                onError={(e) => {
                                    // Fallback if logo not found
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                            {/* Fallback gradient icon */}
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                                F
                            </div>
                        </div>
                        <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
                            Foodify
                        </span>
                    </Link>

                    {/* Desktop Nav Links — centered */}
                    <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isActive(link.href)
                                    ? "text-orange-600 dark:text-orange-400"
                                    : "text-foreground/60 hover:text-foreground hover:bg-accent"
                                    }`}
                            >
                                {link.label}
                                {isActive(link.href) && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-gradient-to-r from-orange-500 to-pink-600" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <ThemeToggle />

                        <div className="hidden sm:flex items-center gap-2">
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-medium rounded-lg text-foreground/70 hover:text-foreground hover:bg-accent transition-all duration-200"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 shadow-sm hover:shadow-md hover:shadow-orange-200 dark:hover:shadow-orange-900/30 transition-all duration-200"
                            >
                                Sign up
                            </Link>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                            aria-label="Toggle menu"
                        >
                            <div className="w-5 h-4 flex flex-col justify-between">
                                <span className={`block h-0.5 bg-foreground rounded-full transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
                                <span className={`block h-0.5 bg-foreground rounded-full transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                                <span className={`block h-0.5 bg-foreground rounded-full transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-[9px]" : ""}`} />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-72 opacity-100 pb-4" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="pt-2 border-t border-border/50 flex flex-col gap-1">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive(link.href)
                                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                    : "text-foreground/70 hover:bg-accent hover:text-foreground"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="h-px bg-border/50 my-1" />
                        <Link
                            href="/login"
                            onClick={() => setMobileOpen(false)}
                            className="px-3 py-2.5 text-sm font-medium text-center rounded-lg border border-border hover:bg-accent transition-all"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/register"
                            onClick={() => setMobileOpen(false)}
                            className="px-3 py-2.5 text-sm font-semibold text-center rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 transition-all"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}