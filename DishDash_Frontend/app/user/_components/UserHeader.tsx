"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import {
    Home, UtensilsCrossed, ShoppingCart, ClipboardList,
    Search, Bell, ChevronDown, LogOut, Settings, User, X, Star, Trash2
} from "lucide-react";
import ThemeToggle from "@/app/_components/ThemeToggle";
import { useCartStore, cartItemCount } from "@/store/cartStore";
import { useAuth } from "@/context/AuthContext";
import {
    getNotifications, markAllRead, deleteNotification,
    clearAllNotifications, getUnreadCount, formatNotifTime,
    getTypeEmoji, getTypeBg, PROMO_NOTIFICATIONS,
    AppNotification
} from "@/lib/notifications";

const NAV_LINKS = [
    { href: "/user/dashboard", label: "Home", icon: Home },
    { href: "/user/restaurants", label: "Restaurants", icon: UtensilsCrossed },
    { href: "/user/orders", label: "Orders", icon: ClipboardList },
    { href: "/user/cart", label: "Cart", icon: ShoppingCart },
];

function Avatar({ src, name, className }: { src?: string | null; name?: string; className?: string }) {
    const initial = name?.[0]?.toUpperCase() ?? "U";
    if (src) {
        return (
            <Image
                src={src}
                alt={name ?? "Profile"}
                width={36}
                height={36}
                unoptimized
                className={`object-cover rounded-full ${className ?? ""}`}
            />
        );
    }
    return (
        <div className={`rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold ${className ?? ""}`}>
            {initial}
        </div>
    );
}

// ── Notification Modal ─────────────────────────────────────────────────────────
function NotificationModal({
    onClose,
    onUpdate,
}: {
    onClose: () => void;
    onUpdate: () => void;
}) {
    const [userNotifs, setUserNotifs] = useState<AppNotification[]>([]);

    const refresh = useCallback(() => {
        setUserNotifs(getNotifications());
    }, []);

    useEffect(() => {
        refresh();
        markAllRead();
        onUpdate(); // reset badge
    }, [refresh, onUpdate]);

    const handleDelete = (id: string) => {
        deleteNotification(id);
        refresh();
        onUpdate();
    };

    const handleClearAll = () => {
        clearAllNotifications();
        refresh();
        onUpdate();
    };

    // Merge: user notifications on top, promos at bottom
    const allNotifs = [...userNotifs, ...PROMO_NOTIFICATIONS];
    const hasUserNotifs = userNotifs.length > 0;

    return (
        <div className="absolute right-0 top-11 w-80 sm:w-96 bg-background border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-orange-500" />
                    <h3 className="font-bold text-sm">Notifications</h3>
                    {userNotifs.length > 0 && (
                        <span className="text-xs text-muted-foreground">({userNotifs.length})</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {hasUserNotifs && (
                        <button
                            onClick={handleClearAll}
                            className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent transition-colors">
                        <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="max-h-[420px] overflow-y-auto">
                {allNotifs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-2">
                        <Bell className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
                        <p className="text-xs text-muted-foreground/60">Order updates and offers will appear here</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/50">
                        {allNotifs.map((notif) => (
                            <div
                                key={notif.id}
                                className={`flex gap-3 px-4 py-3.5 hover:bg-accent/50 transition-colors group ${!notif.isRead && !notif.isPromo
                                        ? "bg-orange-50/60 dark:bg-orange-900/10"
                                        : ""
                                    }`}
                            >
                                {/* Icon */}
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${getTypeBg(notif.type)}`}>
                                    {getTypeEmoji(notif.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm leading-tight ${!notif.isRead && !notif.isPromo ? "font-bold" : "font-semibold"}`}>
                                            {notif.title}
                                        </p>
                                        {!notif.isPromo && (
                                            <button
                                                onClick={() => handleDelete(notif.id)}
                                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-red-500 transition-all flex-shrink-0"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        {notif.isPromo ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                                                🏷️ Offer
                                            </span>
                                        ) : (
                                            <span className="text-[11px] text-muted-foreground/60">
                                                {formatNotifTime(notif.createdAt)}
                                            </span>
                                        )}
                                        {!notif.isRead && !notif.isPromo && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border bg-muted/20">
                <p className="text-[11px] text-muted-foreground text-center">
                    Notifications are stored on this device only
                </p>
            </div>
        </div>
    );
}

// ── Main Header ───────────────────────────────────────────────────────────────
export default function UserHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();

    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const items = useCartStore((s) => s.items);
    const cartCount = cartItemCount(items);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    // Refresh unread badge
    const refreshUnread = useCallback(() => {
        setUnreadCount(getUnreadCount());
    }, []);

    // Init unread count and listen for new notifications from other pages
    useEffect(() => {
        refreshUnread();
        window.addEventListener("foodify_notification", refreshUnread);
        return () => window.removeEventListener("foodify_notification", refreshUnread);
    }, [refreshUnread]);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/user/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
            setSearchQuery("");
        }
    };

    const handleBellClick = () => {
        setProfileOpen(false);
        setSearchOpen(false);
        setNotifOpen((prev) => !prev);
    };

    return (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-sm">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-6">

                    {/* Logo */}
                    <Link href="/user/dashboard" className="flex items-center gap-2 flex-shrink-0">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                            F
                        </div>
                        <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent hidden sm:block">
                            Foodify
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                            <Link key={href} href={href}
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(href)
                                        ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
                                        : "text-foreground/60 hover:text-foreground hover:bg-accent"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                                {label === "Cart" && cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                                        {cartCount > 9 ? "9+" : cartCount}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Right icons */}
                    <div className="flex items-center gap-1.5">
                        <ThemeToggle />

                        {/* Search */}
                        <div ref={searchRef} className="relative">
                            <button
                                onClick={() => { setSearchOpen(!searchOpen); setNotifOpen(false); setProfileOpen(false); }}
                                className="p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-accent transition-all"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                            {searchOpen && (
                                <div className="absolute right-0 top-11 w-72 bg-background border border-border rounded-xl shadow-lg p-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                                        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                        <input autoFocus type="text" value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search food or restaurants..."
                                            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                                        />
                                        {searchQuery && (
                                            <button type="button" onClick={() => setSearchQuery("")}>
                                                <X className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        )}
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Bell / Notifications */}
                        <div ref={notifRef} className="relative">
                            <button
                                onClick={handleBellClick}
                                className="relative p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-accent transition-all"
                            >
                                <Bell className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                                {unreadCount === 0 && (
                                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500" />
                                )}
                            </button>

                            {notifOpen && (
                                <NotificationModal
                                    onClose={() => setNotifOpen(false)}
                                    onUpdate={refreshUnread}
                                />
                            )}
                        </div>

                        {/* Cart mobile */}
                        <Link href="/user/cart"
                            className="relative p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-accent transition-all md:hidden">
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Profile dropdown */}
                        <div ref={dropdownRef} className="relative">
                            <button
                                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setSearchOpen(false); }}
                                className="flex items-center gap-1.5 pl-1 pr-1 py-1 rounded-lg hover:bg-accent transition-all"
                            >
                                <Avatar
                                    src={user?.profileImage}
                                    name={user?.fullName}
                                    className="h-7 w-7 text-xs ring-2 ring-orange-200 dark:ring-orange-800/50"
                                />
                                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 top-11 w-56 bg-background border border-border rounded-xl shadow-lg py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-3 py-2.5 border-b border-border/50 mb-1 flex items-center gap-2.5">
                                        <Avatar
                                            src={user?.profileImage}
                                            name={user?.fullName}
                                            className="h-9 w-9 text-sm flex-shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold truncate">{user?.fullName ?? "My Account"}</p>
                                            <p className="text-xs text-muted-foreground truncate">{user?.email ?? ""}</p>
                                        </div>
                                    </div>
                                    <Link href="/user/profile" onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-accent transition-all">
                                        <User className="h-4 w-4" />
                                        Profile
                                    </Link>
                                    <Link href="/user/profile/edit" onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-accent transition-all">
                                        <Settings className="h-4 w-4" />
                                        Edit Profile
                                    </Link>
                                    <Link href="/user/reviews" onClick={() => setProfileOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-accent transition-all">
                                        <Star className="h-4 w-4" />
                                        My Reviews
                                    </Link>
                                    <div className="h-px bg-border/50 my-1" />
                                    <button onClick={() => { setProfileOpen(false); logout(); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                        <LogOut className="h-4 w-4" />
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
                    {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href}
                            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${isActive(href)
                                    ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20"
                                    : "text-foreground/60 hover:text-foreground"
                                }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            {label}
                            {label === "Cart" && cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-orange-500 text-white text-[8px] font-bold flex items-center justify-center">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    );
}