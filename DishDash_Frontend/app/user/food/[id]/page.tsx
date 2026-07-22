import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Clock, Truck, ChevronLeft, Flame } from "lucide-react";
import { getFoodById, Food } from "@/lib/api/food-restaurant-api";
import AddToCartSection from "./_components/AddToCardSection";

export default async function FoodDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    let food: Food;

    try {
        food = await getFoodById(id);
    } catch {
        notFound();
    }

    const restaurant = typeof food.restaurantId === "object" ? food.restaurantId : null;

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">

                {/* Back link */}
                <Link
                    href="/user/dashboard"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Home
                </Link>

                <div className="grid md:grid-cols-2 gap-10">

                    {/* Left — Image */}
                    <div className="space-y-4">
                        <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden bg-muted shadow-md">
                            <Image
                                src={food.image}
                                alt={food.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            {food.isPopular && (
                                <span className="absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold shadow-md">
                                    <Flame className="h-3 w-3" /> Popular
                                </span>
                            )}
                        </div>

                        {/* Restaurant card */}
                        {restaurant && (
                            <Link
                                href={`/user/restaurants/${restaurant._id}`}
                                className="flex items-center gap-3 p-4 bg-muted/50 border border-border rounded-xl hover:border-orange-200 dark:hover:border-orange-800/50 transition-all group"
                            >
                                <div className="relative h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                                    <Image src={restaurant.image} alt={restaurant.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground">From restaurant</p>
                                    <p className="font-semibold text-sm">{restaurant.name}</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                        <span className="text-xs text-muted-foreground">{restaurant.rating}</span>
                                    </div>
                                </div>
                                <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180 group-hover:text-orange-500 transition-colors" />
                            </Link>
                        )}
                    </div>

                    {/* Right — Details */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="space-y-2">
                            <span className="inline-block text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                                {food.category}
                            </span>
                            <h1 className="text-3xl font-extrabold tracking-tight">{food.name}</h1>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className={`h-4 w-4 ${i <= Math.round(food.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                                    ))}
                                    <span className="text-sm font-semibold ml-1">{food.rating}</span>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-orange-500">Rs. {food.price}</span>
                            <span className="text-sm text-muted-foreground">per serving</span>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm">Description</h3>
                            <p className="text-muted-foreground leading-relaxed">{food.description}</p>
                        </div>

                        {/* Delivery info from restaurant */}
                        {restaurant && typeof restaurant !== "string" && restaurant.deliveryTime && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2.5 p-3 bg-muted/50 rounded-xl">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Delivery time</p>
                                        <p className="text-sm font-semibold">{restaurant.deliveryTime}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2.5 p-3 bg-muted/50 rounded-xl">
                                    <Truck className="h-4 w-4 text-orange-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Delivery fee</p>
                                        <p className="text-sm font-semibold">Rs. {restaurant.deliveryFee}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-border" />

                        {/* Add to cart — client component for interactivity */}
                        <AddToCartSection food={food} />
                    </div>
                </div>
            </div>
        </div>
    );
}