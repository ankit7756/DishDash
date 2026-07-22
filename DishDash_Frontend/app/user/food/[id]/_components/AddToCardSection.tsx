"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { Food } from "@/lib/api/food-restaurant-api";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";

export default function AddToCartSection({ food }: { food: Food }) {
    const [quantity, setQuantity] = useState(1);
    const [justAdded, setJustAdded] = useState(false);
    const { addItem, replaceCart, restaurantId, items } = useCartStore();
    const router = useRouter();

    const restaurant = typeof food.restaurantId === "object" ? food.restaurantId : null;
    const foodRestaurantId = restaurant?._id ?? (typeof food.restaurantId === "string" ? food.restaurantId : "");
    const foodRestaurantName = restaurant?.name ?? "Restaurant";

    const increment = () => setQuantity((q) => q + 1);
    const decrement = () => setQuantity((q) => Math.max(1, q - 1));
    const total = food.price * quantity;

    const handleAddToCart = () => {
        const cartItem = {
            foodId: food._id,
            name: food.name,
            image: food.image,
            price: food.price,
            quantity,
            restaurantId: foodRestaurantId,
            restaurantName: foodRestaurantName,
        };

        // Different restaurant — ask to replace
        if (restaurantId && restaurantId !== foodRestaurantId && items.length > 0) {
            if (confirm(`Your cart has items from ${items[0]?.restaurantName}. Replace cart with items from ${foodRestaurantName}?`)) {
                replaceCart(cartItem);
                showAdded();
            }
            return;
        }

        addItem(cartItem);
        showAdded();
    };

    const showAdded = () => {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
    };

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <p className="text-sm font-semibold">Quantity</p>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-muted/50 rounded-xl p-1">
                        <button
                            onClick={decrement}
                            disabled={quantity <= 1}
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-foreground hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-lg font-bold w-8 text-center tabular-nums">{quantity}</span>
                        <button
                            onClick={increment}
                            className="h-9 w-9 rounded-lg flex items-center justify-center bg-orange-500 text-white hover:bg-orange-600 transition-all"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-2xl font-extrabold text-orange-500 tabular-nums">Rs. {total}</p>
                    </div>
                </div>
            </div>

            <button
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all duration-300 ${justAdded
                        ? "bg-green-500 text-white"
                        : "bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700"
                    }`}
            >
                {justAdded ? (
                    <>
                        <Check className="h-5 w-5" />
                        Added to Cart!
                    </>
                ) : (
                    <>
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart · Rs. {total}
                    </>
                )}
            </button>

            {justAdded && (
                <button
                    onClick={() => router.push("/user/cart")}
                    className="w-full py-3 rounded-xl border-2 border-orange-500 text-orange-500 font-semibold text-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all"
                >
                    View Cart →
                </button>
            )}
        </div>
    );
}