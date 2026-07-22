"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Users, UtensilsCrossed, ShoppingBag, ClipboardList,
    TrendingUp, Eye, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { getAdminStats } from "@/lib/api/admin-api";
import { getAllUsers, deleteUser } from "@/lib/api/admin/user";
import DeleteModal from "@/app/_components/DeleteModal";
import Image from "next/image";

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-400/10 text-amber-400 border border-amber-400/20",
    preparing: "bg-blue-400/10 text-blue-400 border border-blue-400/20",
    out_for_delivery: "bg-violet-400/10 text-violet-400 border border-violet-400/20",
    delivered: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20",
    cancelled: "bg-red-400/10 text-red-400 border border-red-400/20",
};

const STATUS_LABELS: Record<string, string> = {
    pending: "Pending",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

function StatCard({ label, value, icon: Icon, accent, sub }: {
    label: string;
    value: string | number;
    icon: any;
    accent: string;
    sub?: string;
}) {
    return (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-[11px] text-white/35 mt-0.5 font-medium">{label}</p>
            {sub && <p className="text-[10px] text-white/20 mt-0.5">{sub}</p>}
        </div>
    );
}

function UserAvatar({ src, name }: { src?: string | null; name?: string }) {
    const initial = name?.[0]?.toUpperCase() ?? "U";
    if (src) return (
        <Image src={src} alt={name ?? ""} width={28} height={28} unoptimized
            className="h-7 w-7 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10" />
    );
    return (
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0a0c12] text-[10px] font-black flex-shrink-0">
            {initial}
        </div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<any>(null);

    useEffect(() => {
        getAdminStats()
            .then(setStats)
            .finally(() => setLoadingStats(false));
    }, []);

    const fetchUsers = async (page = 1) => {
        setLoadingUsers(true);
        try {
            const res = await getAllUsers(String(page), "8", search || undefined);
            setUsers(res.data ?? []);
            setPagination(res.pagination ?? { page: 1, totalPages: 1, totalItems: 0 });
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => { fetchUsers(1); }, [search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteUser(deleteTarget._id);
        setDeleteTarget(null);
        fetchUsers(pagination.page);
    };

    return (
        <div className="space-y-6">

            {/* Page header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
                    <p className="text-[13px] text-white/30 mt-0.5">Welcome back — here's the overview.</p>
                </div>
                <span className="text-[11px] text-white/20 font-medium">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </span>
            </div>

            {/* Stats grid */}
            {loadingStats ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-28 rounded-xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users}
                        accent="bg-blue-400/10 text-blue-400" />
                    <StatCard label="Restaurants" value={stats?.totalRestaurants ?? 0} icon={UtensilsCrossed}
                        accent="bg-amber-400/10 text-amber-400" />
                    <StatCard label="Foods" value={stats?.totalFoods ?? 0} icon={ShoppingBag}
                        accent="bg-pink-400/10 text-pink-400" />
                    <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} icon={ClipboardList}
                        accent="bg-violet-400/10 text-violet-400" />
                    <StatCard label="Orders This Month" value={stats?.ordersThisMonth ?? 0} icon={TrendingUp}
                        accent="bg-emerald-400/10 text-emerald-400" />
                    <StatCard label="Revenue" value={`Rs. ${(stats?.revenueThisMonth ?? 0).toLocaleString()}`}
                        icon={TrendingUp} accent="bg-amber-400/10 text-amber-400" sub="Delivered orders only" />
                </div>
            )}

            {/* Recent Orders */}
            {stats?.recentOrders?.length > 0 && (
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                        <h2 className="text-[13px] font-semibold text-white/80">Recent Orders</h2>
                        <Link href="/admin/orders" className="text-[11px] text-amber-400/70 hover:text-amber-400 font-medium transition-colors">
                            View all →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr className="border-b border-white/[0.05]">
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Customer</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Restaurant</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Amount</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Status</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {stats.recentOrders.map((order: any) => (
                                    <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3">
                                            <p className="font-medium text-white/80 truncate max-w-[140px]">
                                                {order.userId?.fullName ?? "Unknown"}
                                            </p>
                                            <p className="text-[11px] text-white/25">{order.userId?.email ?? ""}</p>
                                        </td>
                                        <td className="px-5 py-3 text-white/40 truncate max-w-[120px]">{order.restaurantName}</td>
                                        <td className="px-5 py-3 font-semibold text-white/70">Rs. {order.totalAmount}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${STATUS_COLORS[order.status] ?? ""}`}>
                                                {STATUS_LABELS[order.status] ?? order.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-white/25 text-[11px]">
                                            {new Date(order.createdAt).toLocaleDateString("en-NP", { day: "numeric", month: "short" })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Users table */}
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b border-white/[0.06]">
                    <h2 className="text-[13px] font-semibold text-white/80">All Users</h2>
                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-1.5">
                            <Search className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search users..."
                                className="bg-transparent text-[12px] text-white/70 outline-none w-36 placeholder:text-white/20"
                            />
                        </form>
                        <Link
                            href="/admin/users/add"
                            className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-[#0a0c12] text-[12px] font-bold hover:bg-amber-300 transition-colors whitespace-nowrap"
                        >
                            + Add User
                        </Link>
                    </div>
                </div>

                {loadingUsers ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-amber-400/60" />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-[13px]">
                                <thead>
                                    <tr className="border-b border-white/[0.05]">
                                        <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">User</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Email</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Phone</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Role</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.04]">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <UserAvatar src={user.profileImage} name={user.fullName} />
                                                    <p className="font-medium text-white/80">{user.fullName}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-white/35">{user.email}</td>
                                            <td className="px-5 py-3 text-white/35">{user.phone}</td>
                                            <td className="px-5 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${user.role === "admin"
                                                    ? "bg-violet-400/10 text-violet-400 border border-violet-400/20"
                                                    : "bg-blue-400/10 text-blue-400 border border-blue-400/20"
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Link
                                                        href={`/admin/users/${user._id}`}
                                                        className="p-1.5 rounded-md text-white/25 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/users/${user._id}/edit`}
                                                        className="p-1.5 rounded-md text-white/25 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteTarget(user)}
                                                        className="p-1.5 rounded-md text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                                <p className="text-[11px] text-white/20">
                                    {pagination.totalItems} users total
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => fetchUsers(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="p-1.5 rounded-md text-white/25 hover:text-white/70 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </button>
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => fetchUsers(p)}
                                            className={`h-7 w-7 rounded-md text-[12px] font-semibold transition-all ${p === pagination.page
                                                ? "bg-amber-400 text-[#0a0c12]"
                                                : "text-white/30 hover:text-white/70 hover:bg-white/[0.06]"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => fetchUsers(pagination.page + 1)}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="p-1.5 rounded-md text-white/25 hover:text-white/70 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <DeleteModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Delete User"
                description={`Are you sure you want to delete "${deleteTarget?.fullName}"? This action cannot be undone.`}
            />
        </div>
    );
}