import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { HttpError } from './errors/http-error';
import reviewRoutes from "./routes/review.route";

// Import routes
import authRoutes from "./routes/auth.route";
import restaurantRoutes from "./routes/restaurant.route";
import foodRoutes from "./routes/food.route";
import orderRoutes from "./routes/order.route";
import adminUserRoutes from "./routes/admin/user.route";
import adminRestaurantRoutes from "./routes/admin/restaurant.route";
import adminFoodRoutes from "./routes/admin/food.route";
import adminMiscRoutes from "./routes/admin/misc.route";
import paymentRoutes from "./routes/payment.route";

const app: Application = express();

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3003', 'http://192.168.1.78:3000'],
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(cors(corsOptions));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public API Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Admin API Routes
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/restaurants', adminRestaurantRoutes);
app.use('/api/admin/foods', adminFoodRoutes);
app.use('/api/admin', adminMiscRoutes);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ success: true, message: "Foodify API is running!" });
});

app.use((err: Error, req: Request, res: Response, next: Function) => {
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    return res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

export default app;