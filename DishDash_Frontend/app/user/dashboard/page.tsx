import Link from "next/link";
import Image from "next/image";
import { Star, Clock, ArrowRight, ChevronRight, Flame, Truck } from "lucide-react";
import { getAllFoods, getPopularFoods, getAllRestaurants, Food, Restaurant } from "@/lib/api/food-restaurant-api";
// ── Category chips ──────────────────────────────────────────────
const CATEGORIES = [
    { emoji: "🍽️", label: "All" },
    { emoji: "🍕", label: "Pizza" },
    { emoji: "🍔", label: "Burger" },
    { emoji: "🥟", label: "Momo" },
    { emoji: "🍜", label: "Noodles" },
    { emoji: "🍱", label: "Sushi" },
    { emoji: "🍗", label: "Chicken" },
    { emoji: "🔥", label: "BBQ" },
    { emoji: "🍰", label: "Dessert" },
    { emoji: "☕", label: "Coffee" },
];

// ── Promo banners (static marketing content) ────────────────────
const PROMOS = [
    { tag: "LIMITED TIME", title: "50% OFF", sub: "On your first Khalti payment", emoji: "💳", from: "from-violet-600", to: "to-purple-500" },
    { tag: "THIS WEEK", title: "FREE DELIVERY", sub: "On orders above Rs. 500", emoji: "🛵", from: "from-orange-500", to: "to-amber-400" },
    { tag: "TODAY ONLY", title: "BUY 1 GET 1", sub: "On all momo orders today", emoji: "🥟", from: "from-emerald-500", to: "to-teal-400" },
];

// ── Helper components ────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                />
            ))}
        </div>
    );
}

function FoodCard({ food }: { food: Food }) {
    const restaurant = typeof food.restaurantId === "object" ? food.restaurantId : null;
    return (
        <Link
            href={`/user/food/${food._id}`}
            className="group bg-background border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-300"
        >
            <div className="relative h-44 overflow-hidden bg-muted">
                <Image
                    src={food.image}
                    alt={food.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {food.isPopular && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                        <Flame className="h-2.5 w-2.5" /> Popular
                    </span>
                )}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold">{food.rating}</span>
                </div>
            </div>
            <div className="p-3 space-y-1.5">
                <h3 className="font-semibold text-sm leading-tight line-clamp-1">{food.name}</h3>
                {restaurant && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{restaurant.name}</p>
                )}
                <div className="flex items-center justify-between pt-1">
                    <StarRating rating={food.rating} />
                    <span className="text-sm font-bold text-orange-500">Rs. {food.price}</span>
                </div>
                <span className="inline-block text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {food.category}
                </span>
            </div>
        </Link>
    );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
    return (
        <Link
            href={`/user/restaurants/${restaurant._id}`}
            className="group flex gap-4 bg-background border border-border rounded-2xl p-4 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-300"
        >
            <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight">{restaurant.name}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${restaurant.isOpen ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-red-50 text-red-500"}`}>
                        {restaurant.isOpen ? "Open" : "Closed"}
                    </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                    {restaurant.categories.join(" · ")}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        {restaurant.rating}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {restaurant.deliveryTime}
                    </span>
                    <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Rs. {restaurant.deliveryFee}
                    </span>
                </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground self-center flex-shrink-0 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
        </Link>
    );
}

// ── Page ─────────────────────────────────────────────────────────
export default async function DashboardPage() {
    let popularFoods: Food[] = [];
    let allFoods: Food[] = [];
    let restaurants: Restaurant[] = [];

    try {
        [popularFoods, allFoods, restaurants] = await Promise.all([
            getPopularFoods(),
            getAllFoods(),
            getAllRestaurants(),
        ]);
    } catch {
        // Will show empty states — API might be offline
    }

    // Combo foods = popular foods priced above 800
    const comboFoods = allFoods.filter(f => f.price > 800).slice(0, 6);

    return (
        <div className="min-h-screen">

            {/* ── Hero Banner ──────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-pink-600">
                {/* Decorative circles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/10 rounded-full" />
                    <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="text-white space-y-5">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                Now delivering in Kathmandu
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                                Hungry? We've<br />got you covered 🍕
                            </h1>
                            <p className="text-white/80 text-base max-w-sm leading-relaxed">
                                Order from {restaurants.length}+ restaurants and get hot fresh food at your door in minutes.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/user/restaurants"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-orange-600 font-semibold hover:bg-orange-50 shadow-md transition-all group"
                                >
                                    Browse Restaurants
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                                <Link
                                    href="#menu"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-all"
                                >
                                    View Menu
                                </Link>
                            </div>
                            {/* Quick stats */}
                            <div className="flex gap-6 pt-2">
                                {[
                                    { value: `${restaurants.length}+`, label: "Restaurants" },
                                    { value: `${allFoods.length}+`, label: "Menu Items" },
                                    { value: "30 min", label: "Avg Delivery" },
                                ].map((s) => (
                                    <div key={s.label} className="text-center">
                                        <p className="text-xl font-bold">{s.value}</p>
                                        <p className="text-white/70 text-xs">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right side food emoji grid — decorative */}
                        <div className="hidden md:flex justify-center items-center">
                            <div className="grid grid-cols-3 gap-4">
                                {["🍕", "🍔", "🥟", "🍜", "🍱", "🍛", "🥗", "🍩", "☕"].map((e, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm text-4xl hover:scale-110 transition-transform cursor-default ${i === 4 ? "scale-110 ring-2 ring-white/60 ring-offset-2 ring-offset-transparent" : ""}`}
                                    >
                                        {e}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Promo Banners ────────────────────────────────────────── */}
            <section className="py-10 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {PROMOS.map((p) => (
                            <div
                                key={p.title}
                                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${p.from} ${p.to} p-5 text-white flex items-center justify-between`}
                            >
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                                        {p.tag}
                                    </span>
                                    <p className="text-xl font-extrabold">{p.title}</p>
                                    <p className="text-xs text-white/80">{p.sub}</p>
                                </div>
                                <span className="text-5xl">{p.emoji}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Explore Menu (Category circles) ─────────────────────── */}
            <section id="menu" className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold">Explore Our Menu</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">What are you craving today?</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.label}
                                href={`/user/restaurants?category=${cat.label}`}
                                className="group flex flex-col items-center gap-2"
                            >
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-50 dark:bg-orange-900/20 border-2 border-transparent hover:border-orange-400 flex items-center justify-center text-2xl sm:text-3xl group-hover:scale-110 transition-all duration-200 shadow-sm">
                                    {cat.emoji}
                                </div>
                                <span className="text-xs font-medium text-foreground/70 group-hover:text-orange-500 transition-colors text-center leading-tight">
                                    {cat.label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Popular Foods ─────────────────────────────────────────── */}
            <section className="py-10 bg-muted/20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">⭐ Popular Foods</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Most loved by our customers</p>
                        </div>
                        <Link
                            href="/user/restaurants"
                            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                        >
                            See all <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {popularFoods.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <p className="text-4xl mb-3">🍽️</p>
                            <p>No foods available right now. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {popularFoods.slice(0, 12).map((food) => (
                                <FoodCard key={food._id} food={food} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Hot Combos ───────────────────────────────────────────── */}
            {comboFoods.length > 0 && (
                <section className="py-10">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">🍱 Hot Combos</h2>
                                <p className="text-sm text-muted-foreground mt-0.5">Best value deals for you</p>
                            </div>
                            <span className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                                🔥 Trending
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {comboFoods.map((food) => (
                                <Link
                                    key={food._id}
                                    href={`/user/food/${food._id}`}
                                    className="group bg-background border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all"
                                >
                                    <div className="relative h-32 overflow-hidden bg-muted">
                                        <Image
                                            src={food.image}
                                            alt={food.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                                            COMBO
                                        </span>
                                    </div>
                                    <div className="p-2.5 space-y-1">
                                        <p className="text-xs font-semibold line-clamp-1">{food.name}</p>
                                        <p className="text-xs font-bold text-orange-500">Rs. {food.price}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── All Foods Grid ────────────────────────────────────────── */}
            <section className="py-10 bg-muted/20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">🍽️ All Dishes</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">{allFoods.length} items available</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {allFoods.map((food) => (
                            <FoodCard key={food._id} food={food} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Top Restaurants ───────────────────────────────────────── */}
            <section className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">🏪 Top Restaurants</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Discover the best places near you</p>
                        </div>
                        <Link
                            href="/user/restaurants"
                            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                        >
                            View all <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {restaurants.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <p className="text-4xl mb-3">🏪</p>
                            <p>No restaurants available right now.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {restaurants.map((r) => (
                                <RestaurantCard key={r._id} restaurant={r} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Why Foodify strip ─────────────────────────────────────── */}
            <section className="py-10 bg-gradient-to-r from-orange-500 to-pink-600">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-white text-center">
                        {[
                            { emoji: "⚡", title: "Fast Delivery", desc: "Hot food in 30 minutes" },
                            { emoji: "🔒", title: "Secure Payment", desc: "Cash or Khalti — your choice" },
                            { emoji: "⭐", title: "Top Rated", desc: "Only the best restaurants" },
                        ].map((item) => (
                            <div key={item.title} className="space-y-1">
                                <p className="text-3xl">{item.emoji}</p>
                                <p className="font-bold">{item.title}</p>
                                <p className="text-white/75 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}