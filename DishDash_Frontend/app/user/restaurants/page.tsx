"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, Clock, Truck, ChevronRight, X, SlidersHorizontal } from "lucide-react";
import { getAllRestaurants, Restaurant } from "@/lib/api/food-restaurant-api";

const CATEGORIES = ["All", "Pizza", "Burger", "Momo", "Noodles", "Sushi", "Korean", "Nepali", "Thakali", "BBQ", "Cafe", "Chicken"];

const SORT_OPTIONS = [
    { value: "rating", label: "Top Rated" },
    { value: "deliveryFee", label: "Lowest Fee" },
    { value: "deliveryTime", label: "Fastest" },
];

export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("rating");

    useEffect(() => {
        getAllRestaurants()
            .then(setRestaurants)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = restaurants
        .filter((r) => {
            const matchSearch =
                search === "" ||
                r.name.toLowerCase().includes(search.toLowerCase()) ||
                r.categories.some((c) => c.toLowerCase().includes(search.toLowerCase())) ||
                r.description.toLowerCase().includes(search.toLowerCase());
            const matchCategory =
                selectedCategory === "All" ||
                r.categories.some((c) => c.toLowerCase().includes(selectedCategory.toLowerCase()));
            return matchSearch && matchCategory;
        })
        .sort((a, b) => {
            if (sortBy === "rating") return b.rating - a.rating;
            if (sortBy === "deliveryFee") return a.deliveryFee - b.deliveryFee;
            if (sortBy === "deliveryTime") return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
            return 0;
        });

    return (
        <div className="min-h-screen bg-background">

            {/* ── Page Header ── */}
            <div className="bg-gradient-to-br from-orange-500 to-pink-600 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                        All Restaurants
                    </h1>
                    <p className="text-white/75 mb-6">
                        {restaurants.length} restaurants delivering near you
                    </p>

                    {/* Search bar */}
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search restaurants, cuisines..."
                            className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-background border-0 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

                {/* ── Filters row ── */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Category chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === cat
                                        ? "bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/30"
                                        : "bg-muted text-foreground/60 hover:text-foreground hover:bg-muted/80"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="text-sm bg-muted border-0 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results count */}
                {search || selectedCategory !== "All" ? (
                    <p className="text-sm text-muted-foreground mb-4">
                        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                        {search && ` for "${search}"`}
                        {selectedCategory !== "All" && ` in ${selectedCategory}`}
                    </p>
                ) : null}

                {/* ── Restaurant Grid ── */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-muted rounded-2xl h-72 animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 space-y-3">
                        <p className="text-5xl">🔍</p>
                        <h3 className="text-xl font-semibold">No restaurants found</h3>
                        <p className="text-muted-foreground text-sm">Try a different search or category</p>
                        <button
                            onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                            className="mt-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filtered.map((r) => (
                            <RestaurantCard key={r._id} restaurant={r} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
    return (
        <Link
            href={`/user/restaurants/${r._id}`}
            className="group bg-background border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-300"
        >
            {/* Image */}
            <div className="relative h-44 overflow-hidden bg-muted">
                <Image
                    src={r.image}
                    alt={r.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Open/closed badge */}
                <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${r.isOpen
                            ? "bg-green-500/90 text-white"
                            : "bg-red-500/90 text-white"
                        }`}>
                        {r.isOpen ? "Open" : "Closed"}
                    </span>
                </div>
                {/* Rating badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold">{r.rating}</span>
                </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="font-bold text-base leading-tight">{r.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {r.categories.join(" · ")}
                    </p>
                </div>

                <p className="text-xs text-foreground/70 line-clamp-2 leading-relaxed">
                    {r.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-orange-500" />
                            {r.deliveryTime}
                        </span>
                        <span className="flex items-center gap-1">
                            <Truck className="h-3.5 w-3.5 text-orange-500" />
                            Rs. {r.deliveryFee}
                        </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                </div>
            </div>
        </Link>
    );
}