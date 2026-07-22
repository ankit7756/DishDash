"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, UtensilsCrossed, MessageSquare, ChevronRight, Loader2 } from "lucide-react";
import { getMyReviews, Review } from "@/lib/api/order-api";

function StarDisplay({ stars, size = "sm" }: { stars: number; size?: "sm" | "lg" }) {
    const cls = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`${cls} ${s <= stars ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25"}`} />
            ))}
        </div>
    );
}

const STAR_LABELS: Record<number, { label: string; color: string }> = {
    1: { label: "Terrible", color: "text-red-500" },
    2: { label: "Bad", color: "text-orange-500" },
    3: { label: "Okay", color: "text-amber-500" },
    4: { label: "Good", color: "text-lime-600" },
    5: { label: "Excellent!", color: "text-green-600" },
};

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-NP", {
        year: "numeric", month: "short", day: "numeric"
    });
}

function ReviewCard({ review }: { review: Review }) {
    const rating = STAR_LABELS[review.stars] ?? STAR_LABELS[3];

    return (
        <Link href={`/user/orders/${review.orderId}`}
            className="group block bg-background border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-200">

            {/* Color accent strip */}
            <div className={`h-1 w-full ${review.stars >= 4 ? "bg-green-500" :
                review.stars === 3 ? "bg-amber-400" : "bg-red-400"
                }`} />

            <div className="p-5 space-y-4">
                {/* Header: restaurant + date */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {review.restaurantName[0]}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm truncate">{review.restaurantName}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <StarDisplay stars={review.stars} />
                    </div>
                </div>

                {/* Star label */}
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${rating.color}`}>{rating.label}</span>
                    <span className="text-muted-foreground/50 text-xs">·</span>
                    <span className="text-xs text-muted-foreground">{review.stars}/5 stars</span>
                </div>

                {/* Message */}
                {review.message ? (
                    <div className="bg-muted/40 rounded-xl px-4 py-3">
                        <div className="flex gap-2 items-start">
                            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-foreground/70 leading-relaxed italic line-clamp-3">
                                "{review.message}"
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground italic">No message added.</p>
                )}

                {/* Food items */}
                {review.foodItems && review.foodItems.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {review.foodItems.slice(0, 4).map((item, i) => (
                            <span key={i} className="text-xs bg-muted px-2.5 py-1 rounded-full text-foreground/60">
                                {item}
                            </span>
                        ))}
                        {review.foodItems.length > 4 && (
                            <span className="text-xs bg-muted px-2.5 py-1 rounded-full text-foreground/60">
                                +{review.foodItems.length - 4} more
                            </span>
                        )}
                    </div>
                )}

                {/* View order link hint */}
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">Tap to view order</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                </div>
            </div>
        </Link>
    );
}

// Summary stats
function StatsBar({ reviews }: { reviews: Review[] }) {
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((s, r) => s + r.stars, 0) / reviews.length;
    const counts = [5, 4, 3, 2, 1].map((s) => ({
        star: s,
        count: reviews.filter((r) => r.stars === s).length,
    }));

    return (
        <div className="bg-background border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-6">
                {/* Average */}
                <div className="text-center flex-shrink-0">
                    <p className="text-4xl font-extrabold text-orange-500">{avg.toFixed(1)}</p>
                    <StarDisplay stars={Math.round(avg)} size="lg" />
                    <p className="text-xs text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                </div>

                {/* Bar breakdown */}
                <div className="flex-1 space-y-1.5">
                    {counts.map(({ star, count }) => {
                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                            <div key={star} className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-3">{star}</span>
                                <Star className="h-3 w-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full bg-amber-400 rounded-full transition-all duration-700"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground w-4 text-right">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyReviews()
            .then(setReviews)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-muted/30 pb-12">

            {/* Header */}
            <div className="bg-gradient-to-br from-orange-500 to-pink-600 py-10">
                <div className="mx-auto max-w-2xl px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Star className="h-5 w-5 text-white fill-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold text-white">My Reviews</h1>
                            <p className="text-white/70 text-sm">Your feedback on past orders</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-2xl px-4 sm:px-6 mt-6 space-y-4">

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="h-20 w-20 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto">
                            <Star className="h-10 w-10 text-orange-300" />
                        </div>
                        <h3 className="text-xl font-semibold">No reviews yet</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                            After your orders are delivered, share your experience to help other customers.
                        </p>
                        <Link href="/user/orders"
                            className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white text-sm font-bold hover:from-orange-600 hover:to-pink-700 transition-all">
                            <UtensilsCrossed className="h-4 w-4" />
                            View Orders
                        </Link>
                    </div>
                ) : (
                    <>
                        <StatsBar reviews={reviews} />
                        <div className="space-y-3">
                            {reviews.map((review) => (
                                <ReviewCard key={review._id} review={review} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}