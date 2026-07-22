"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Star, Send, Loader2 } from "lucide-react";
import { getOrderById, submitReview, Order } from "@/lib/api/order-api";
import { addNotification } from "@/lib/notifications";

const STAR_LABELS = ["", "Terrible", "Bad", "Okay", "Good", "Excellent!"];

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [orderId, setOrderId] = useState("");
    const [order, setOrder] = useState<Order | null>(null);
    const [stars, setStars] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        params.then(({ id }) => {
            setOrderId(id);
            getOrderById(id)
                .then((o) => {
                    if (o.status !== "delivered") { router.replace(`/user/orders/${id}`); return; }
                    setOrder(o);
                })
                .catch(() => router.replace("/user/orders"))
                .finally(() => setLoading(false));
        });
    }, [params, router]);

    const handleSubmit = async () => {
        if (stars === 0) { setError("Please select a star rating"); return; }
        setSubmitting(true);
        setError(null);
        try {
            await submitReview(orderId, stars, message.trim());
            addNotification(
                "Review Submitted ⭐",
                `Thanks for reviewing your order from ${order?.restaurantName}!`,
                "review"
            );
            router.replace(`/user/orders/${orderId}`);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
    );

    if (!order) return null;

    const displayStars = hovered || stars;

    return (
        <div className="min-h-screen bg-muted/30">

            {/* Header */}
            <div className="bg-gradient-to-br from-orange-500 to-pink-600 px-4 pt-5 pb-16">
                <div className="mx-auto max-w-lg">
                    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </button>
                    <h1 className="text-2xl font-extrabold text-white">Write a Review</h1>
                    <p className="text-white/70 text-sm mt-1">{order.restaurantName}</p>
                </div>
            </div>

            <div className="mx-auto max-w-lg px-4 sm:px-6 -mt-10 space-y-4 pb-12">

                {/* Restaurant card */}
                <div className="bg-background border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                            {order.restaurantName[0]}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{order.restaurantName}</p>
                            <p className="text-xs text-muted-foreground">
                                {order.items.slice(0, 2).map(i => i.name).join(", ")}
                                {order.items.length > 2 ? ` +${order.items.length - 2} more` : ""}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stars */}
                <div className="bg-background border border-border rounded-2xl p-6 shadow-sm space-y-4 text-center">
                    <h2 className="font-bold">How was your experience?</h2>

                    <div className="flex items-center justify-center gap-2 py-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button
                                key={s}
                                onMouseEnter={() => setHovered(s)}
                                onMouseLeave={() => setHovered(0)}
                                onClick={() => setStars(s)}
                                className="transition-transform hover:scale-125 active:scale-110"
                            >
                                <Star
                                    className={`h-10 w-10 transition-colors duration-150 ${s <= displayStars
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-muted-foreground/30"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {displayStars > 0 && (
                        <p className={`text-sm font-semibold transition-all ${displayStars >= 4 ? "text-green-500" :
                            displayStars === 3 ? "text-amber-500" : "text-red-500"
                            }`}>
                            {STAR_LABELS[displayStars]}
                        </p>
                    )}
                </div>

                {/* Message */}
                <div className="bg-background border border-border rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-sm">Your thoughts</h2>
                        <span className="text-xs text-muted-foreground">{message.length}/500</span>
                    </div>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                        placeholder="Tell us what you loved (or didn't love) about this order..."
                        rows={4}
                        className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none placeholder:text-muted-foreground leading-relaxed"
                    />
                    <p className="text-xs text-muted-foreground">Optional — your honest feedback helps other customers</p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={submitting || stars === 0}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold text-base hover:from-orange-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                    {submitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <Send className="h-5 w-5" />
                            Submit Review
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                    Your review will be visible on the restaurant's page
                </p>
            </div>
        </div>
    );
}