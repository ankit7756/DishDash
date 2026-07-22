import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Star, ShieldCheck, Truck } from "lucide-react";
import { getAllRestaurants } from "../../lib/api/food-restaurant-api";
import { getPopularFoods } from "../../lib/api/food-restaurant-api";

export default async function LandingPage() {
    const [restaurants, popularFoods] = await Promise.all([
        getAllRestaurants().catch(() => []),
        getPopularFoods().catch(() => []),
    ]);

    return (
        <div>
            {/* Hero */}
            <section className="bg-primary-50">
                <div className="container py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <span className="badge bg-primary-100 text-primary-dark mb-4">🔥 Order now, eat in 30 minutes</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-secondary leading-tight mb-5">
                            Craving something<br /><span className="text-primary">delicious?</span>
                        </h1>
                        <p className="text-text-muted text-lg mb-8 max-w-md">
                            DishDash brings your favorite local restaurants straight to your door — fast, fresh, and hassle-free.
                        </p>
                        <Link href="/user/restaurants" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
                            Order Now <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden card">
                        <Image
                            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
                            alt="Delicious food spread"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            </section>

            {/* Trust badges */}
            <section className="container py-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { icon: Truck, title: "Fast Delivery", desc: "Average delivery time under 30 minutes" },
                    { icon: ShieldCheck, title: "Secure Payments", desc: "Real Khalti integration, fully verified" },
                    { icon: Clock, title: "Live Order Tracking", desc: "Know exactly where your food is" },
                ].map((item) => (
                    <div key={item.title} className="card p-6 flex items-start gap-4">
                        <div className="h-11 w-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                            <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-secondary">{item.title}</h3>
                            <p className="text-sm text-text-muted mt-0.5">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Popular foods */}
            {popularFoods.length > 0 && (
                <section className="container py-10">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-secondary">Popular right now</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {popularFoods.slice(0, 8).map((food) => (
                            <div key={food._id} className="card card-interactive overflow-hidden">
                                <div className="relative h-32">
                                    <Image src={food.image} alt={food.name} fill className="object-cover" />
                                </div>
                                <div className="p-3">
                                    <p className="font-semibold text-sm text-secondary truncate">{food.name}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-primary font-bold text-sm">Rs. {food.price}</span>
                                        <span className="flex items-center gap-0.5 text-xs text-text-muted">
                                            <Star className="h-3 w-3 fill-warning text-warning" /> {food.rating}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Restaurants */}
            <section className="container py-10 pb-20">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-secondary">Restaurants near you</h2>
                    <Link href="/user/restaurants" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                        View all <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.slice(0, 6).map((r) => (
                        <Link key={r._id} href={`/user/restaurants/${r._id}`} className="card card-interactive overflow-hidden block">
                            <div className="relative h-40">
                                <Image src={r.image} alt={r.name} fill className="object-cover" />
                                {!r.isOpen && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">Currently Closed</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-secondary">{r.name}</h3>
                                <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{r.categories?.join(" • ")}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {r.rating}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {r.deliveryTime}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}