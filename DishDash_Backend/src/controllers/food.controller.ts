import { Request, Response } from "express";
import { FoodModel } from "../models/Food.model";

export const getAllFoods = async (req: Request, res: Response) => {
    try {
        const foods = await FoodModel.find({ isAvailable: true })
            .populate("restaurantId", "name image rating")
            .sort({ rating: -1 });

        res.status(200).json({
            success: true,
            count: foods.length,
            data: foods,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get foods by restaurant
export const getFoodsByRestaurant = async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.params;

        const foods = await FoodModel.find({
            restaurantId,
            isAvailable: true,
        }).sort({ isPopular: -1, rating: -1 });

        res.status(200).json({
            success: true,
            count: foods.length,
            data: foods,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get single food
export const getFoodById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const food = await FoodModel.findById(id)
            .populate("restaurantId", "name image rating deliveryTime deliveryFee");

        if (!food) {
            return res.status(404).json({ message: "Food not found" });
        }

        res.status(200).json({
            success: true,
            data: food,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get popular foods
export const getPopularFoods = async (req: Request, res: Response) => {
    try {
        const foods = await FoodModel.find({
            isPopular: true,
            isAvailable: true,
        })
            .populate("restaurantId", "name image rating")
            .limit(10)
            .sort({ rating: -1 });

        res.status(200).json({
            success: true,
            count: foods.length,
            data: foods,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};