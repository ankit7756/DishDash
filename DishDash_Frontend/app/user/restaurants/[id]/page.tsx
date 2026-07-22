import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Clock, Truck, Phone, MapPin, ChevronLeft, Flame } from "lucide-react";
import { getRestaurantById, getFoodsByRestaurant, Food } from "@/lib/api/food-restaurant-api";

export default async function RestaurantDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let restaurant;
    let foods: Food[] = [];

    try {
        [restaurant, foods] = await Promise.all([
            getRestaurantById(id),
            getFoodsByRestaurant(id),
        ]);
    } catch {
        notFound();
    }

    // Group foods by category
    const grouped = foods.reduce<Record<string, Food[]>>((acc, food) => {
        if (!acc[food.category]) acc[food.category] = [];
        acc[food.category].push(food);
        return acc;
    }, {});

    const categories = Object.keys(grouped);

    return (
        <div className="min-h-screen bg-background">

            {/* ── Hero image ── */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden bg-muted">
                <Image
                    src={restaurant.image}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Back button */}
                <Link
                    href="/user/restaurants"
                    className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background/80 backdrop-blur-sm text-sm font-medium hover:bg-background transition-all"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Link>

                {/* Restaurant name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-white/80 text-sm font-medium mb-1">
                                {restaurant.categories.join(" · ")}
                            </p>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                                {restaurant.name}
                            </h1>
                        </div>
                        <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold ${restaurant.isOpen
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                            }`}>
                            {restaurant.isOpen ? "Open Now" : "Closed"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                {/* ── Info bar ── */}
                <div className="bg-background border border-border rounded-2xl shadow-sm -mt-4 relative z-10 mx-0 md:mx-4 p-5 mb-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Rating</p>
                                <p className="font-bold text-sm">{restaurant.rating} / 5</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                                <Clock className="h-4 w-4 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Delivery Time</p>
                                <p className="font-bold text-sm">{restaurant.deliveryTime}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                                <Truck className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Delivery Fee</p>
                                <p className="font-bold text-sm">Rs. {restaurant.deliveryFee}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                                <Phone className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="font-bold text-sm">{restaurant.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address + description */}
                    <div className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row gap-3 justify-between">
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                            {restaurant.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-shrink-0">
                            <MapPin className="h-4 w-4 text-orange-500" />
                            {restaurant.address}
                        </div>
                    </div>
                </div>

                {/* ── Menu ── */}
                <div className="pb-12">
                    <h2 className="text-2xl font-bold mb-6">
                        Menu
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                            ({foods.length} items)
                        </span>
                    </h2>

                    {foods.length === 0 ? (
                        <div className="text-center py-20 space-y-3">
                            <p className="text-5xl">🍽️</p>
                            <h3 className="text-xl font-semibold">No menu items yet</h3>
                            <p className="text-muted-foreground text-sm">Check back soon!</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {categories.map((category) => (
                                <div key={category}>
                                    {/* Category heading */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <h3 className="text-lg font-bold">{category}</h3>
                                        <div className="flex-1 h-px bg-border" />
                                        <span className="text-xs text-muted-foreground">
                                            {grouped[category].length} item{grouped[category].length !== 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    {/* Food items */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {grouped[category].map((food) => (
                                            <FoodMenuItem key={food._id} food={food} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function FoodMenuItem({ food }: { food: Food }) {
    return (
        <Link
            href={`/user/food/${food._id}`}
            className="group flex gap-4 bg-background border border-border rounded-2xl p-4 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-300"
        >
            {/* Image */}
            <div className="relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                <Image
                    src={food.image}
                    alt={food.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {food.isPopular && (
                    <div className="absolute top-1 left-1">
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-500 text-white text-[9px] font-bold">
                            <Flame className="h-2.5 w-2.5" />
                        </span>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm leading-tight line-clamp-1">
                            {food.name}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-medium">{food.rating}</span>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {food.description}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-base font-bold text-orange-500">
                        Rs. {food.price}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        Add +
                    </span>
                </div>
            </div>
        </Link>
    );
}