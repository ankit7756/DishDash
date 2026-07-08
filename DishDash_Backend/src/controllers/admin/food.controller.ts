import { Request, Response } from "express";
import { FoodModel } from "../../models/Food.model";
import { BASE_URL } from "../../config";
import path from "path";
import fs from "fs";

const formatFood = (food: any) => ({
    ...food.toObject(),
    image: food.image
        ? food.image.startsWith("http")
            ? food.image  // already a full URL (Unsplash, etc.)
            : `${BASE_URL}/uploads/foods/${food.image}`
        : null,
});

export class AdminFoodController {

    async getAllFoods(req: Request, res: Response) {
        try {
            const { page = "1", size = "10", search, restaurantId } = req.query as any;
            const pageNum = parseInt(page);
            const pageSize = parseInt(size);

            const query: any = {};
            if (search) query.name = { $regex: search, $options: "i" };
            if (restaurantId) query.restaurantId = restaurantId;

            const [foods, total] = await Promise.all([
                FoodModel.find(query)
                    .populate("restaurantId", "name")
                    .skip((pageNum - 1) * pageSize)
                    .limit(pageSize)
                    .sort({ createdAt: -1 }),
                FoodModel.countDocuments(query),
            ]);

            return res.status(200).json({
                success: true,
                data: foods.map(formatFood),
                pagination: {
                    page: pageNum,
                    size: pageSize,
                    totalItems: total,
                    totalPages: Math.ceil(total / pageSize),
                },
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async getFoodById(req: Request, res: Response) {
        try {
            const food = await FoodModel.findById(req.params.id).populate("restaurantId", "name");
            if (!food) return res.status(404).json({ success: false, message: "Food not found" });
            return res.status(200).json({ success: true, data: formatFood(food) });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async createFood(req: Request, res: Response) {
        try {
            const data = { ...req.body };
            if (req.file) data.image = req.file.filename;
            if (!data.image) return res.status(400).json({ success: false, message: "Food image is required" });

            data.price = parseFloat(data.price);
            data.isAvailable = data.isAvailable === "true" || data.isAvailable === true;
            data.isPopular = data.isPopular === "true" || data.isPopular === true;

            const food = await FoodModel.create(data);
            const populated = await FoodModel.findById(food._id).populate("restaurantId", "name");
            return res.status(201).json({ success: true, message: "Food created", data: formatFood(populated!) });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateFood(req: Request, res: Response) {
        try {
            const food = await FoodModel.findById(req.params.id);
            if (!food) return res.status(404).json({ success: false, message: "Food not found" });

            const data = { ...req.body };
            if (req.file) {
                // Only delete old file if it's a local file, not an external URL
                if (food.image && !food.image.startsWith("http")) {
                    const oldPath = path.join(__dirname, "../../../uploads/foods", food.image);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                data.image = req.file.filename;
            }
            if (data.price) data.price = parseFloat(data.price);
            if (data.isAvailable !== undefined) data.isAvailable = data.isAvailable === "true" || data.isAvailable === true;
            if (data.isPopular !== undefined) data.isPopular = data.isPopular === "true" || data.isPopular === true;

            const updated = await FoodModel.findByIdAndUpdate(req.params.id, data, { new: true }).populate("restaurantId", "name");
            return res.status(200).json({ success: true, message: "Food updated", data: formatFood(updated!) });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteFood(req: Request, res: Response) {
        try {
            const food = await FoodModel.findById(req.params.id);
            if (!food) return res.status(404).json({ success: false, message: "Food not found" });

            // Only delete local files, not external URLs
            if (food.image && !food.image.startsWith("http")) {
                const imgPath = path.join(__dirname, "../../../uploads/foods", food.image);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }

            await FoodModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ success: true, message: "Food deleted" });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}