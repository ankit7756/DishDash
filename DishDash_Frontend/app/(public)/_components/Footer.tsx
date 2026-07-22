import Link from "next/link";
import Image from "next/image";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div className="md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="relative h-9 w-9 rounded-xl overflow-hidden shadow-sm">
                                <Image src="/images/foodify_logo.png" alt="Foodify" fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                                    F
                                </div>
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
                                Foodify
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Delicious food from your favorite restaurants, delivered fast to your doorstep.
                        </p>
                        <div className="flex items-center gap-3">
                            <a href="#" className="p-2 rounded-lg text-muted-foreground hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 rounded-lg text-muted-foreground hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a href="#" className="p-2 rounded-lg text-muted-foreground hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all">
                                <Twitter className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
                        <ul className="space-y-2.5">
                            {[
                                { href: "/", label: "Home" },
                                { href: "/about", label: "About" },
                                { href: "/login", label: "Log in" },
                                { href: "/register", label: "Sign up" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-orange-500 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">Company</h4>
                        <ul className="space-y-2.5">
                            {[
                                { href: "/about", label: "About Us" },
                                { href: "#", label: "Careers" },
                                { href: "#", label: "Privacy Policy" },
                                { href: "#", label: "Terms of Service" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-orange-500 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-foreground">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                                <span>hello@foodify.com</span>
                            </li>
                            <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                                <span>+977 9800000000</span>
                            </li>
                            <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                                <span>Kathmandu, Nepal</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © 2025 Foodify. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Made with</span>
                        <span className="text-red-500">♥</span>
                        <span>for food lovers</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}