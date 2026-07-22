"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight, Loader2, MessageSquare } from "lucide-react";
import { adminGetReviews } from "@/lib/api/admin-api";

function StarRow({ stars }: { stars: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-3 w-3 ${s <= stars ? "fill-amber-400 text-amber-400" : "text-white/10"}`} />
            ))}
        </div>
    );
}

const STAR_META: Record<number, { label: string; color: string; bar: string }> = {
    1: { label: "Terrible", color: "text-red-400", bar: "bg-red-400" },
    2: { label: "Bad", color: "text-orange-400", bar: "bg-orange-400" },
    3: { label: "Okay", color: "text-amber-400", bar: "bg-amber-400" },
    4: { label: "Good", color: "text-lime-400", bar: "bg-lime-400" },
    5: { label: "Excellent", color: "text-emerald-400", bar: "bg-emerald-400" },
};

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });
    const [loading, setLoading] = useState(true);

    const fetchReviews = async (page = 1) => {
        setLoading(true);
        try {
            const res = await adminGetReviews(String(page), "12");
            setReviews(res.data ?? []);
            setPagination(res.pagination ?? { page: 1, totalPages: 1, totalItems: 0 });
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchReviews(1); }, []);

    const avgRating = reviews.length > 0
        ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)
        : "—";

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white tracking-tight">Reviews</h1>
                    <p className="text-[13px] text-white/30 mt-0.5">All customer reviews across the platform</p>
                </div>

                {/* Stat pills */}
                <div className="flex items-center gap-2">
                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-center min-w-[80px]">
                        <p className="text-xl font-bold text-amber-400">{avgRating}</p>
                        <p className="text-[10px] text-white/25 font-medium uppercase tracking-widest mt-0.5">Avg</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3 text-center min-w-[80px]">
                        <p className="text-xl font-bold text-white/80">{pagination.totalItems}</p>
                        <p className="text-[10px] text-white/25 font-medium uppercase tracking-widest mt-0.5">Total</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="h-5 w-5 animate-spin text-amber-400/60" />
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-24 space-y-3">
                    <Star className="h-10 w-10 text-white/10 mx-auto" />
                    <p className="text-white/20 text-[13px]">No reviews yet</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {reviews.map((review) => {
                            const meta = STAR_META[review.stars] ?? STAR_META[3];
                            return (
                                <div key={review._id}
                                    className="bg-white/[0.03] border border-white/[0.07] rounded-xl overflow-hidden hover:bg-white/[0.05] transition-colors">

                                    {/* Rating bar top */}
                                    <div className={`h-0.5 w-full ${meta.bar} opacity-60`} />

                                    <div className="p-4 space-y-3">
                                        {/* User + stars */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-amber-600 flex-shrink-0 flex items-center justify-center text-[#0a0c12] text-[11px] font-black">
                                                    {review.userId?.profileImage ? (
                                                        <Image src={review.userId.profileImage} alt="" width={32} height={32} unoptimized className="object-cover w-full h-full" />
                                                    ) : (
                                                        review.userId?.fullName?.[0]?.toUpperCase() ?? "U"
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[13px] font-semibold text-white/80 truncate">{review.userId?.fullName ?? "Anonymous"}</p>
                                                    <p className="text-[10px] text-white/25 truncate">@{review.userId?.username ?? "user"}</p>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <StarRow stars={review.stars} />
                                            </div>
                                        </div>

                                        {/* Restaurant */}
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 rounded bg-amber-400/10 flex items-center justify-center text-amber-400 text-[9px] font-black flex-shrink-0">
                                                {review.restaurantName?.[0]}
                                            </div>
                                            <p className="text-[11px] text-white/30 truncate">{review.restaurantName}</p>
                                            <span className={`ml-auto text-[10px] font-bold ${meta.color} flex-shrink-0`}>{meta.label}</span>
                                        </div>

                                        {/* Message */}
                                        {review.message ? (
                                            <div className="bg-white/[0.03] border border-white/[0.05] rounded-lg px-3 py-2.5">
                                                <div className="flex gap-2 items-start">
                                                    <MessageSquare className="h-3 w-3 text-white/15 flex-shrink-0 mt-0.5" />
                                                    <p className="text-[12px] text-white/45 leading-relaxed italic line-clamp-3">"{review.message}"</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-white/15 italic">No message left</p>
                                        )}

                                        {/* Food items */}
                                        {review.foodItems?.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {review.foodItems.slice(0, 3).map((item: string, i: number) => (
                                                    <span key={i} className="text-[10px] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded text-white/30">{item}</span>
                                                ))}
                                                {review.foodItems.length > 3 && (
                                                    <span className="text-[10px] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded text-white/25">+{review.foodItems.length - 3}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Date */}
                                        <p className="text-[10px] text-white/15 pt-1 border-t border-white/[0.05]">
                                            {new Date(review.createdAt).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1 pt-2">
                            <button onClick={() => fetchReviews(pagination.page - 1)} disabled={pagination.page === 1}
                                className="p-1.5 rounded-md text-white/25 hover:text-white/70 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </button>
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                                <button key={p} onClick={() => fetchReviews(p)}
                                    className={`h-7 w-7 rounded-md text-[12px] font-semibold transition-all ${p === pagination.page ? "bg-amber-400 text-[#0a0c12]" : "text-white/30 hover:text-white/70 hover:bg-white/[0.06]"}`}>
                                    {p}
                                </button>
                            ))}
                            <button onClick={() => fetchReviews(pagination.page + 1)} disabled={pagination.page === pagination.totalPages}
                                className="p-1.5 rounded-md text-white/25 hover:text-white/70 hover:bg-white/[0.06] disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                                <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}