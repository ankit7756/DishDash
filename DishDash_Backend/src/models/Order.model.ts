import mongoose from "mongoose";

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
    deliveryAddress: { type: String, required: true },
    phone: { type: String, required: true },
    paymentMethod: {
        type: String,
        enum: ["Cash on Delivery", "eSewa", "Khalti"],
        default: "Cash on Delivery"
    },
    status: {
        type: String,
        enum: ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"],
        default: "pending"
    },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
}, { timestamps: true });

export const OrderModel = mongoose.model("Order", orderSchema);