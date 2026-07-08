import multer from "multer";
import path from "path";
import fs from "fs";

function makeUploader(folder: string) {
    const dir = path.join(__dirname, `../../uploads/${folder}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, dir),
        filename: (req, file, cb) => {
            const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            cb(null, `${unique}${path.extname(file.originalname)}`);
        },
    });

    return multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => cb(null, true),
    }).single("image");
}

export const uploadRestaurantImage = makeUploader("restaurants");
export const uploadFoodImage = makeUploader("foods");