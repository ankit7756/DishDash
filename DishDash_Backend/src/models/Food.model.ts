import mongoose from "mongoose";

// Food Schema
const foodSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: true
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    isAvailable: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
}, { timestamps: true });

export const FoodModel = mongoose.model("Food", foodSchema);