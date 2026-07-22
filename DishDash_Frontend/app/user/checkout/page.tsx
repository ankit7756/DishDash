"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    MapPin, Phone, ChevronRight, CheckCircle2,
    Banknote, CreditCard, ShoppingBag, Truck,
    X, Delete, Mail, Loader2, CheckCircle, ChevronLeft
} from "lucide-react";
import { useCartStore, cartSubtotal, cartItemCount } from "@/store/cartStore";
import { createOrder, sendKhaltiOTP, verifyKhaltiOTP } from "@/lib/api/order-api";
import { addNotification } from "@/lib/notifications";

const DELIVERY_FEE = 50;
type PaymentMethod = "Cash on Delivery" | "Khalti";
type KhaltiStep = "mpin" | "otp" | "processing" | "success";

const NUMPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

// ─── Khalti Modal ────────────────────────────────────────────────────────────
function KhaltiModal({
    total,
    restaurantName,
    onSuccess,
    onClose,
    orderPayload,
}: {
    total: number;
    restaurantName: string;
    onSuccess: () => void;
    onClose: () => void;
    orderPayload: Parameters<typeof createOrder>[0];
}) {
    const [step, setStep] = useState<KhaltiStep>("mpin");
    const [phone, setPhone] = useState("9800000001");
    const [mpin, setMpin] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Close on overlay click
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current && step !== "processing" && step !== "success") {
            onClose();
        }
    };

    const handleMpinKey = (key: string) => {
        if (key === "del") setMpin((p) => p.slice(0, -1));
        else if (mpin.length < 4) setMpin((p) => p + key);
    };

    const handleSendOTP = async () => {
        if (phone.trim().length < 10) { setError("Enter a valid phone number"); return; }
        if (mpin.length < 4) { setError("Enter your 4-digit MPIN"); return; }
        setLoading(true);
        setError(null);
        try {
            await sendKhaltiOTP({ phone: phone.trim(), amount: total.toString(), restaurantName });
            setStep("otp");
        } catch {
            setError("Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return; }
        setLoading(true);
        setError(null);
        setStep("processing");
        try {
            await verifyKhaltiOTP(otp);
            await createOrder(orderPayload);
            setStep("success");
            setTimeout(onSuccess, 2200);
        } catch (err: any) {
            setStep("otp");
            setError(err.response?.data?.message || err.message || "Invalid OTP. Try again.");
            setLoading(false);
        }
    };

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <div className="w-full max-w-md bg-background rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                {/* Purple header */}
                <div className="bg-[#5C2D91] px-6 py-5 relative">
                    {step !== "processing" && step !== "success" && (
                        <button
                            onClick={step === "otp"
                                ? () => { setStep("mpin"); setOtp(""); setError(null); }
                                : onClose}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                        >
                            {step === "otp" ? <ChevronLeft className="h-5 w-5" /> : <X className="h-5 w-5" />}
                        </button>
                    )}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 mb-2">
                            <span className="bg-white rounded-md px-2 py-0.5 text-[#5C2D91] font-black text-sm">Khalti</span>
                            <span className="text-white/60 text-xs">Secure Payment</span>
                        </div>
                        <p className="text-white/70 text-xs">Amount to Pay</p>
                        <p className="text-white font-extrabold text-3xl tabular-nums">Rs. {total}</p>
                        <p className="text-white/50 text-xs mt-0.5">to {restaurantName}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">

                    {/* ── MPIN Step ── */}
                    {step === "mpin" && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold">Enter Khalti details</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Your registered number and 4-digit MPIN</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-foreground/70">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="98XXXXXXXX"
                                    className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5C2D91]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-foreground/70">MPIN</label>
                                {/* PIN dots */}
                                <div className="flex items-center justify-center gap-4 py-1">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className={`h-3.5 w-3.5 rounded-full border-2 transition-all ${i < mpin.length ? "bg-[#5C2D91] border-[#5C2D91]" : "bg-transparent border-border"
                                            }`} />
                                    ))}
                                </div>

                                {/* Numpad */}
                                <div className="grid grid-cols-3 gap-2">
                                    {NUMPAD.map((key, i) => {
                                        if (key === "") return <div key={i} />;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleMpinKey(key)}
                                                className="h-11 rounded-xl bg-muted/50 hover:bg-muted active:scale-95 flex items-center justify-center transition-all"
                                            >
                                                {key === "del"
                                                    ? <Delete className="h-4 w-4 text-foreground/60" />
                                                    : <span className="text-lg font-semibold">{key}</span>
                                                }
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {error && (
                                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
                            )}

                            <button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-[#5C2D91] text-white font-bold hover:bg-[#4a2275] disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Continue
                            </button>
                            <p className="text-center text-[11px] text-muted-foreground">🔒 256-bit SSL Secured</p>
                        </div>
                    )}

                    {/* ── OTP Step ── */}
                    {step === "otp" && (
                        <div className="space-y-5 text-center">
                            <div className="h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
                                <Mail className="h-7 w-7 text-[#5C2D91]" />
                            </div>

                            <div>
                                <h3 className="font-bold text-lg">OTP Verification</h3>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
                                    A 6-digit OTP has been sent to your registered email. Check your inbox.
                                </p>
                            </div>

                            <input
                                autoFocus
                                type="number"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                                placeholder="000000"
                                className="w-full text-center text-3xl font-bold tracking-[0.6em] rounded-xl border border-border bg-muted/30 px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#5C2D91] placeholder:tracking-[0.6em] placeholder:text-muted-foreground/40"
                            />

                            {error && (
                                <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
                            )}

                            <button
                                onClick={handleVerifyOTP}
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-[#5C2D91] text-white font-bold hover:bg-[#4a2275] disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Verify & Pay
                            </button>

                            <button
                                onClick={() => { setStep("mpin"); setOtp(""); setMpin(""); setError(null); }}
                                className="text-sm text-[#5C2D91] font-semibold hover:underline"
                            >
                                Resend OTP
                            </button>
                        </div>
                    )}

                    {/* ── Processing ── */}
                    {step === "processing" && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="h-10 w-10 text-[#5C2D91] animate-spin" />
                            <div className="text-center">
                                <p className="font-bold">Processing Payment...</p>
                                <p className="text-xs text-muted-foreground mt-1">Do not close this window</p>
                            </div>
                        </div>
                    )}

                    {/* ── Success ── */}
                    {step === "success" && (
                        <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
                            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xl font-extrabold text-green-600 dark:text-green-400">Payment Successful!</p>
                                <p className="text-sm text-muted-foreground mt-1">Rs. {total} paid to {restaurantName}</p>
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Placing your order...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Checkout Page ────────────────────────────────────────────────────────────
export default function CheckoutPage() {
    const router = useRouter();
    const { items, restaurantId, restaurantName, clearCart } = useCartStore();
    const [address, setAddress] = useState("Patan, Bagmati Province, Nepal");
    const [phone, setPhone] = useState("9800000001");
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash on Delivery");
    const [showKhaltiModal, setShowKhaltiModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const subtotal = cartSubtotal(items);
    const total = subtotal + DELIVERY_FEE;
    const count = cartItemCount(items);

    useEffect(() => {
        if (items.length === 0 && !orderSuccess) router.replace("/user/cart");
    }, [items.length, orderSuccess, router]);

    if (items.length === 0 && !orderSuccess) return null;

    const orderPayload = {
        restaurantId: restaurantId!,
        restaurantName: restaurantName!,
        items: items.map((i) => ({
            foodId: i.foodId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
        })),
        subtotal,
        deliveryFee: DELIVERY_FEE,
        totalAmount: total,
        deliveryAddress: address.trim(),
        phone: phone.trim(),
        paymentMethod: paymentMethod,
    };

    const handlePlaceOrder = async () => {
        if (!address.trim() || !phone.trim()) {
            setError("Please fill in delivery address and phone number.");
            return;
        }
        if (paymentMethod === "Khalti") {
            setShowKhaltiModal(true);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await createOrder(orderPayload);
            setOrderSuccess(true);
            clearCart();
            addNotification(
                "Order Placed! 🎉",
                `Your order from ${restaurantName} has been placed successfully.`,
                "order"
            );
            setTimeout(() => router.push("/user/orders"), 2000);
        } catch (err: any) {
            setError(err.message || "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKhaltiSuccess = () => {
        setShowKhaltiModal(false);
        setOrderSuccess(true);
        clearCart();
        addNotification(
            "Order Placed! 🎉",
            `Your order from ${restaurantName} has been placed and paid via Khalti.`,
            "order"
        );
        setTimeout(() => router.push("/user/orders"), 2000);
    };

    // ── Order success state ──
    if (orderSuccess) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center space-y-5">
                <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="h-14 w-14 text-green-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-extrabold">Order Placed! 🎉</h2>
                    <p className="text-muted-foreground text-sm mt-2">
                        Your order from <strong>{restaurantName}</strong> has been confirmed.
                    </p>
                    {paymentMethod === "Khalti" && (
                        <p className="text-green-600 dark:text-green-400 text-sm font-medium mt-1">
                            ✓ Paid via Khalti
                        </p>
                    )}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Redirecting to your orders...
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Khalti Modal */}
            {showKhaltiModal && (
                <KhaltiModal
                    total={total}
                    restaurantName={restaurantName ?? "Restaurant"}
                    onSuccess={handleKhaltiSuccess}
                    onClose={() => setShowKhaltiModal(false)}
                    orderPayload={{ ...orderPayload, paymentMethod: "Khalti" }}
                />
            )}

            <div className="min-h-screen bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-extrabold">Checkout</h1>
                        <p className="text-muted-foreground text-sm mt-1">Complete your order details</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                        {/* ── Left: Form ── */}
                        <div className="lg:col-span-3 space-y-5">

                            {/* Delivery Address */}
                            <div className="bg-background border border-border rounded-2xl p-5 space-y-3">
                                <h2 className="font-bold text-base flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-orange-500" />
                                    Delivery Address
                                </h2>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    rows={2}
                                    placeholder="Enter your delivery address"
                                    className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none placeholder:text-muted-foreground"
                                />
                            </div>

                            {/* Phone */}
                            <div className="bg-background border border-border rounded-2xl p-5 space-y-3">
                                <h2 className="font-bold text-base flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-orange-500" />
                                    Phone Number
                                </h2>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="98XXXXXXXX"
                                    className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-muted-foreground"
                                />
                            </div>

                            {/* Payment Method */}
                            <div className="bg-background border border-border rounded-2xl p-5 space-y-4">
                                <h2 className="font-bold text-base flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-orange-500" />
                                    Payment Method
                                </h2>

                                <div className="space-y-3">
                                    {/* COD */}
                                    <button
                                        onClick={() => setPaymentMethod("Cash on Delivery")}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${paymentMethod === "Cash on Delivery"
                                            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                            : "border-border hover:border-orange-300"
                                            }`}
                                    >
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${paymentMethod === "Cash on Delivery" ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
                                            }`}>
                                            <Banknote className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className={`font-semibold text-sm ${paymentMethod === "Cash on Delivery" ? "text-orange-600 dark:text-orange-400" : ""}`}>
                                                Cash on Delivery
                                            </p>
                                            <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                                        </div>
                                        {paymentMethod === "Cash on Delivery" && (
                                            <CheckCircle2 className="h-5 w-5 text-orange-500 flex-shrink-0" />
                                        )}
                                    </button>

                                    {/* Khalti */}
                                    <button
                                        onClick={() => setPaymentMethod("Khalti")}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${paymentMethod === "Khalti"
                                            ? "border-[#5C2D91] bg-purple-50 dark:bg-purple-900/20"
                                            : "border-border hover:border-purple-300"
                                            }`}
                                    >
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${paymentMethod === "Khalti" ? "bg-[#5C2D91] text-white" : "bg-muted text-muted-foreground"
                                            }`}>
                                            K
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className={`font-semibold text-sm ${paymentMethod === "Khalti" ? "text-[#5C2D91]" : ""}`}>
                                                Khalti Digital Wallet
                                            </p>
                                            <p className="text-xs text-muted-foreground">Fast & secure digital payment</p>
                                        </div>
                                        {paymentMethod === "Khalti" && (
                                            <CheckCircle2 className="h-5 w-5 text-[#5C2D91] flex-shrink-0" />
                                        )}
                                    </button>
                                </div>

                                {paymentMethod === "Khalti" && (
                                    <div className="flex items-start gap-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl px-3 py-2.5 text-xs text-purple-700 dark:text-purple-300">
                                        <span className="flex-shrink-0 mt-0.5">ℹ️</span>
                                        A payment modal will appear. Enter your Khalti MPIN and verify with the OTP sent to your email.
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* ── Right: Order Summary ── */}
                        <div className="lg:col-span-2">
                            <div className="bg-background border border-border rounded-2xl p-5 space-y-5 sticky top-24">

                                <h2 className="font-bold text-base flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-orange-500" />
                                    Order Summary
                                </h2>

                                {/* Restaurant */}
                                <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {restaurantName?.[0] ?? "R"}
                                    </div>
                                    <div>
                                        <p className="text-[11px] text-muted-foreground">From</p>
                                        <p className="font-semibold text-sm">{restaurantName}</p>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                                    {items.map((item) => (
                                        <div key={item.foodId} className="flex items-center gap-3">
                                            <div className="relative h-9 w-9 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                                            </div>
                                            <span className="text-sm font-semibold tabular-nums flex-shrink-0">
                                                Rs. {item.price * item.quantity}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Bill */}
                                <div className="space-y-2 pt-2 border-t border-border text-sm">
                                    <div className="flex justify-between text-foreground/70">
                                        <span>Subtotal ({count} item{count !== 1 ? "s" : ""})</span>
                                        <span className="tabular-nums">Rs. {subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-foreground/70">
                                        <span className="flex items-center gap-1.5">
                                            <Truck className="h-3.5 w-3.5" />
                                            Delivery Fee
                                        </span>
                                        <span className="tabular-nums">Rs. {DELIVERY_FEE}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-base pt-1.5 border-t border-border">
                                        <span>Grand Total</span>
                                        <span className="text-orange-500 tabular-nums">Rs. {total}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed ${paymentMethod === "Khalti"
                                        ? "bg-[#5C2D91] hover:bg-[#4a2275] text-white"
                                        : "bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white"
                                        }`}
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : paymentMethod === "Khalti" ? (
                                        <>
                                            <span className="font-black">K</span>
                                            Pay with Khalti · Rs. {total}
                                        </>
                                    ) : (
                                        <>
                                            Place Order · Rs. {total}
                                            <ChevronRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-muted-foreground">
                                    🔒 Your payment information is secure
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}