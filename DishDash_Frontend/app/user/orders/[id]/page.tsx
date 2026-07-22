"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronLeft, CheckCircle, XCircle, Clock, Package,
    Truck, MapPin, Phone, Banknote, Star, RefreshCw,
    Loader2, AlertTriangle, MessageSquare
} from "lucide-react";
import {
    getOrderById, confirmDelivery, cancelOrder,
    getReviewByOrder, Order, Review
} from "@/lib/api/order-api";
import { useCartStore } from "@/store/cartStore";
import { addNotification } from "@/lib/notifications";


const TIMELINE = [
    { key: "pending", label: "Order Placed", icon: CheckCircle },
    { key: "preparing", label: "Preparing", icon: Package },
    { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const STATUS_ORDER = ["pending", "preparing", "out_for_delivery", "delivered"];

function getStepIndex(status: string) {
    const idx = STATUS_ORDER.indexOf(status);
    return idx === -1 ? 0 : idx;
}

function OrderTimeline({ status }: { status: string }) {
    const currentIdx = getStepIndex(status);
    const isCancelled = status === "cancelled";

    if (isCancelled) {
        return (
            <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
                <div>
                    <p className="font-bold text-red-600 dark:text-red-400">Order Cancelled</p>
                    <p className="text-xs text-red-500/70 mt-0.5">This order was cancelled</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Connector line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
            <div
                className="absolute top-5 left-5 h-0.5 bg-green-500 transition-all duration-700"
                style={{ width: `${(currentIdx / 3) * 100}%` }}
            />

            <div className="relative flex justify-between">
                {TIMELINE.map((step, i) => {
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    return (
                        <div key={step.key} className="flex flex-col items-center gap-2 w-16">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${done
                                ? "bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/30"
                                : "bg-muted border-2 border-border text-muted-foreground"
                                } ${active ? "ring-4 ring-green-100 dark:ring-green-900/30" : ""}`}>
                                <step.icon className="h-4 w-4" />
                            </div>
                            <p className={`text-[10px] text-center leading-tight ${done ? "font-semibold text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                                {step.label}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StarDisplay({ stars }: { stars: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
            ))}
        </div>
    );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [id, setId] = useState<string>("");
    const [order, setOrder] = useState<Order | null>(null);
    const [review, setReview] = useState<Review | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<"confirm" | "cancel" | null>(null);
    const [confirmPrompt, setConfirmPrompt] = useState(false);
    const [cancelConfirm, setCancelConfirm] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

    const { addItem, clearCart, items: cartItems, restaurantId: cartRestaurantId } = useCartStore();

    useEffect(() => {
        params.then(({ id }) => {
            setId(id);
            Promise.all([getOrderById(id), getReviewByOrder(id)])
                .then(([o, r]) => { setOrder(o); setReview(r); })
                .catch(() => router.replace("/user/orders"))
                .finally(() => setLoading(false));
        });
    }, [params, router]);

    const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleConfirm = async () => {
        setActionLoading("confirm");
        try {
            const updated = await confirmDelivery(id);
            setOrder(updated);
            addNotification(
                "Order Delivered ✓",
                `Your order from ${order?.restaurantName} has been marked as delivered.`,
                "order"
            );
            showToast("Order marked as delivered! 🎉", "success");
            setConfirmPrompt(false);
        } catch (err: any) {
            showToast(err.message || "Failed to confirm", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async () => {
        setActionLoading("cancel");
        try {
            const updated = await cancelOrder(id);
            setOrder(updated);
            addNotification(
                "Order Cancelled",
                `Your order from ${order?.restaurantName} has been cancelled.`,
                "order"
            );
            showToast("Order cancelled.", "info");
            setCancelConfirm(false);
        } catch (err: any) {
            showToast(err.message || "Failed to cancel", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReorder = async () => {
        if (!order) return;

        let restaurantId: string | undefined;

        if (order.restaurantId && typeof order.restaurantId === "object") {
            const obj = order.restaurantId as any;
            restaurantId = obj._id?.toString() || obj.id?.toString();
        } else if (order.restaurantId && typeof order.restaurantId === "string") {
            restaurantId = order.restaurantId;
        }

        if (!restaurantId) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/restaurants/search?query=${encodeURIComponent(order.restaurantName)}`);
                const data = await res.json();
                const match = data.data?.find((r: any) => r.name === order.restaurantName);
                if (match) {
                    restaurantId = match._id;
                }
            } catch {
                // search failed
            }
        }

        if (!restaurantId) {
            showToast("Could not find restaurant. It may no longer be available.", "error");
            return;
        }

        if (cartItems.length > 0 && cartRestaurantId !== restaurantId) {
            if (!confirm(`Replace cart with items from ${order.restaurantName}?`)) return;
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

    const isCurrentOrder = order && ["pending", "preparing", "out_for_delivery"].includes(order.status);
    const isDelivered = order?.status === "delivered";
    const isCancelled = order?.status === "cancelled";

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
    );

    if (!order) return null;

    const restaurantObj = typeof order.restaurantId === "object" ? order.restaurantId : null;

    return (
        <div className="min-h-screen bg-muted/30 pb-12">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all animate-in fade-in slide-in-from-top-3 ${toast.type === "success" ? "bg-green-500" :
                    toast.type === "error" ? "bg-red-500" : "bg-foreground"
                    }`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-br from-orange-500 to-pink-600 px-4 pt-5 pb-16">
                <div className="mx-auto max-w-2xl">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Orders
                    </button>
                    <h1 className="text-2xl font-extrabold text-white">Order Details</h1>
                    <p className="text-white/60 text-xs mt-1 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
                </div>
            </div>

            <div className="mx-auto max-w-2xl px-4 sm:px-6 -mt-10 space-y-4">

                {/* Timeline card */}
                <div className="bg-background border border-border rounded-2xl p-5 shadow-sm">
                    <h2 className="font-bold text-sm mb-5 text-muted-foreground uppercase tracking-wider">Order Status</h2>
                    <OrderTimeline status={order.status} />
                </div>

                {/* Restaurant + items */}
                <div className="bg-background border border-border rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-border">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {order.restaurantName[0]}
                        </div>
                        <div>
                            <p className="font-bold">{order.restaurantName}</p>
                            {restaurantObj?.address && (
                                <p className="text-xs text-muted-foreground">{restaurantObj.address}</p>
                            )}
                        </div>
                    </div>

                    <h3 className="font-semibold text-sm">Items Ordered</h3>
                    <div className="space-y-3">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="relative h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                                </div>
                                <span className="text-sm font-semibold tabular-nums">Rs. {item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery details */}
                <div className="bg-background border border-border rounded-2xl p-5 shadow-sm space-y-3">
                    <h3 className="font-semibold text-sm">Delivery Details</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-2.5 text-foreground/70">
                            <MapPin className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <span>{order.deliveryAddress}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-foreground/70">
                            <Phone className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            <span>{order.phone}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-foreground/70">
                            <Banknote className="h-4 w-4 text-orange-500 flex-shrink-0" />
                            <span>{order.paymentMethod}</span>
                        </div>
                    </div>
                </div>

                {/* Bill summary */}
                <div className="bg-background border border-border rounded-2xl p-5 shadow-sm space-y-2.5 text-sm">
                    <h3 className="font-semibold mb-1">Bill Summary</h3>
                    <div className="flex justify-between text-foreground/70">
                        <span>Items ({order.items.reduce((s, i) => s + i.quantity, 0)})</span>
                        <span>Rs. {order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-foreground/70">
                        <span>Delivery Fee</span>
                        <span>Rs. {order.deliveryFee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                        <span>Total Paid</span>
                        <span className="text-orange-500">Rs. {order.totalAmount}</span>
                    </div>
                </div>

                {/* ── Action section ── */}

                {/* Current order actions */}
                {isCurrentOrder && (
                    <div className="bg-background border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <h3 className="font-semibold text-sm">Delivery Confirmation</h3>
                        <p className="text-sm text-muted-foreground">Have you received your order?</p>

                        {!confirmPrompt && !cancelConfirm && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmPrompt(true)}
                                    className="flex-1 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors"
                                >
                                    Yes, Received! ✓
                                </button>
                                <button
                                    onClick={() => showToast("Your order is on the way, please wait! 🚴", "info")}
                                    className="flex-1 py-3 rounded-xl bg-muted text-foreground/70 font-semibold text-sm hover:bg-muted/80 transition-colors"
                                >
                                    Not Yet
                                </button>
                            </div>
                        )}

                        {confirmPrompt && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2.5">
                                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                    This will mark your order as delivered. Are you sure?
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleConfirm}
                                        disabled={actionLoading === "confirm"}
                                        className="flex-1 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 disabled:opacity-70 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        {actionLoading === "confirm" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                        Confirm
                                    </button>
                                    <button onClick={() => setConfirmPrompt(false)} className="flex-1 py-3 rounded-xl bg-muted text-foreground/70 font-semibold text-sm transition-colors">
                                        Go Back
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Cancel section */}
                        {!cancelConfirm && !confirmPrompt && (
                            <button
                                onClick={() => setCancelConfirm(true)}
                                className="w-full py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                Cancel Order
                            </button>
                        )}

                        {cancelConfirm && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl px-3 py-2.5">
                                    <XCircle className="h-4 w-4 flex-shrink-0" />
                                    Are you sure you want to cancel this order?
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancel}
                                        disabled={actionLoading === "cancel"}
                                        className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-70 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        {actionLoading === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                        Yes, Cancel
                                    </button>
                                    <button onClick={() => setCancelConfirm(false)} className="flex-1 py-3 rounded-xl bg-muted text-foreground/70 font-semibold text-sm transition-colors">
                                        Keep Order
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Delivered — review section */}
                {isDelivered && (
                    <div className="bg-background border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        {review ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm">Your Review</h3>
                                    <StarDisplay stars={review.stars} />
                                </div>
                                {review.message ? (
                                    <p className="text-sm text-foreground/70 leading-relaxed bg-muted/40 rounded-xl px-4 py-3">
                                        "{review.message}"
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">No message added.</p>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-orange-500" />
                                    <h3 className="font-semibold text-sm">Share Your Experience</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">How was your order from {order.restaurantName}?</p>
                                <Link
                                    href={`/user/orders/${order._id}/review`}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-sm hover:from-orange-600 hover:to-pink-700 transition-all shadow-md"
                                >
                                    <Star className="h-4 w-4" />
                                    Write a Review
                                </Link>
                            </>
                        )}

                        <button
                            onClick={handleReorder}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-orange-400 text-orange-500 font-semibold text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reorder
                        </button>
                    </div>
                )}

                {/* Cancelled */}
                {isCancelled && (
                    <div className="bg-background border border-border rounded-2xl p-5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-red-500">
                            <XCircle className="h-5 w-5" />
                            <p className="font-semibold text-sm">This order was cancelled</p>
                        </div>
                        <button
                            onClick={handleReorder}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-sm hover:from-orange-600 hover:to-pink-700 transition-all shadow-md"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reorder Same Items
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}