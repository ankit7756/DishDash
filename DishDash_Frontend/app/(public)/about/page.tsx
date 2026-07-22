import Link from "next/link";
import { ArrowRight, Zap, UtensilsCrossed, CreditCard, Users, Store, Star } from "lucide-react";

const FEATURES = [
    { icon: <Zap className="h-6 w-6" />, title: "Lightning Fast Delivery", desc: "Hot food at your door in under 30 minutes, every time." },
    { icon: <UtensilsCrossed className="h-6 w-6" />, title: "Wide Variety", desc: "From pizza to momos — something for every craving." },
    { icon: <CreditCard className="h-6 w-6" />, title: "Easy Payments", desc: "Pay with cash or Khalti — fast, safe, and convenient." },
];

const STATS = [
    { icon: <Store className="h-5 w-5" />, value: "500+", label: "Partner Restaurants" },
    { icon: <Users className="h-5 w-5" />, value: "50K+", label: "Happy Customers" },
    { icon: <Star className="h-5 w-5" />, value: "4.8★", label: "Average Rating" },
    { icon: <Zap className="h-5 w-5" />, value: "25 min", label: "Avg Delivery Time" },
];

export default function AboutPage() {
    return (
        <div className="overflow-x-hidden">

            {/* ── Hero ── */}
            <section className="relative py-24 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                </div>
                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/50">
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">Our Story</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                        We're on a mission to{" "}
                        <span className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">
                            feed the world
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Foodify connects hungry people with amazing local restaurants. We believe great food brings people together — and we make that happen, fast.
                    </p>
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="py-12 bg-muted/30 border-y border-border/50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {STATS.map((stat) => (
                            <div key={stat.label} className="text-center space-y-2">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 mx-auto">
                                    {stat.icon}
                                </div>
                                <p className="text-3xl font-extrabold">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Mission ── */}
            <section className="py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold">Our Mission</h2>
                            <p className="text-muted-foreground leading-relaxed text-base">
                                At Foodify, we believe that great food should be accessible to everyone. We're passionate about connecting customers with amazing local eateries, making food delivery fast, reliable, and genuinely delightful.
                            </p>
                            <p className="text-muted-foreground leading-relaxed text-base">
                                We partner with the best local restaurants in Kathmandu to bring their most loved dishes directly to your doorstep — hot, fresh, and on time.
                            </p>
                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold hover:from-orange-600 hover:to-pink-700 shadow-md transition-all group"
                            >
                                Start Ordering <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {["🍔", "🥟", "🍕", "🍜"].map((emoji, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center justify-center rounded-2xl text-6xl p-8 ${i % 2 === 0 ? "bg-orange-50 dark:bg-orange-900/20" : "bg-pink-50 dark:bg-pink-900/20"
                                        } ${i === 1 ? "mt-6" : ""} ${i === 3 ? "-mt-6" : ""}`}
                                >
                                    {emoji}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Why Foodify ── */}
            <section className="py-20 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold">Why Choose Foodify?</h2>
                        <p className="text-muted-foreground mt-2">Everything you need for a perfect food delivery experience</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {FEATURES.map((f) => (
                            <div key={f.title} className="bg-background border border-border rounded-2xl p-8 space-y-4 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-semibold">{f.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-20">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <h2 className="text-3xl font-bold">Ready to explore amazing food?</h2>
                    <p className="text-muted-foreground">Join thousands of happy customers and order your first meal today.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/register"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-pink-700 transition-all group"
                        >
                            Get Started <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-border bg-background font-semibold hover:bg-accent transition-all"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}