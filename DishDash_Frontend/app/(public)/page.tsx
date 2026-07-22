import Link from "next/link";
import { ArrowRight, Star, Clock, ShieldCheck, ChevronRight } from "lucide-react";

// Static featured restaurants (will be replaced with API data in user dashboard)
const FEATURED_RESTAURANTS = [
    { name: "Burger Palace", cuisine: "American", rating: 4.8, time: "25-30 min", fee: "Rs. 50", image: "🍔", color: "from-yellow-400 to-orange-400" },
    { name: "Pizza Heaven", cuisine: "Italian", rating: 4.7, time: "30-40 min", fee: "Rs. 60", image: "🍕", color: "from-red-400 to-pink-400" },
    { name: "Momo Corner", cuisine: "Nepali", rating: 4.9, time: "20-25 min", fee: "Rs. 40", image: "🥟", color: "from-orange-400 to-amber-400" },
    { name: "Sushi World", cuisine: "Japanese", rating: 4.6, time: "35-45 min", fee: "Rs. 80", image: "🍱", color: "from-green-400 to-teal-400" },
    { name: "Thakali House", cuisine: "Nepali", rating: 4.8, time: "20-30 min", fee: "Rs. 45", image: "🍛", color: "from-amber-400 to-yellow-400" },
    { name: "Noodle Bar", cuisine: "Chinese", rating: 4.5, time: "25-35 min", fee: "Rs. 55", image: "🍜", color: "from-pink-400 to-rose-400" },
];

const STEPS = [
    { step: "01", icon: "🍽️", title: "Choose a Restaurant", desc: "Browse hundreds of restaurants and menus near you" },
    { step: "02", icon: "🛒", title: "Pick Your Food", desc: "Add your favorite dishes to cart with a single tap" },
    { step: "03", icon: "🚀", title: "Fast Delivery", desc: "Your hot food arrives at your door in under 30 minutes" },
];

const TESTIMONIALS = [
    { name: "Aarav Sharma", role: "Regular Customer", review: "Best food delivery app I've used. Fast, reliable, and amazing variety!", rating: 5, avatar: "AS" },
    { name: "Priya Thapa", role: "Food Enthusiast", review: "The momos from Momo Corner delivered in 20 minutes. Still hot and delicious!", rating: 5, avatar: "PT" },
    { name: "Rajan KC", role: "Daily User", review: "Khalti payment integration makes it so easy. Ordering lunch every day now!", rating: 5, avatar: "RK" },
];

export default function HomePage() {
    return (
        <div className="overflow-x-hidden">

            {/* ── Hero ── */}
            <section className="relative min-h-[92vh] flex items-center">
                {/* Background blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/50">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Now delivering in Kathmandu</span>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
                                    Delicious
                                    <span className="block bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
                                        Food Delivered
                                    </span>
                                    <span className="block">Fast. 🚀</span>
                                </h1>
                                <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                                    Order from your favorite local restaurants and get hot, fresh food delivered straight to your door.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold text-base shadow-lg shadow-orange-200 dark:shadow-orange-900/30 hover:from-orange-600 hover:to-pink-700 hover:shadow-xl transition-all duration-200 group"
                                >
                                    Order Now
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                                <Link
                                    href="/about"
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-border bg-background/80 font-semibold text-base hover:bg-accent transition-all duration-200"
                                >
                                    Learn More
                                </Link>
                            </div>

                            {/* Trust badges */}
                            <div className="flex flex-wrap gap-5 pt-2">
                                {[
                                    { icon: <Star className="h-4 w-4 text-orange-500" />, text: "4.8★ Rating" },
                                    { icon: <Clock className="h-4 w-4 text-orange-500" />, text: "30 min avg delivery" },
                                    { icon: <ShieldCheck className="h-4 w-4 text-orange-500" />, text: "Secure payment" },
                                ].map((badge) => (
                                    <div key={badge.text} className="flex items-center gap-1.5 text-sm font-medium text-foreground/70">
                                        {badge.icon}
                                        {badge.text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — visual food grid */}
                        <div className="relative hidden lg:flex items-center justify-center">
                            <div className="grid grid-cols-3 gap-4 transform rotate-3">
                                {["🍕", "🍔", "🥟", "🍜", "🍱", "🍛", "🥗", "🍩", "🧆"].map((emoji, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-center w-24 h-24 rounded-2xl text-4xl shadow-md hover:scale-110 transition-transform cursor-default
                      ${i % 3 === 0 ? "bg-orange-50 dark:bg-orange-900/20" : i % 3 === 1 ? "bg-pink-50 dark:bg-pink-900/20" : "bg-amber-50 dark:bg-amber-900/20"}
                      ${i === 4 ? "scale-110 ring-2 ring-orange-400 ring-offset-2" : ""}
                    `}
                                    >
                                        {emoji}
                                    </div>
                                ))}
                            </div>
                            {/* Floating card */}
                            <div className="absolute -bottom-4 -left-8 bg-background rounded-2xl shadow-xl border border-border p-4 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl">🛵</div>
                                <div>
                                    <p className="text-xs font-semibold">On the way!</p>
                                    <p className="text-xs text-muted-foreground">Arrives in 12 min</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Featured Restaurants ── */}
            <section className="py-20 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-bold">Popular Restaurants</h2>
                            <p className="text-muted-foreground mt-1 text-sm">Top picks loved by our customers</p>
                        </div>
                        <Link
                            href="/login"
                            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                        >
                            View all <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {FEATURED_RESTAURANTS.map((r) => (
                            <Link
                                href="/login"
                                key={r.name}
                                className="group bg-background border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-300"
                            >
                                {/* Card image area */}
                                <div className={`h-36 bg-gradient-to-br ${r.color} flex items-center justify-center text-6xl relative`}>
                                    <span className="group-hover:scale-110 transition-transform duration-300">{r.image}</span>
                                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-semibold">{r.rating}</span>
                                    </div>
                                </div>
                                {/* Card info */}
                                <div className="p-4 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-sm">{r.name}</h3>
                                            <p className="text-xs text-muted-foreground">{r.cuisine}</p>
                                        </div>
                                        <span className="inline-block px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium">Open</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.time}</span>
                                        <span>·</span>
                                        <span>Delivery {r.fee}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold">How It Works</h2>
                        <p className="text-muted-foreground mt-2">Order your favourite food in 3 simple steps</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-14 left-[22%] right-[22%] h-px bg-gradient-to-r from-orange-200 via-pink-200 to-orange-200 dark:from-orange-800/50 dark:via-pink-800/50 dark:to-orange-800/50" />

                        {STEPS.map((step, i) => (
                            <div key={i} className="flex flex-col items-center text-center space-y-4 relative">
                                <div className="relative flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-100 dark:border-orange-800/30 shadow-sm">
                                    <span className="text-4xl">{step.icon}</span>
                                    <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                                        {step.step}
                                    </span>
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-lg font-semibold">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="py-20 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold">What Our Customers Say</h2>
                        <p className="text-muted-foreground mt-2">Thousands of happy customers, every day</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t) => (
                            <div key={t.name} className="bg-background border border-border rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: t.rating }).map((_, i) => (
                                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed">"{t.review}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-500 to-pink-600 p-10 md:p-16 text-white text-center">
                        {/* Background circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                        <div className="relative space-y-6">
                            <div className="text-5xl">🍕</div>
                            <h2 className="text-3xl md:text-4xl font-extrabold">Hungry? Let's Fix That.</h2>
                            <p className="text-lg text-white/80 max-w-md mx-auto">
                                Join thousands of food lovers on Foodify. Sign up free and get your first order today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-orange-600 font-semibold hover:bg-orange-50 shadow-lg transition-all group"
                                >
                                    Get Started Free
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
                                >
                                    Log in
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}