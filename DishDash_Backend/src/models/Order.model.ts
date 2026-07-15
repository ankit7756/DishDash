import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/encryption";

// order item sub-schema
const orderItemSchema = new mongoose.Schema({
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",
        required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    restaurantName: { type: String, required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    // SECURITY FEATURE: field-level encryption at rest (AES-256-CBC) — see
    // User.model.ts for the full rationale. Same transparent set/get pattern.
    deliveryAddress: {
        type: String,
        required: true,
        set: (value: string) => (value ? encrypt(value) : value),
        get: (value: string) => (value ? decrypt(value) : value),
    },
    phone: {
        type: String,
        required: true,
        set: (value: string) => (value ? encrypt(value) : value),
        get: (value: string) => (value ? decrypt(value) : value),
    },
    paymentMethod: {
        type: String,
        enum: ["Cash on Delivery", "Khalti"],
        default: "Cash on Delivery"
    },
    // SECURITY / TRANSACTION FEATURE: real Khalti ePayment tracking. pidx is
    // Khalti's own transaction reference; paymentStatus is deliberately
    // separate from the fulfillment `status` field below — payment state and
    // delivery state are different concerns and shouldn't be conflated.
    khaltiPidx: { type: String, default: null },
    paymentStatus: {
        type: String,
        enum: ["unpaid", "pending", "completed", "failed", "refunded"],
        default: "unpaid",
    },
    status: {
        type: String,
        enum: ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"],
        default: "pending"
    },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
});

export const OrderModel = mongoose.model("Order", orderSchema);