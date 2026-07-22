"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Users, UtensilsCrossed, ShoppingBag,
    ClipboardList, Star, LogOut, X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/restaurants", label: "Restaurants", icon: UtensilsCrossed },
    { href: "/admin/foods", label: "Foods", icon: ShoppingBag },
    { href: "/admin/orders", label: "Orders", icon: ClipboardList },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
];

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

export default function AdminSidebar({ mobileOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const isActive = (href: string) =>
        pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));

    const content = (
        <div className="flex flex-col h-full bg-[#0a0c12] border-r border-white/[0.06]">

            {/* Logo */}
            <div className="flex items-center justify-between px-5 h-[60px] border-b border-white/[0.06] flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#0a0c12] font-black text-xs">F</span>
                    </div>
                    <div>
                        <span className="font-bold text-white text-[14px] tracking-tight">Foodify</span>
                        <span className="block text-[9px] text-white/25 uppercase tracking-widest font-medium -mt-0.5">Admin</span>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-white/25 hover:text-white/70 lg:hidden transition-colors p-1">
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest px-3 pb-2 pt-1">
                    Navigation
                </p>
                {NAV.map(({ href, label, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group relative ${active
                                ? "bg-white/[0.08] text-white"
                                : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"
                                }`}
                        >
                            {active && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-amber-400 rounded-full" />
                            )}
                            <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${active ? "text-amber-400" : "text-current"}`} />
                            <span className="flex-1">{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom logout */}
            <div className="px-3 pb-4 border-t border-white/[0.06] pt-3">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/25 hover:text-red-400/80 hover:bg-red-400/[0.06] transition-all"
                >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    Sign out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex flex-col w-56 fixed inset-y-0 left-0 z-40">
                {content}
            </aside>

            {/* Mobile overlay */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <aside className="fixed inset-y-0 left-0 w-56 z-50 lg:hidden flex flex-col">
                        {content}
                    </aside>
                </>
            )}
        </>
    );
}