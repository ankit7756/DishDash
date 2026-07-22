"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ShoppingCart, Plus, Minus, Trash2, ArrowRight,
    UtensilsCrossed, Tag, Truck, ChevronRight, AlertTriangle
} from "lucide-react";
import { useCartStore, cartSubtotal, cartItemCount } from "@/store/cartStore";

const DELIVERY_FEE = 50;

export default function CartPage() {
    const { items, restaurantName, updateQuantity, removeItem, clearCart } = useCartStore();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const router = useRouter();

    const subtotal = cartSubtotal(items);
    const total = subtotal + DELIVERY_FEE;
    const count = cartItemCount(items);

    // ── Empty state ──────────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
                <div className="relative mb-8">
                    {/* Big decorative emoji */}
                    <div className="text-8xl mb-2 select-none">🛒</div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        <span className="text-2xl animate-bounce" style={{ animationDelay: "0ms" }}>🍕</span>
                        <span className="text-2xl animate-bounce" style={{ animationDelay: "150ms" }}>🍔</span>
                        <span className="text-2xl animate-bounce" style={{ animationDelay: "300ms" }}>🍜</span>
                    </div>
                </div>

                <h2 className="text-3xl font-extrabold mb-3 mt-4">Your cart is empty</h2>
                <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                    Looks like you haven't added anything yet. Explore our restaurants and find something delicious!
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href="/user/dashboard"
                        className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold hover:from-orange-600 hover:to-pink-700 shadow-md transition-all duration-200"
                    >
                        <UtensilsCrossed className="h-5 w-5" />
                        Browse Menu
                    </Link>
                    <Link
                        href="/user/restaurants"
                        className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-orange-500 text-orange-500 font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                    >
                        All Restaurants
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Fun little tagline */}
                <p className="mt-12 text-xs text-muted-foreground/60">
                    ⚡ Fast delivery · 🔒 Secure payment · ⭐ Top rated restaurants
                </p>
            </div>
        );
    }

    // ── Filled cart ──────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2.5">
                            <ShoppingCart className="h-7 w-7 text-orange-500" />
                            Your Cart
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {count} item{count !== 1 ? "s" : ""} from{" "}
                            <span className="font-semibold text-foreground">{restaurantName}</span>
                        </p>
                    </div>

                    {/* Clear cart */}
                    {showClearConfirm ? (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            <span className="text-sm text-red-600 dark:text-red-400 font-medium">Clear all?</span>
                            <button
                                onClick={() => { clearCart(); setShowClearConfirm(false); }}
                                className="text-sm font-bold text-red-600 hover:text-red-700 ml-1"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                No
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowClearConfirm(true)}
                            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear Cart
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Items list ── */}
                    <div className="lg:col-span-2 space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.foodId}
                                className="flex gap-4 bg-background border border-border rounded-2xl p-4 hover:border-orange-200 dark:hover:border-orange-800/50 transition-all duration-200"
                            >
                                {/* Image */}
                                <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-sm leading-tight truncate">{item.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">{item.restaurantName}</p>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.foodId)}
                                            className="flex-shrink-0 p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                        {/* Price */}
                                        <span className="font-bold text-orange-500 tabular-nums">
                                            Rs. {item.price * item.quantity}
                                        </span>

                                        {/* Quantity controls */}
                                        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-0.5">
                                            <button
                                                onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
                                                className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-background text-foreground/70 hover:text-foreground transition-all"
                                            >
                                                <Minus className="h-3.5 w-3.5" />
                                            </button>
                                            <span className="text-sm font-bold w-5 text-center tabular-nums">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                                                className="h-7 w-7 rounded-md flex items-center justify-center bg-orange-500 text-white hover:bg-orange-600 transition-all"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add more */}
                        <Link
                            href={`/user/restaurants`}
                            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-orange-400 hover:text-orange-500 text-sm font-medium transition-all duration-200"
                        >
                            <Plus className="h-4 w-4" />
                            Add more items
                        </Link>
                    </div>

                    {/* ── Bill Details ── */}
                    <div className="lg:col-span-1">
                        <div className="bg-background border border-border rounded-2xl p-5 space-y-4 sticky top-24">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <Tag className="h-5 w-5 text-orange-500" />
                                Bill Details
                            </h2>

                            <div className="space-y-3 text-sm">
                                {/* Per item breakdown */}
                                {items.map((item) => (
                                    <div key={item.foodId} className="flex items-center justify-between text-foreground/70">
                                        <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                                        <span className="tabular-nums flex-shrink-0">Rs. {item.price * item.quantity}</span>
                                    </div>
                                ))}

                                <div className="h-px bg-border my-1" />

                                <div className="flex items-center justify-between text-foreground/70">
                                    <span>Item Total</span>
                                    <span className="font-medium tabular-nums">Rs. {subtotal}</span>
                                </div>

                                <div className="flex items-center justify-between text-foreground/70">
                                    <span className="flex items-center gap-1.5">
                                        <Truck className="h-3.5 w-3.5" />
                                        Delivery Fee
                                    </span>
                                    <span className="font-medium tabular-nums">Rs. {DELIVERY_FEE}</span>
                                </div>

                                <div className="h-px bg-border my-1" />

                                <div className="flex items-center justify-between font-bold text-base">
                                    <span>Grand Total</span>
                                    <span className="text-orange-500 tabular-nums">Rs. {total}</span>
                                </div>
                            </div>

                            {/* Savings note */}
                            <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl px-3 py-2">
                                <span className="text-green-600 dark:text-green-400 text-xs font-medium">
                                    🎉 You save Rs. 0 on this order
                                </span>
                            </div>

                            {/* Checkout button */}
                            <button
                                onClick={() => router.push("/user/checkout")}
                                className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-pink-600 text-white font-bold hover:from-orange-600 hover:to-pink-700 shadow-md transition-all duration-200 group"
                            >
                                <span>Proceed to Checkout</span>
                                <div className="flex items-center gap-1">
                                    <span className="tabular-nums">Rs. {total}</span>
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </button>

                            {/* Trust note */}
                            <p className="text-center text-xs text-muted-foreground">
                                🔒 Secure checkout · Cancel anytime
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}