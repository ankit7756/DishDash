import dotenv from "dotenv";
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || "foodify_secret_key";

export const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/foodify";

export const PORT = Number(process.env.PORT) || 5050;

export const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Add to existing exports
export const EMAIL_USER = process.env.EMAIL_USER || "";
export const EMAIL_PASS = process.env.EMAIL_PASS || "";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";