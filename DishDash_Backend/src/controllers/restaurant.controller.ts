import { Request, Response } from "express";
import { RestaurantModel } from "../models/Restaurant.model";
import { escapeRegex, toSafeString } from "../utils/sanitize";

export const getAllRestaurants = async (req: Request, res: Response) => {
    try {
        const restaurants = await RestaurantModel.find({ isOpen: true })
            .sort({ rating: -1 });

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single restaurant
export const getRestaurantById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const restaurant = await RestaurantModel.findById(id);

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        res.status(200).json({
            success: true,
            data: restaurant,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const searchRestaurants = async (req: Request, res: Response) => {
    try {
        // SECURITY FIX: `query` was previously passed straight into a MongoDB
        // $regex with zero validation or escaping — a NoSQL operator-injection
        // and ReDoS (regex denial-of-service) risk on a public, unauthenticated
        // endpoint. toSafeString rejects anything that isn't a plain string
        // (blocking the ?query[$ne]=x bracket-notation trick), and escapeRegex
        // neutralizes regex metacharacters so a crafted pattern can't cause
        // catastrophic backtracking.
        const rawQuery = toSafeString(req.query.query);
        if (!rawQuery) {
            return res.status(400).json({ message: "Search query is required" });
        }
        const safeQuery = escapeRegex(rawQuery);

        const restaurants = await RestaurantModel.find({
            $or: [
                { name: { $regex: safeQuery, $options: "i" } },
                { categories: { $regex: safeQuery, $options: "i" } },
                { description: { $regex: safeQuery, $options: "i" } },
            ],
            isOpen: true,
        }).sort({ rating: -1 });

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};