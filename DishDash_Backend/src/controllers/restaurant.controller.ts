import { Request, Response } from "express";
import { RestaurantModel } from "../models/Restaurant.model";

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
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const restaurants = await RestaurantModel.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { categories: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
            ],
            isOpen: true,
        } as any).sort({ rating: -1 });

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};