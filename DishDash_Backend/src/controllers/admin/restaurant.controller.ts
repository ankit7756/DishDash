import { Request, Response } from "express";
import { RestaurantModel } from "../../models/Restaurant.model";
import { BASE_URL } from "../../config";
import path from "path";
import fs from "fs";

const formatImage = (image: string | null | undefined, folder: string): string | null => {
    if (!image) return null;
    if (image.startsWith("http")) return image; // already a full URL (Unsplash, etc.)
    return `${BASE_URL}/uploads/${folder}/${image}`;
};

export class AdminRestaurantController {

    async getAllRestaurants(req: Request, res: Response) {
        try {
            const { page = "1", size = "10", search } = req.query as any;
            const pageNum = parseInt(page);
            const pageSize = parseInt(size);
            const query = search
                ? { name: { $regex: search, $options: "i" } }
                : {};

            const [restaurants, total] = await Promise.all([
                RestaurantModel.find(query)
                    .skip((pageNum - 1) * pageSize)
                    .limit(pageSize)
                    .sort({ createdAt: -1 }),
                RestaurantModel.countDocuments(query),
            ]);

            const formatted = restaurants.map((r) => ({
                ...r.toObject(),
                image: formatImage(r.image, "restaurants"),
            }));

            return res.status(200).json({
                success: true,
                data: formatted,
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

    async getRestaurantById(req: Request, res: Response) {
        try {
            const restaurant = await RestaurantModel.findById(req.params.id);
            if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });
            return res.status(200).json({
                success: true,
                data: {
                    ...restaurant.toObject(),
                    image: formatImage(restaurant.image, "restaurants"),
                },
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async createRestaurant(req: Request, res: Response) {
        try {
            const data = { ...req.body };
            if (req.file) data.image = req.file.filename;
            if (data.categories && typeof data.categories === "string") {
                data.categories = data.categories.split(",").map((c: string) => c.trim()).filter(Boolean);
            }
            if (!data.image) return res.status(400).json({ success: false, message: "Restaurant image is required" });

            const restaurant = await RestaurantModel.create(data);
            return res.status(201).json({
                success: true,
                message: "Restaurant created",
                data: {
                    ...restaurant.toObject(),
                    image: formatImage(restaurant.image, "restaurants"),
                },
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateRestaurant(req: Request, res: Response) {
        try {
            const restaurant = await RestaurantModel.findById(req.params.id);
            if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

            const data = { ...req.body };
            if (req.file) {
                // Delete old image only if it's a local file (not an external URL)
                if (restaurant.image && !restaurant.image.startsWith("http")) {
                    const oldPath = path.join(__dirname, "../../../uploads/restaurants", restaurant.image);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
                data.image = req.file.filename;
            }
            if (data.categories && typeof data.categories === "string") {
                data.categories = data.categories.split(",").map((c: string) => c.trim()).filter(Boolean);
            }

            const updated = await RestaurantModel.findByIdAndUpdate(req.params.id, data, { new: true });
            return res.status(200).json({
                success: true,
                message: "Restaurant updated",
                data: {
                    ...updated!.toObject(),
                    image: formatImage(updated!.image, "restaurants"),
                },
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteRestaurant(req: Request, res: Response) {
        try {
            const restaurant = await RestaurantModel.findById(req.params.id);
            if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found" });

            // Only delete local files, not external URLs
            if (restaurant.image && !restaurant.image.startsWith("http")) {
                const imgPath = path.join(__dirname, "../../../uploads/restaurants", restaurant.image);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            }

            await RestaurantModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ success: true, message: "Restaurant deleted" });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}