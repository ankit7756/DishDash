import Link from "next/link";
import { UtensilsCrossed, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-secondary text-white mt-auto">
            <div className="container py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                    <Link href="/" className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <UtensilsCrossed className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold">Dish<span className="text-primary-light">Dash</span></span>
                    </Link>
                    <p className="text-sm text-white/60">Great food, delivered fast to your doorstep.</p>
                </div>

                <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-white/80">Company</h4>
                    <ul className="space-y-2 text-sm text-white/60">
                        <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                        <li><Link href="/user/restaurants" className="hover:text-white transition-colors">Restaurants</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-white/80">Account</h4>
                    <ul className="space-y-2 text-sm text-white/60">
                        <li><Link href="/login" className="hover:text-white transition-colors">Log in</Link></li>
                        <li><Link href="/register" className="hover:text-white transition-colors">Sign up</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-white/80">Follow Us</h4>
                    <div className="flex gap-3">
                        <a href="#" className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                            <Facebook className="h-4 w-4" />
                        </a>
                        <a href="#" className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                            <Instagram className="h-4 w-4" />
                        </a>
                        <a href="#" className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors">
                            <Twitter className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/10 py-5">
                <p className="text-center text-xs text-white/50">
                    © {new Date().getFullYear()} DishDash. Built for Softwarica College coursework.
                </p>
            </div>
        </footer>
    );
}