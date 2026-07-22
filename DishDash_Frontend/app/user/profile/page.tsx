"use client";

import Image from "next/image";
import Link from "next/link";
import {
    User, Mail, Phone, AtSign, Shield, Calendar,
    Pencil, Star, ShoppingBag, LogOut, ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function Avatar({ src, name }: { src?: string | null; name?: string }) {
    const initial = name?.[0]?.toUpperCase() ?? "U";
    if (src) {
        return (
            <Image
                src={src}
                alt={name ?? "Profile"}
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-background shadow-lg"
            />
        );
    }
    return (
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white dark:ring-background shadow-lg">
            {initial}
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-4 py-3.5 border-b border-border/50 last:border-0">
            <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm font-medium truncate">{value || "—"}</p>
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-NP", { year: "numeric", month: "long", day: "numeric" })
        : "—";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 pb-12">

            {/* Hero */}
            <div className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-pink-600 pt-10 pb-20 px-4 overflow-hidden">
                <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-8 h-24 w-24 rounded-full bg-white/5 translate-y-1/2" />
                <div className="relative mx-auto max-w-lg flex flex-col items-center text-center">
                    <Avatar src={user?.profileImage} name={user?.fullName} />
                    <h1 className="text-2xl font-extrabold text-white mt-4">{user?.fullName}</h1>
                    <p className="text-white/70 text-sm">@{user?.username}</p>
                    <span className="mt-2 inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
                        <Shield className="h-3 w-3" />
                        {user?.role ?? "user"}
                    </span>
                </div>
            </div>

            <div className="mx-auto max-w-lg px-4 sm:px-6 -mt-10 space-y-4">

                {/* Edit button */}
                <Link href="/user/profile/edit"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-background border border-border shadow-md text-sm font-semibold hover:bg-accent transition-all">
                    <Pencil className="h-4 w-4 text-orange-500" />
                    Edit Profile
                </Link>

                {/* Info */}
                <div className="bg-background border border-border rounded-2xl px-5 py-1 shadow-sm">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-4 pb-2">Personal Info</h2>
                    <InfoRow icon={User} label="Full Name" value={user?.fullName ?? ""} />
                    <InfoRow icon={AtSign} label="Username" value={`@${user?.username ?? ""}`} />
                    <InfoRow icon={Mail} label="Email" value={user?.email ?? ""} />
                    <InfoRow icon={Phone} label="Phone" value={user?.phone ?? ""} />
                    <InfoRow icon={Calendar} label="Member Since" value={joinedDate} />
                </div>

                {/* Quick links */}
                <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-5 pt-4 pb-2">Quick Links</h2>
                    {[
                        { href: "/user/orders", icon: ShoppingBag, label: "My Orders", desc: "View all your orders" },
                        { href: "/user/reviews", icon: Star, label: "My Reviews", desc: "All reviews you've written" },
                    ].map(({ href, icon: Icon, label, desc }) => (
                        <Link key={href} href={href}
                            className="flex items-center gap-4 px-5 py-3.5 border-b border-border/50 last:border-0 hover:bg-accent transition-all">
                            <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                                <Icon className="h-4 w-4 text-orange-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold">{label}</p>
                                <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                    ))}
                </div>

                {/* Account actions */}
                <div className="bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
                    <Link href="/forgot-password"
                        className="flex items-center gap-4 px-5 py-3.5 border-b border-border/50 hover:bg-accent transition-all">
                        <div className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold">Change Password</p>
                            <p className="text-xs text-muted-foreground">Update your account password</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    <button onClick={logout}
                        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all">
                        <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                            <LogOut className="h-4 w-4 text-red-500" />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-red-500">Log Out</p>
                            <p className="text-xs text-muted-foreground">Sign out of your account</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}