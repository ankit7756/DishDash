import mongoose from "mongoose";

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, default: 4.5 },
    deliveryTime: { type: String, required: true },
    deliveryFee: { type: Number, required: true },
    categories: [{ type: String }],
    isOpen: { type: Boolean, default: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
}, { timestamps: true });

export const RestaurantModel = mongoose.model("Restaurant", restaurantSchema);