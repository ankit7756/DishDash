"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, LogOut, Bell, ChevronDown, User, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const PAGE_TITLES: Record<string, { title: string; desc: string }> = {
    "/admin/dashboard": { title: "Dashboard", desc: "Overview of your platform" },
    "/admin/users": { title: "Users", desc: "Manage all user accounts" },
    "/admin/users/add": { title: "Add User", desc: "Create a new user account" },
    "/admin/restaurants": { title: "Restaurants", desc: "Manage all restaurants" },
    "/admin/foods": { title: "Foods", desc: "Manage all food items" },
    "/admin/orders": { title: "Orders", desc: "View and update order statuses" },
    "/admin/reviews": { title: "Reviews", desc: "All customer reviews" },
};

function getPageMeta(pathname: string) {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    if (pathname.includes("/users/") && pathname.includes("/edit")) return { title: "Edit User", desc: "Update user information" };
    if (pathname.includes("/users/")) return { title: "View User", desc: "User profile details" };
    return { title: "Admin Panel", desc: "Foodify management" };
}

interface AdminHeaderProps {
    onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const meta = getPageMeta(pathname);

    return (
        <header className="sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur-xl border-b border-white/[0.06]">
            <div className="flex items-center justify-between px-5 sm:px-8 h-[60px] gap-4">

                {/* Left */}
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 rounded-lg text-white/40 hover:text-white/90 hover:bg-white/[0.07] transition-all flex-shrink-0"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="min-w-0">
                        <div className="flex items-baseline gap-2.5">
                            <h1 className="text-[15px] font-semibold text-white tracking-tight truncate">
                                {meta.title}
                            </h1>
                            <span className="hidden sm:block text-[11px] text-white/30 font-normal">
                                {meta.desc}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-1.5 flex-shrink-0">

                    {/* Bell */}
                    <button className="relative p-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
                        <Bell className="h-4.5 w-4.5" />
                        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    </button>

                    {/* Divider */}
                    <div className="w-px h-5 bg-white/10 mx-1" />

                    {/* Profile dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.06] transition-all group"
                        >
                            <div className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/20">
                                {user?.profileImage ? (
                                    <Image
                                        src={user.profileImage}
                                        alt="Admin"
                                        width={28}
                                        height={28}
                                        unoptimized
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                                        {user?.fullName?.[0]?.toUpperCase() ?? "A"}
                                    </div>
                                )}
                            </div>

                            <div className="hidden sm:block text-left">
                                <p className="text-[13px] font-medium text-white/80 leading-tight truncate max-w-[110px]">
                                    {user?.fullName ?? "Admin"}
                                </p>
                                <p className="text-[10px] text-amber-400/80 font-medium uppercase tracking-widest">
                                    {user?.role ?? "admin"}
                                </p>
                            </div>

                            <ChevronDown className={`h-3 w-3 text-white/25 transition-transform duration-200 hidden sm:block ${dropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {dropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                <div className="absolute right-0 top-11 w-56 bg-[#13161f] border border-white/[0.09] rounded-xl shadow-2xl shadow-black/50 py-1.5 z-20">

                                    <div className="px-4 py-3 border-b border-white/[0.07] mb-1">
                                        <p className="text-[13px] font-semibold text-white/90 truncate">{user?.fullName ?? "Admin"}</p>
                                        <p className="text-[11px] text-white/35 truncate mt-0.5">{user?.email ?? ""}</p>
                                        <span className="inline-block mt-2 text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded uppercase tracking-widest">
                                            {user?.role}
                                        </span>
                                    </div>

                                    <Link
                                        href="/admin/dashboard"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-white/45 hover:text-white/80 hover:bg-white/[0.04] transition-all"
                                    >
                                        <User className="h-3.5 w-3.5" />
                                        Dashboard
                                    </Link>

                                    <div className="h-px bg-white/[0.06] mx-3 my-1" />

                                    <button
                                        onClick={() => { setDropdownOpen(false); logout(); }}
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-400/70 hover:text-red-400 hover:bg-red-400/[0.06] transition-all"
                                    >
                                        <LogOut className="h-3.5 w-3.5" />
                                        Sign out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}