import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true, // one review per order
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true,
    },
    restaurantName: { type: String, required: true },
    foodItems: [{ type: String }], // just names for display
    stars: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, maxlength: 500, default: "" },
}, { timestamps: true });

export const ReviewModel = mongoose.model("Review", reviewSchema);