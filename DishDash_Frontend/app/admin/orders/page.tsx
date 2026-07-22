"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { adminGetOrders, adminUpdateOrderStatus } from "@/lib/api/admin-api";

const STATUSES = ["all", "pending", "preparing", "out_for_delivery", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    preparing: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    out_for_delivery: "bg-violet-400/10 text-violet-400 border-violet-400/20",
    delivered: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    cancelled: "bg-red-400/10 text-red-400 border-red-400/20",
};

const STATUS_DOT: Record<string, string> = {
    pending: "bg-amber-400",
    preparing: "bg-blue-400",
    out_for_delivery: "bg-violet-400",
    delivered: "bg-emerald-400",
    cancelled: "bg-red-400",
};

const STATUS_LABELS: Record<string, string> = {
    all: "All",
    pending: "Pending",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

function StatusBadge({ status, orderId, onUpdate }: { status: string; orderId: string; onUpdate: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = async (newStatus: string) => {
        if (newStatus === status) { setOpen(false); return; }
        setLoading(true);
        try {
            await adminUpdateOrderStatus(orderId, newStatus);
            onUpdate();
        } finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded border flex items-center gap-1.5 hover:opacity-80 transition-opacity uppercase tracking-wide ${STATUS_COLORS[status]}`}
            >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : (
                    <>
                        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[status]}`} />
                        {STATUS_LABELS[status] ?? status}
                        <span className="opacity-40 text-[9px]">▾</span>
                    </>
                )}
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 top-full mt-1.5 w-44 bg-[#13161f] border border-white/[0.09] rounded-xl shadow-2xl shadow-black/50 z-20 overflow-hidden py-1">
                        {STATUSES.filter(s => s !== "all").map((s) => (
                            <button key={s} onClick={() => handleChange(s)}
                                className={`w-full text-left px-3.5 py-2 text-[12px] hover:bg-white/[0.04] transition-colors flex items-center gap-2.5 ${s === status ? "text-white/80" : "text-white/35 hover:text-white/70"}`}>
                                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[s]}`} />
                                {STATUS_LABELS[s]}
                                {s === status && <span className="ml-auto text-amber-400/60 text-[10px]">✓</span>}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchOrders = async (page = 1) => {
        setLoading(true);
        try {
            const res = await adminGetOrders(
                String(page), "15",
                statusFilter !== "all" ? statusFilter : undefined,
                search || undefined
            );
            setOrders(res.data ?? []);
            setPagination(res.pagination ?? { page: 1, totalPages: 1, totalItems: 0 });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(1); }, [statusFilter, search]);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Orders</h1>
                <p className="text-[13px] text-white/30 mt-0.5">Manage and update all customer orders</p>
            </div>

            {/* Filter tabs + search row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-1 flex-wrap">
                    {STATUSES.map((s) => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${statusFilter === s
                                    ? "bg-white/10 text-white/90"
                                    : "text-white/25 hover:text-white/60 hover:bg-white/[0.04]"
                                }`}>
                            {STATUS_LABELS[s]}
                        </button>
                    ))}
                </div>

                <form
                    onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); }}
                    className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3.5 py-2 sm:ml-auto w-full sm:w-auto"
                >
                    <Search className="h-3.5 w-3.5 text-white/25 flex-shrink-0" />
                    <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
                        placeholder="Search by restaurant..."
                        className="flex-1 text-[13px] text-white/70 bg-transparent outline-none placeholder:text-white/20 w-44" />
                </form>
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="h-5 w-5 animate-spin text-amber-400/60" />
                </div>
            ) : (
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr className="border-b border-white/[0.05]">
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Order</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Customer</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Restaurant</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Items</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Total</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Payment</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Status</th>
                                    <th className="text-left px-5 py-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-16 text-white/20 text-[13px]">No orders found</td>
                                    </tr>
                                ) : orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3">
                                            <span className="font-mono text-[11px] text-white/25 bg-white/[0.04] px-2 py-0.5 rounded">
                                                #{order._id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0a0c12] text-[10px] font-black flex-shrink-0 overflow-hidden">
                                                    {order.userId?.profileImage ? (
                                                        <Image src={order.userId.profileImage} alt="" width={28} height={28} unoptimized className="object-cover w-full h-full" />
                                                    ) : (
                                                        order.userId?.fullName?.[0]?.toUpperCase() ?? "U"
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white/70 text-[12px]">{order.userId?.fullName ?? "Unknown"}</p>
                                                    <p className="text-[10px] text-white/25">{order.userId?.email ?? ""}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 text-white/35 text-[12px] max-w-[120px] truncate">{order.restaurantName}</td>
                                        <td className="px-5 py-3 text-white/35">{order.items?.length ?? 0} items</td>
                                        <td className="px-5 py-3 font-semibold text-white/70">Rs. {order.totalAmount}</td>
                                        <td className="px-5 py-3 text-white/25 text-[12px]">{order.paymentMethod}</td>
                                        <td className="px-5 py-3">
                                            <StatusBadge status={order.status} orderId={order._id} onUpdate={() => fetchOrders(pagination.page)} />
                                        </td>
                                        <td className="px-5 py-3 text-white/25 text-[11px]">
                                            {new Date(order.createdAt).toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
                            <p className="text-[11px] text-white/20">{pagination.totalItems} orders total</p>
                            <div className="flex items-center gap-1">
                                <button onClick={() => fetchOrders(pagination.page - 1)} disabled={pagination.page === 1}
                                    className="p-1.5 rounded-md text-white/25 hover:text-white/70 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => i + 1).map((p) => (
                                    <button key={p} onClick={() => fetchOrders(p)}
                                        className={`h-7 w-7 rounded-md text-[12px] font-semibold transition-all ${p === pagination.page ? "bg-amber-400 text-[#0a0c12]" : "text-white/30 hover:text-white/70 hover:bg-white/[0.06]"}`}>
                                        {p}
                                    </button>
                                ))}
                                <button onClick={() => fetchOrders(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}
                                    className="p-1.5 rounded-md text-white/25 hover:text-white/70 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}