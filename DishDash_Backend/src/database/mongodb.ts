import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("MongoDB connected");
    } catch (error) {
        console.log("DB Error:", error);
        process.exit(1);
    }
};

export async function connectDatabaseTest() {
    try {
        await mongoose.connect(MONGODB_URI + "_test");
        console.log("Connected to MongoDB Test");
    } catch (error) {
        console.error("Database Error:", error);
        process.exit(1);
    }
}
