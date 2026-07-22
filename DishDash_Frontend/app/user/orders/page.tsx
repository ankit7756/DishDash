"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ShoppingBag, Clock, CheckCircle, XCircle,
    ChevronRight, Package, Star, RefreshCw
} from "lucide-react";
import { getCurrentOrders, getOrderHistory, Order } from "@/lib/api/order-api";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

type Tab = "current" | "history";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: {
        label: "Order Placed",
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-100 dark:bg-orange-900/30",
        icon: <Clock className="h-3.5 w-3.5" />,
    },
    preparing: {
        label: "Preparing",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-100 dark:bg-blue-900/30",
        icon: <Package className="h-3.5 w-3.5" />,
    },
    out_for_delivery: {
        label: "Out for Delivery",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-100 dark:bg-purple-900/30",
        icon: <ShoppingBag className="h-3.5 w-3.5" />,
    },
    delivered: {
        label: "Delivered",
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-900/30",
        icon: <CheckCircle className="h-3.5 w-3.5" />,
    },
    cancelled: {
        label: "Cancelled",
        color: "text-red-500",
        bg: "bg-red-100 dark:bg-red-900/30",
        icon: <XCircle className="h-3.5 w-3.5" />,
    },
};

function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function OrderCard({ order, isHistory }: { order: Order; isHistory: boolean }) {
    const router = useRouter();
    const { addItem, replaceCart, restaurantId: cartRestaurantId, items: cartItems, clearCart } = useCartStore();
    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
    const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);

    const handleReorder = (e: React.MouseEvent) => {
        e.preventDefault();

        let restaurantId: string | undefined;

        if (order.restaurantId && typeof order.restaurantId === "object") {
            const obj = order.restaurantId as any;
            // Mongoose serializes _id → id in JSON responses, so check both
            restaurantId = obj._id?.toString() || obj.id?.toString();
        } else if (order.restaurantId) {
            restaurantId = order.restaurantId.toString();
        }

        if (!restaurantId) {
            alert("Could not find restaurant info. Please try again.");
            return;
        }

        if (cartItems.length > 0 && cartRestaurantId !== restaurantId) {
            if (!confirm(`Replace your current cart with items from ${order.restaurantName}?`)) return;
            clearCart();
        }
        order.items.forEach((item) => {
            addItem({
                foodId: item.foodId,
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                restaurantId,
                restaurantName: order.restaurantName,
            });
        });
        router.push("/user/cart");
    };

    return (
        <Link
            href={`/user/orders/${order._id}`}
            className="block bg-background border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-200"
        >
            {/* Top strip by status color */}
            <div className={`h-1 w-full ${order.status === "delivered" ? "bg-green-500" :
                order.status === "cancelled" ? "bg-red-400" :
                    order.status === "preparing" ? "bg-blue-500" :
                        order.status === "out_for_delivery" ? "bg-purple-500" :
                            "bg-orange-500"
                }`} />

            <div className="p-4">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{order.restaurantName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(order.orderDate || order.createdAt)}
                        </p>
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon}
                        {cfg.label}
                    </div>
                </div>

                {/* Items preview */}
                <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                    {order.items.map(i => `${i.name} ×${i.quantity}`).join(", ")}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="text-sm">
                        <span className="font-bold text-orange-500">Rs. {order.totalAmount}</span>
                        <span className="text-muted-foreground text-xs ml-1.5">· {totalItems} item{totalItems !== 1 ? "s" : ""}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        {isHistory && order.status === "delivered" && (
                            <button
                                onClick={handleReorder}
                                className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1 rounded-lg transition-colors"
                            >
                                <RefreshCw className="h-3 w-3" />
                                Reorder
                            </button>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function OrdersPage() {
    const [tab, setTab] = useState<Tab>("current");
    const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
    const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const [curr, hist] = await Promise.all([getCurrentOrders(), getOrderHistory()]);
            setCurrentOrders(curr);
            setHistoryOrders(hist);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const displayed = tab === "current" ? currentOrders : historyOrders;

    return (
        <div className="min-h-screen bg-background">

            {/* Header */}
            <div className="bg-gradient-to-br from-orange-500 to-pink-600 py-10">
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    <h1 className="text-3xl font-extrabold text-white mb-1">My Orders</h1>
                    <p className="text-white/70 text-sm">Track and manage your orders</p>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">

                {/* Tabs */}
                <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mt-6 mb-6">
                    {(["current", "history"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === t
                                ? "bg-background shadow-sm text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {t === "current" ? "Current" : "History"}
                            {t === "current" && currentOrders.length > 0 && (
                                <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                                    {currentOrders.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
                        ))}
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="text-center py-20 space-y-3">
                        <p className="text-5xl">{tab === "current" ? "🍽️" : "📋"}</p>
                        <h3 className="text-xl font-semibold">
                            {tab === "current" ? "No active orders" : "No order history"}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {tab === "current"
                                ? "Place an order to see it here"
                                : "Completed and cancelled orders will appear here"}
                        </p>
                        <Link
                            href="/user/dashboard"
                            className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white text-sm font-bold hover:from-orange-600 hover:to-pink-700 transition-all"
                        >
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayed.map((order) => (
                            <OrderCard key={order._id} order={order} isHistory={tab === "history"} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}